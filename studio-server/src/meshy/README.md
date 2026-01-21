# Módulo Meshy - Documentación de API

## 📋 Descripción

Este módulo proporciona una capa de abstracción sobre la API de Meshy.ai para la conversión de imágenes a modelos 3D. Todas las tareas se persisten en PostgreSQL usando TypeORM con patrón Repository.

## 🔌 Endpoints

### 1. Crear Tarea de Imagen a 3D

**POST** `/meshy/image-to-3d`

Inicia una nueva tarea de conversión de imagen a modelo 3D.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",  // Opcional si se usa imageBase64
  "imageBase64": "data:image/jpeg;base64,...", // Opcional si se usa imageUrl
  "modelType": "standard",                      // Opcional: "standard" | "premium"
  "targetPolycount": 10000,                     // Opcional: 1000-50000
  "shouldTexture": true,                        // Opcional: boolean
  "shouldRemesh": false,                        // Opcional: boolean
  "symmetry": "none",                           // Opcional: "none" | "x" | "y" | "z"
  "moderation": false                           // Opcional: boolean
}
```

**Response (201 Created):**
```json
{
  "taskId": "uuid-del-task-id",
  "meshyTaskId": "meshy-task-id",
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Notas:**
- Debes proporcionar `imageUrl` O `imageBase64` (no ambos)
- Si no se especifica `modelType`, se usa el valor por defecto de configuración
- `targetPolycount` debe estar entre 1000 y 50000

---

### 2. Consultar Estado de Tarea

**GET** `/meshy/task/:taskId`

Obtiene el estado actual de una tarea.

**Response (200 OK):**
```json
{
  "taskId": "uuid-del-task-id",
  "meshyTaskId": "meshy-task-id",
  "status": "SUCCEEDED",
  "progress": 100,
  "modelUrls": {
    "glb": "https://meshy.ai/models/...",
    "fbx": "https://meshy.ai/models/...",
    "obj": "https://meshy.ai/models/...",
    "usdz": "https://meshy.ai/models/..."
  },
  "error": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:05:00.000Z"
}
```

**Estados posibles:**
- `PENDING`: Tarea creada, esperando procesamiento
- `IN_PROGRESS`: Tarea en proceso
- `SUCCEEDED`: Tarea completada exitosamente
- `FAILED`: Tarea falló

---

### 3. Descargar Modelo

**GET** `/meshy/task/:taskId/download?format=glb`

Obtiene la URL de descarga del modelo generado.

**Query Parameters:**
- `format` (opcional): `glb` | `fbx` | `obj` | `usdz` (default: `glb`)

**Response (200 OK):**
```json
{
  "downloadUrl": "https://meshy.ai/models/..."
}
```

**Errores:**
- `404 Not Found`: Tarea no encontrada
- `400 Bad Request`: Tarea no completada o formato no disponible

---

### 4. Cancelar Tarea

**DELETE** `/meshy/task/:taskId`

Cancela una tarea (marca como FAILED).

**Response (204 No Content)**

---

## 🔄 Flujo de Uso Típico

1. **Crear tarea:**
   ```bash
   POST /meshy/image-to-3d
   {
     "imageUrl": "https://example.com/image.jpg",
     "modelType": "standard"
   }
   ```

2. **Consultar estado (polling):**
   ```bash
   GET /meshy/task/{taskId}
   ```
   Repetir hasta que `status` sea `SUCCEEDED` o `FAILED`

3. **Descargar modelo:**
   ```bash
   GET /meshy/task/{taskId}/download?format=glb
   ```

---

## 🗄️ Persistencia

Todas las tareas se guardan en PostgreSQL en la tabla `meshy_tasks` con los siguientes campos:

- `id`: UUID (clave primaria)
- `meshyTaskId`: ID de la tarea en Meshy (único)
- `status`: Estado actual de la tarea
- `progress`: Progreso (0-100)
- `modelUrls`: URLs de los modelos generados (JSONB)
- `error`: Mensaje de error si falló
- `imageUrl`: URL de la imagen original
- `modelType`: Tipo de modelo usado
- `targetPolycount`: Número de polígonos objetivo
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

---

## ⚙️ Configuración

Las configuraciones se manejan mediante variables de entorno. Ver `env.example` para más detalles.

Variables importantes:
- `MESHY_API_KEY`: API key de Meshy (requerida)
- `MESHY_DEFAULT_MODEL_TYPE`: Tipo de modelo por defecto
- `MESHY_DEFAULT_POLYCOUNT`: Polígonos por defecto
- `DB_*`: Configuración de base de datos

---

## 🛡️ Manejo de Errores

El módulo maneja los siguientes errores:

- **400 Bad Request**: Validación de entrada fallida
- **404 Not Found**: Tarea no encontrada
- **503 Service Unavailable**: Error de conexión con Meshy API
- **500 Internal Server Error**: Error interno del servidor

Todos los errores siguen el formato estándar de NestJS:
```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```
