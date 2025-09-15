from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=100, description="Título de la tarea")
    descripcion: str = Field(..., min_length=1, max_length=500, description="Descripción detallada de la tarea")
    estado: str = Field(..., pattern="^(pendiente|en_progreso|completada)$", description="Estado de la tarea")
    prioridad: str = Field(..., pattern="^(baja|media|alta)$", description="Prioridad de la tarea")
    fecha_vencimiento: Optional[datetime] = Field(None, description="Fecha de vencimiento opcional")

    @field_validator('titulo')
    @classmethod
    def titulo_no_vacio(cls, v):
        if not v.strip():
            raise ValueError('El título no puede estar vacío')
        return v.strip()

    @field_validator('descripcion')
    @classmethod
    def descripcion_no_vacia(cls, v):
        if not v.strip():
            raise ValueError('La descripción no puede estar vacía')
        return v.strip()

    @field_validator('fecha_vencimiento')
    @classmethod
    def fecha_vencimiento_futura(cls, v):
        if v is not None and v < datetime.now():
            raise ValueError('La fecha de vencimiento debe ser futura')
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, min_length=1, max_length=500)
    estado: Optional[str] = Field(None, pattern="^(pendiente|en_progreso|completada)$")
    prioridad: Optional[str] = Field(None, pattern="^(baja|media|alta)$")
    fecha_vencimiento: Optional[datetime] = None

    @field_validator('titulo')
    @classmethod
    def titulo_no_vacio(cls, v):
        if v is not None and not v.strip():
            raise ValueError('El título no puede estar vacío')
        return v.strip() if v else v

    @field_validator('descripcion')
    @classmethod
    def descripcion_no_vacia(cls, v):
        if v is not None and not v.strip():
            raise ValueError('La descripción no puede estar vacía')
        return v.strip() if v else v

    @field_validator('fecha_vencimiento')
    @classmethod
    def fecha_vencimiento_futura(cls, v):
        if v is not None and v < datetime.now():
            raise ValueError('La fecha de vencimiento debe ser futura')
        return v

class Task(TaskBase):
    id: int
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)