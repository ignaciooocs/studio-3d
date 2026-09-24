# 📚 Documentación Swagger

## 🎯 Descripción

La aplicación incluye documentación interactiva de la API usando Swagger/OpenAPI. Esto te permite:

- Ver todos los endpoints disponibles
- Probar los endpoints directamente desde el navegador
- Ver ejemplos de requests y responses
- Entender los parámetros requeridos y opcionales

## 🚀 Acceso a Swagger

Una vez que el servidor esté corriendo, accede a:

**http://localhost:3000/api**

O si cambiaste el puerto:

**http://localhost:{PORT}/api**

## 📋 Endpoints Documentados

### Tag: `meshy`

Todos los endpoints relacionados con la integración de Meshy.ai:

#### 1. POST `/meshy/image-to-3d`
- **Descripción**: Crea una nueva tarea de conversión de imagen a modelo 3D
- **Body**: `CreateImageTo3DDto`
- **Response**: `CreateTaskResponseDto` (201 Created)

#### 2. GET `/meshy/task/:taskId`
- **Descripción**: Consulta el estado de una tarea
- **Parámetros**: `taskId` (UUID)
- **Response**: `TaskStatusResponseDto` (200 OK)

#### 3. GET `/meshy/task/:taskId/download`
- **Descripción**: Obtiene la URL de descarga del modelo
- **Parámetros**: 
  - `taskId` (UUID)
  - `format` (query, opcional): `glb` | `fbx` | `obj` | `usdz`
- **Response**: `DownloadModelResponseDto` (200 OK)

#### 4. DELETE `/meshy/task/:taskId`
- **Descripción**: Cancela una tarea
- **Parámetros**: `taskId` (UUID)
- **Response**: 204 No Content

### Tag: `health`

#### GET `/`
- **Descripción**: Health check del servidor
- **Response**: String "Hello World!"

## 🧪 Probar Endpoints desde Swagger

### Paso 1: Crear una tarea

1. Ve a `POST /meshy/image-to-3d`
2. Haz clic en "Try it out"
3. Completa el body con:
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "modelType": "standard",
  "targetPolycount": 10000
}
```
4. Haz clic en "Execute"
5. Copia el `taskId` de la respuesta

### Paso 2: Consultar estado

1. Ve a `GET /meshy/task/{taskId}`
2. Haz clic en "Try it out"
3. Pega el `taskId` obtenido en el paso anterior
4. Haz clic en "Execute"
5. Verás el estado actual de la tarea

### Paso 3: Descargar modelo (cuando esté listo)

1. Espera a que el estado sea `SUCCEEDED`
2. Ve a `GET /meshy/task/{taskId}/download`
3. Haz clic en "Try it out"
4. Pega el `taskId`
5. Selecciona el formato (opcional, default: `glb`)
6. Haz clic en "Execute"
7. Obtendrás la URL de descarga

## 📝 DTOs Documentados

### CreateImageTo3DDto

Todos los campos están documentados con:
- Descripción
- Ejemplos
- Valores por defecto
- Restricciones (min, max, enum)

### TaskStatusResponseDto

Incluye:
- `taskId`: UUID de la tarea
- `meshyTaskId`: ID en Meshy.ai
- `status`: Estado actual
- `progress`: Progreso (0-100)
- `modelUrls`: URLs de modelos generados
- `error`: Mensaje de error (si aplica)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

### CreateTaskResponseDto

Respuesta al crear una tarea:
- `taskId`: UUID de la tarea
- `meshyTaskId`: ID en Meshy.ai
- `status`: Estado inicial (PENDING)
- `createdAt`: Fecha de creación

## ⚙️ Configuración

La configuración de Swagger se encuentra en `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Studio 3D API')
  .setDescription('...')
  .setVersion('1.0')
  .addTag('meshy', '...')
  .addTag('health', '...')
  .build();
```

## 🔒 Autenticación

Actualmente Swagger está configurado con soporte para Bearer Auth, aunque no está implementado en los endpoints. Para futuras implementaciones de autenticación, puedes usar el botón "Authorize" en Swagger.

## 💡 Tips

1. **Ejemplos**: Todos los endpoints incluyen ejemplos de requests y responses
2. **Validación**: Los campos tienen validaciones visibles (min, max, enum, etc.)
3. **Errores**: Los posibles errores están documentados con ejemplos
4. **Schemas**: Puedes ver los schemas completos de los DTOs en la sección "Schemas"

## 🐛 Troubleshooting

Si Swagger no se muestra:

1. Verifica que el servidor esté corriendo
2. Verifica que la ruta sea `/api` (no `/swagger` o `/docs`)
3. Revisa la consola del servidor por errores
4. Verifica que las dependencias estén instaladas: `@nestjs/swagger` y `swagger-ui-express`
