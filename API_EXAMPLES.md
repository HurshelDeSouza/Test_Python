# Ejemplos de Uso de la API - Sistema de Gestión de Tareas

Este documento contiene ejemplos prácticos de cómo usar la API REST del Sistema de Gestión de Tareas.

## 📋 Información General

- **URL Base**: `http://localhost:8000` (o el puerto donde esté ejecutándose la aplicación)
- **Content-Type**: `application/json` para todas las peticiones POST/PUT
- **Autenticación**: No requerida (para esta versión)

## 🧪 Colección de Postman

Puedes importar esta colección en Postman para probar todos los endpoints:

```json
{
  "info": {
    "name": "Sistema de Gestión de Tareas API",
    "description": "API completa para gestión de tareas",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    }
  ],
  "item": [
    {
      "name": "Listar Tareas",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/tasks",
          "host": ["{{base_url}}"],
          "path": ["api", "tasks"]
        }
      }
    },
    {
      "name": "Crear Tarea",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"titulo\": \"Nueva tarea de ejemplo\",\n  \"descripcion\": \"Descripción detallada de la tarea\",\n  \"estado\": \"pendiente\",\n  \"prioridad\": \"media\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/tasks",
          "host": ["{{base_url}}"],
          "path": ["api", "tasks"]
        }
      }
    },
    {
      "name": "Obtener Tarea por ID",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/tasks/1",
          "host": ["{{base_url}}"],
          "path": ["api", "tasks", "1"]
        }
      }
    },
    {
      "name": "Actualizar Tarea",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"estado\": \"completada\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/tasks/1",
          "host": ["{{base_url}}"],
          "path": ["api", "tasks", "1"]
        }
      }
    },
    {
      "name": "Eliminar Tarea",
      "request": {
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/tasks/1",
          "host": ["{{base_url}}"],
          "path": ["api", "tasks", "1"]
        }
      }
    }
  ]
}
```

## 📖 Ejemplos con cURL

### 1. Listar todas las tareas

```bash
curl -X GET "http://localhost:8000/api/tasks"
```

### 2. Listar tareas con filtros

```bash
# Filtrar por estado
curl -X GET "http://localhost:8000/api/tasks?estado=pendiente"

# Filtrar por prioridad
curl -X GET "http://localhost:8000/api/tasks?prioridad=alta"

# Filtros combinados
curl -X GET "http://localhost:8000/api/tasks?estado=pendiente&prioridad=media"

# Buscar por texto
curl -X GET "http://localhost:8000/api/tasks?search=natacion"
```

### 3. Paginación

```bash
# Página 2 con 10 elementos por página
curl -X GET "http://localhost:8000/api/tasks?page=2&per_page=10"

# Primera página con 5 elementos (por defecto)
curl -X GET "http://localhost:8000/api/tasks?page=1&per_page=5"
```

### 4. Crear una nueva tarea

```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Tarea de ejemplo",
    "descripcion": "Esta es una tarea de ejemplo para demostrar la API",
    "estado": "pendiente",
    "prioridad": "media",
    "fecha_vencimiento": "2025-12-31T23:59:00"
  }'
```

### 5. Crear tarea sin fecha de vencimiento

```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Tarea sin fecha límite",
    "descripcion": "Esta tarea no tiene fecha de vencimiento",
    "estado": "en_progreso",
    "prioridad": "baja"
  }'
```

### 6. Obtener una tarea específica

```bash
curl -X GET "http://localhost:8000/api/tasks/1"
```

### 7. Actualizar una tarea (cambiar estado)

```bash
curl -X PUT "http://localhost:8000/api/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "completada"
  }'
```

### 8. Actualizar múltiples campos

```bash
curl -X PUT "http://localhost:8000/api/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Título actualizado",
    "descripcion": "Descripción actualizada",
    "prioridad": "alta"
  }'
```

### 9. Eliminar una tarea

```bash
curl -X DELETE "http://localhost:8000/api/tasks/1"
```

## 🧪 Casos de Prueba

### Validación de Datos

#### Título vacío (debería fallar)
```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "",
    "descripcion": "Descripción válida",
    "estado": "pendiente",
    "prioridad": "media"
  }'
```

#### Fecha de vencimiento en el pasado (debería fallar)
```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Tarea con fecha inválida",
    "descripcion": "Esta tarea tiene fecha de vencimiento en el pasado",
    "estado": "pendiente",
    "prioridad": "media",
    "fecha_vencimiento": "2020-01-01T00:00:00"
  }'
```

#### Estado inválido (debería fallar)
```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Tarea con estado inválido",
    "descripcion": "Estado no válido",
    "estado": "estado_invalido",
    "prioridad": "media"
  }'
```

### Manejo de Errores

#### Tarea no encontrada
```bash
curl -X GET "http://localhost:8000/api/tasks/99999"
```

#### ID inválido
```bash
curl -X GET "http://localhost:8000/api/tasks/-1"
```

## 📊 Respuestas de la API

### Respuesta Exitosa - Listar Tareas
```json
{
  "items": [
    {
      "id": 1,
      "titulo": "Tarea de ejemplo",
      "descripcion": "Descripción de la tarea",
      "estado": "pendiente",
      "prioridad": "media",
      "fecha_creacion": "2025-09-15T06:30:00",
      "fecha_vencimiento": "2025-12-31T23:59:00"
    }
  ],
  "pagination": {
    "total_items": 1,
    "total_pages": 1,
    "current_page": 1,
    "per_page": 5,
    "has_next": false,
    "has_prev": false
  }
}
```

### Respuesta Exitosa - Crear/Actualizar Tarea
```json
{
  "id": 1,
  "titulo": "Tarea de ejemplo",
  "descripcion": "Descripción de la tarea",
  "estado": "pendiente",
  "prioridad": "media",
  "fecha_creacion": "2025-09-15T06:30:00",
  "fecha_vencimiento": "2025-12-31T23:59:00"
}
```

### Respuesta Exitosa - Eliminar Tarea
```json
{
  "message": "Tarea eliminada exitosamente",
  "id": 1,
  "titulo": "Tarea eliminada"
}
```

### Respuesta de Error - Validación
```json
{
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "loc": ["body", "titulo"],
      "msg": "El título no puede estar vacío",
      "type": "value_error"
    }
  ],
  "message": "Por favor verifica los datos enviados"
}
```

### Respuesta de Error - Recurso no encontrado
```json
{
  "detail": "Tarea con ID 999 no encontrada"
}
```

## 🔧 Variables de Entorno

La aplicación utiliza las siguientes variables de entorno (opcionales):

- `DATABASE_URL`: URL de la base de datos (por defecto: `sqlite:///./tasks.db`)

## 📝 Notas Importantes

1. **IDs**: Los IDs de las tareas son números enteros positivos generados automáticamente
2. **Fechas**: Todas las fechas están en formato ISO 8601 (YYYY-MM-DDTHH:MM:SS)
3. **Campos opcionales**: Solo `fecha_vencimiento` es opcional en la creación
4. **Validación**: Tanto el backend como el frontend validan los datos
5. **Paginación**: La paginación es automática y configurable
6. **Búsqueda**: La búsqueda es insensible a mayúsculas/minúsculas
7. **Transacciones**: Todas las operaciones de escritura usan transacciones para mantener la integridad de los datos

---

**¡La API está lista para usar!** 🚀