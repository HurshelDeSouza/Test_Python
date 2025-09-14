from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class TaskModel(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    descripcion = Column(String)
    estado = Column(String)  # pendiente, en_progreso, completada
    prioridad = Column(String)  # baja, media, alta
    fecha_creacion = Column(DateTime, default=datetime.now)
    fecha_vencimiento = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "estado": self.estado,
            "prioridad": self.prioridad,
            "fecha_creacion": self.fecha_creacion,
            "fecha_vencimiento": self.fecha_vencimiento
        }