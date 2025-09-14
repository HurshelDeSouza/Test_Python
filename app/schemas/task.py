from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=100)
    descripcion: str = Field(..., min_length=1)
    estado: str = Field(..., pattern="^(pendiente|en_progreso|completada)$")
    prioridad: str = Field(..., pattern="^(baja|media|alta)$")
    fecha_vencimiento: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    titulo: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = None
    estado: Optional[str] = Field(None, pattern="^(pendiente|en_progreso|completada)$")
    prioridad: Optional[str] = Field(None, pattern="^(baja|media|alta)$")

class Task(TaskBase):
    id: int
    fecha_creacion: datetime

    class Config:
        orm_mode = True