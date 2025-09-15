from fastapi import FastAPI, Request, Depends, HTTPException, Query, Path, status, Body
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
from datetime import datetime
from pydantic import ValidationError

from app.database import engine, Base, get_db
from app.models.task import TaskModel
from app.schemas.task import Task, TaskCreate, TaskUpdate

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Gestión de Tareas",
    description="API REST para gestionar tareas con funcionalidades CRUD completas",
    version="1.0.0"
)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Configurar templates
templates = Jinja2Templates(directory="app/templates")

# Manejador global de excepciones de validación
@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Datos de entrada inválidos",
            "details": exc.errors(),
            "message": "Por favor verifica los datos enviados"
        }
    )

# Manejador global de excepciones de base de datos
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Error de base de datos",
            "message": "Ha ocurrido un error interno. Por favor intenta nuevamente."
        }
    )

# Ruta principal
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API endpoints
@app.get("/api/tasks", summary="Listar tareas",
         description="Obtiene una lista paginada de tareas con opciones de filtrado")
async def get_tasks(
    estado: Optional[str] = Query(None, enum=["pendiente", "en_progreso", "completada"],
                                  description="Filtrar por estado"),
    prioridad: Optional[str] = Query(None, enum=["baja", "media", "alta"], description="Filtrar por prioridad"),
    search: Optional[str] = Query(None, min_length=1, max_length=100, description="Buscar en título y descripción"),
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(5, ge=1, le=100, description="Elementos por página"),
    db: Session = Depends(get_db)
):
    try:
        # Consulta base
        query = db.query(TaskModel)
        
        # Aplicar filtros
        if estado:
            query = query.filter(TaskModel.estado == estado)
        if prioridad:
            query = query.filter(TaskModel.prioridad == prioridad)
        if search:
            # Buscar en título y descripción (case insensitive)
            search_term = f"%{search}%"
            query = query.filter(
                (TaskModel.titulo.ilike(search_term)) |
                (TaskModel.descripcion.ilike(search_term))
            )
        
        # Calcular paginación
        total_items = query.count()
        total_pages = max((total_items + per_page - 1) // per_page, 1)
        
        # Asegurar que page está en rango válido
        page = min(max(1, page), total_pages)
        
        # Obtener tareas para la página actual
        tasks = query.order_by(TaskModel.fecha_creacion.desc())\
                    .offset((page - 1) * per_page)\
                    .limit(per_page)\
                    .all()
        
        # Convertir modelos a diccionarios
        tasks_list = []
        for task in tasks:
            tasks_list.append({
                "id": task.id,
                "titulo": task.titulo,
                "descripcion": task.descripcion,
                "estado": task.estado,
                "prioridad": task.prioridad,
                "fecha_creacion": task.fecha_creacion.isoformat() if task.fecha_creacion else None,
                "fecha_vencimiento": task.fecha_vencimiento.isoformat() if task.fecha_vencimiento else None
            })
        
        # Retornar respuesta estructurada
        return {
            "items": tasks_list,
            "pagination": {
                "total_items": total_items,
                "total_pages": total_pages,
                "current_page": page,
                "per_page": per_page,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
    except Exception as e:
        print(f"Error en get_tasks: {str(e)}")  # Debug
        raise HTTPException(
            status_code=500,
            detail=f"Error al cargar las tareas: {str(e)}"
        )

@app.get("/api/tasks/{task_id}", response_model=Task, summary="Obtener tarea por ID",
         description="Obtiene los detalles de una tarea específica por su ID")
async def get_task(task_id: int = Path(..., ge=1, description="ID de la tarea"), db: Session = Depends(get_db)):
    if task_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El ID de la tarea debe ser un número positivo"
        )

    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con ID {task_id} no encontrada"
        )
    return task

@app.post("/api/tasks", response_model=Task, summary="Crear nueva tarea",
          description="Crea una nueva tarea con los datos proporcionados")
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    try:
        db_task = TaskModel(
            titulo=task.titulo,
            descripcion=task.descripcion,
            estado=task.estado,
            prioridad=task.prioridad,
            fecha_vencimiento=task.fecha_vencimiento,
            fecha_creacion=datetime.now()
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la tarea: {str(e)}"
        )

@app.put("/api/tasks/{task_id}", response_model=Task, summary="Actualizar tarea",
         description="Actualiza una tarea existente con los datos proporcionados")
async def update_task(
    task_id: int = Path(..., ge=1, description="ID de la tarea a actualizar"),
    task_update: Optional[TaskUpdate] = Body(None),
    db: Session = Depends(get_db)
):
    if task_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El ID de la tarea debe ser un número positivo"
        )

    db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con ID {task_id} no encontrada"
        )

    if not task_update or not any(task_update.dict(exclude_unset=True).values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe proporcionar al menos un campo para actualizar"
        )

    try:
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)

        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la tarea: {str(e)}"
        )

@app.delete("/api/tasks/{task_id}", summary="Eliminar tarea",
            description="Elimina una tarea específica por su ID")
async def delete_task(task_id: int = Path(..., ge=1, description="ID de la tarea a eliminar"), db: Session = Depends(get_db)):
    if task_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El ID de la tarea debe ser un número positivo"
        )

    db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con ID {task_id} no encontrada"
        )

    try:
        db.delete(db_task)
        db.commit()
        return {
            "message": "Tarea eliminada exitosamente",
            "id": task_id,
            "titulo": db_task.titulo
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la tarea: {str(e)}"
        )