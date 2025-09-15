# Sistema de Gestión de Tareas

Una aplicación web completa para gestionar tareas con funcionalidades CRUD, filtros, búsqueda y paginación.

## 📋 Descripción

Esta aplicación permite gestionar tareas de manera eficiente con las siguientes características:
- ✅ Crear, leer, actualizar y eliminar tareas
- ✅ Filtrado por estado y prioridad
- ✅ Búsqueda por texto en título y descripción
- ✅ Paginación de resultados
- ✅ Interfaz web responsiva
- ✅ API REST completa
- ✅ Validación de datos
- ✅ Persistencia en base de datos SQLite

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido para APIs REST
- **SQLAlchemy**: ORM para manejo de base de datos
- **Pydantic**: Validación de datos y serialización
- **SQLite**: Base de datos ligera y sin configuración

### Frontend
- **HTML5**: Estructura de la interfaz
- **CSS3**: Estilos responsivos y modernos
- **JavaScript (Vanilla)**: Interactividad y consumo de API

### Herramientas de Desarrollo
- **Uvicorn**: Servidor ASGI para FastAPI
- **Jinja2**: Motor de templates para renderizado HTML

## 📋 Prerrequisitos

- **Python 3.8+**
- **pip** (gestor de paquetes de Python)

## 🚀 Instalación

1. **Clona o descarga el proyecto**
   ```bash
   # Si es un repositorio git
   git clone <url-del-repositorio>
   cd <nombre-del-proyecto>
   ```

2. **Instala las dependencias**
   ```bash
   pip install -r requirements.txt
   ```

## ▶️ Ejecución

### Opción 1: Ejecutar la aplicación completa
```bash
uvicorn app.main:app --reload --host localhost --port 8000
```

### Opción 2: Ejecutar solo la API (sin interfaz web)
```bash
uvicorn app.main:app --reload --host localhost --port 8000
```

### Acceder a la aplicación
- **Interfaz web**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs (Swagger UI)
- **Documentación alternativa**: http://localhost:8000/redoc

## 📖 Uso

### Interfaz Web
1. Abre http://localhost:8000 en tu navegador
2. Usa el botón "Nueva Tarea" para crear tareas
3. Utiliza los filtros para buscar tareas específicas
4. Haz clic en "Editar" o "Eliminar" para modificar tareas
5. Usa el campo de búsqueda para encontrar tareas por texto

### API REST

#### Endpoints Principales

##### 1. Listar Tareas
```http
GET /api/tasks
```

**Parámetros de consulta:**
- `estado`: pendiente, en_progreso, completada
- `prioridad`: baja, media, alta
- `search`: texto para buscar en título/descripción
- `page`: número de página (default: 1)
- `per_page`: elementos por página (default: 5, max: 100)

**Ejemplos:**
```bash
# Listar todas las tareas
curl -X GET "http://localhost:8000/api/tasks"

# Filtrar por estado
curl -X GET "http://localhost:8000/api/tasks?estado=pendiente"

# Buscar por texto
curl -X GET "http://localhost:8000/api/tasks?search=natacion"

# Paginación
curl -X GET "http://localhost:8000/api/tasks?page=2&per_page=10"
```

##### 2. Crear Tarea
```http
POST /api/tasks
Content-Type: application/json

{
  "titulo": "Mi nueva tarea",
  "descripcion": "Descripción detallada de la tarea",
  "estado": "pendiente",
  "prioridad": "media",
  "fecha_vencimiento": "2025-12-31T23:59:00"
}
```

**Ejemplo con curl:**
```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Tarea de ejemplo",
    "descripcion": "Esta es una tarea de ejemplo",
    "estado": "pendiente",
    "prioridad": "media"
  }'
```

##### 3. Obtener Tarea Específica
```http
GET /api/tasks/{task_id}
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8000/api/tasks/1"
```

##### 4. Actualizar Tarea
```http
PUT /api/tasks/{task_id}
Content-Type: application/json

{
  "titulo": "Título actualizado",
  "estado": "completada"
}
```

**Ejemplo:**
```bash
curl -X PUT "http://localhost:8000/api/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{"estado": "completada"}'
```

##### 5. Eliminar Tarea
```http
DELETE /api/tasks/{task_id}
```

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:8000/api/tasks/1"
```

## 📊 Estructura del Proyecto

```
task-management-system/
├── app/
│   ├── main.py              # API principal y rutas
│   ├── database.py          # Configuración de base de datos
│   ├── models/
│   │   └── task.py          # Modelo de datos Task
│   ├── schemas/
│   │   └── task.py          # Esquemas Pydantic
│   ├── static/
│   │   ├── css/
│   │   │   ├── styles.css
│   │   │   └── pagination.css
│   │   └── js/
│   │       ├── main.js
│   │       └── confirm-delete.js
│   └── templates/
│       └── index.html
├── requirements.txt         # Dependencias Python
└── README.md               # Este archivo
```

## 🗄️ Base de Datos

La aplicación utiliza SQLite como base de datos, que se crea automáticamente al iniciar la aplicación. El archivo `tasks.db` se crea en el directorio raíz.

### Estructura de la Tabla `tasks`
- `id`: Identificador único (autoincremental)
- `titulo`: Título de la tarea (obligatorio, máx. 100 caracteres)
- `descripcion`: Descripción detallada (obligatoria, máx. 500 caracteres)
- `estado`: Estado actual (pendiente, en_progreso, completada)
- `prioridad`: Nivel de prioridad (baja, media, alta)
- `fecha_creacion`: Fecha de creación automática
- `fecha_vencimiento`: Fecha límite opcional

## ✅ Validaciones

### Backend
- ✅ Título y descripción obligatorios y con límites de longitud
- ✅ Estados y prioridades con valores predefinidos
- ✅ Fechas de vencimiento futuras
- ✅ IDs positivos para operaciones CRUD
- ✅ Manejo de errores con mensajes descriptivos

### Frontend
- ✅ Validación de campos requeridos
- ✅ Validación de formato de fechas
- ✅ Mensajes de error en tiempo real
- ✅ Confirmación antes de eliminar

## 🔧 Características Adicionales

- **Paginación**: Resultados paginados para mejor rendimiento
- **Búsqueda**: Búsqueda insensible a mayúsculas/minúsculas
- **Filtros combinados**: Múltiples filtros simultáneos
- **Interfaz responsiva**: Funciona en desktop y móvil
- **Documentación automática**: API documentada con Swagger/OpenAPI
- **Manejo de errores**: Respuestas de error consistentes

## 🐛 Solución de Problemas

### Error de puerto ocupado
```bash
# Cambiar el puerto
uvicorn app.main:app --reload --host localhost --port 8001
```

### Error de dependencias
```bash
# Reinstalar dependencias
pip install --upgrade -r requirements.txt
```

### Base de datos corrupta
```bash
# Eliminar y recrear la base de datos
rm tasks.db
# Reiniciar la aplicación
```

## 📝 Notas de Desarrollo

- La aplicación se reinicia automáticamente con cambios en desarrollo (`--reload`)
- Los archivos estáticos se sirven desde `/static/`
- La base de datos SQLite se crea automáticamente
- Todas las rutas API incluyen documentación automática

## 🤝 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

---

**Desarrollado con ❤️ usando FastAPI y tecnologías modernas web**