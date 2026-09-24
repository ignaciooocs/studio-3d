# Cliente API Generado

Este directorio contiene el cliente TypeScript generado automáticamente desde la especificación OpenAPI del backend.

## ⚠️ No Editar Manualmente

**IMPORTANTE**: Este código es generado automáticamente. No edites estos archivos manualmente, ya que se sobrescribirán la próxima vez que ejecutes el generador.

## 🔄 Regenerar el Cliente

Para regenerar el cliente después de cambios en el backend:

1. Asegúrate de que el servidor backend esté corriendo
2. Desde el directorio `studio-server`, ejecuta:

```bash
# Windows
pnpm generate-client:win

# Linux/Mac
pnpm generate-client
```

## 📦 Uso del Cliente

### Configuración Básica

```typescript
import { Configuration, MeshyApi } from './client';

// Configurar el cliente con la URL base
const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

// Crear instancia de la API
const meshyApi = new MeshyApi(configuration);
```

### Ejemplo con React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { MeshyApi, Configuration } from './client';

const api = new MeshyApi(
  new Configuration({
    basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  })
);

// Query para obtener el estado de una tarea
export function useTaskStatus(taskId: string) {
  return useQuery({
    queryKey: ['meshy', 'task', taskId],
    queryFn: () => api.getTaskStatus({ taskId }),
    enabled: !!taskId,
  });
}

// Mutation para crear una tarea
export function useCreateTask() {
  return useMutation({
    mutationFn: (data: CreateImageTo3DDto) => 
      api.createImageTo3D({ createImageTo3DDto: data }),
  });
}
```

### Interceptores (Opcional)

Si necesitas agregar headers personalizados o manejar errores globalmente, puedes configurar interceptores de axios:

```typescript
import axios from 'axios';
import { Configuration, MeshyApi } from './client';

// Configurar interceptores antes de crear la instancia
axios.interceptors.request.use((config) => {
  // Agregar token de autenticación si existe
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const api = new MeshyApi(
  new Configuration({
    basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  })
);
```

## 📚 Estructura del Cliente

El cliente generado incluye:

- **`api.ts`**: Clases de API con todos los endpoints
- **`configuration.ts`**: Configuración del cliente
- **`base.ts`**: Clase base con utilidades
- **`common.ts`**: Utilidades comunes
- **`index.ts`**: Exportaciones principales
- **Tipos TypeScript**: Todos los DTOs y tipos están tipados

## 🔍 Explorar la API

Para ver todos los métodos disponibles, revisa el archivo `api.ts` o usa el autocompletado de TypeScript en tu IDE.
