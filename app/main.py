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
@app.get("/api/tasks", response_model=List[Task])
async def get_tasks(
    estado: Optional[str] = Query(None, enum=["pendiente", "en_progreso", "completada"]),
    prioridad: Optional[str] = Query(None, enum=["baja", "media", "alta"]),
    db: Session = Depends(get_db)
):
    query = db.query(TaskModel)
    if estado:
        query = query.filter(TaskModel.estado == estado)
    if prioridad:
        query = query.filter(TaskModel.prioridad == prioridad)
    return query.all()

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