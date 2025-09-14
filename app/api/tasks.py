from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas.task import TaskCreate, TaskUpdate, Task
from app.models.task import TaskModel
from app.database import get_db
from datetime import datetime

router = APIRouter()

@router.get("/tasks", response_model=List[Task])
async def get_tasks(
    status: Optional[str] = Query(None, enum=["pendiente", "en_progreso", "completada"]),
    priority: Optional[str] = Query(None, enum=["baja", "media", "alta"]),
    db: Session = Depends(get_db)
):
    query = db.query(TaskModel)
    
    if status:
        query = query.filter(TaskModel.estado == status)
    if priority:
        query = query.filter(TaskModel.prioridad == priority)
        
    return query.all()

@router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return task

@router.post("/tasks", response_model=Task)
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

@router.put("/tasks/{task_id}", response_model=Task)
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

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    db.delete(db_task)
    db.commit()
    return {"message": "Tarea eliminada exitosamente"}