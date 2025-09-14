from fastapi import FastAPI, Request, Depends, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import engine, Base, get_db
from app.models.task import TaskModel
from app.schemas.task import Task, TaskCreate, TaskUpdate

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management System")

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Configurar templates
templates = Jinja2Templates(directory="app/templates")

# Ruta principal
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API endpoints
@app.get("/api/tasks")
async def get_tasks(
    estado: Optional[str] = Query(None, enum=["pendiente", "en_progreso", "completada"]),
    prioridad: Optional[str] = Query(None, enum=["baja", "media", "alta"]),
    page: int = Query(1, ge=1),
    per_page: int = Query(5, ge=1, le=100),
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

@app.get("/api/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return task

@app.post("/api/tasks", response_model=Task)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
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

@app.put("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Tarea eliminada exitosamente"}