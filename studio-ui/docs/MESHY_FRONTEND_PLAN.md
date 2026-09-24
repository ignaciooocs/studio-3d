# Plan de Implementación: Integración Meshy AI en Frontend

## 📋 Resumen Ejecutivo

Este documento describe el plan completo para integrar el módulo Meshy AI en el frontend de Studio 3D. La implementación será modular, escalable y proporcionará una excelente experiencia de usuario con seguimiento en tiempo real del estado de las tareas de generación de modelos 3D.

---

## 🏗️ Arquitectura Propuesta

### Estructura de Carpetas

```
studio-ui/src/
├── client/                         # Cliente OpenAPI generado (NO EDITAR)
│   ├── api.ts                      # Clases de API generadas
│   ├── configuration.ts            # Configuración del cliente
│   ├── base.ts                     # Clase base
│   ├── common.ts                   # Utilidades comunes
│   └── index.ts                    # Exportaciones principales
│
├── service/
│   └── meshy/
│       └── meshy.service.ts        # Servicio con funciones para cada endpoint
│                                   # (usa tipos del cliente OpenAPI generado)
│
├── hooks/
│   ├── useMeshy.ts                 # React Query hooks (queries y mutations)
│   └── useMeshyModelLoader.ts      # Hook para cargar modelo en editor
│
├── hooks/
│   └── useMeshyModelLoader.ts     # Hook para cargar modelo en editor
│
├── components/
│   ├── Meshy/
│   │   ├── MeshyImageTo3DDialog.tsx    # Dialog para crear tarea
│   │   ├── MeshyTaskCard.tsx           # Card para mostrar tarea
│   │   ├── MeshyTaskList.tsx           # Lista de tareas
│   │   ├── MeshyTaskProgress.tsx       # Indicador de progreso
│   │   └── MeshyModelPreview.tsx       # Preview del modelo generado
│   └── Sidebar/
│       └── MeshySection.tsx            # Sección en el sidebar
│
└── utils/
    └── imageUtils.ts                   # Utilidades para manejo de imágenes
```

---

## 📦 1. Configuración Base

### 1.1 Instalación de React Query

**Instalar TanStack Query (React Query v5):**
```bash
pnpm add @tanstack/react-query
```

### 1.2 Configurar QueryClient Provider

**Ubicación:** `src/main.tsx` o `src/App.tsx`

**Implementación:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

// Envolver la app con QueryClientProvider
```

### 1.3 Cliente OpenAPI Generado (`client/`)

**Objetivo:** El cliente TypeScript se genera automáticamente desde la especificación OpenAPI del backend.

**Características:**
- Tipos TypeScript generados automáticamente (DTOs, Enums, Interfaces)
- Clases de API con todos los endpoints tipados
- Configuración centralizada
- **NO EDITAR MANUALMENTE** - Se regenera desde el backend

**Regenerar el cliente:**
```bash
# Desde studio-server
pnpm generate-client:win  # Windows
pnpm generate-client      # Linux/Mac
```

**Ubicación:** `studio-ui/src/client/` (generado automáticamente)

**Importar tipos:**
```typescript
// Importar tipos generados
import type { 
  CreateImageTo3DDto,
  TaskStatusResponseDto,
  TaskStatus,
  ModelFormat 
} from '@/client';

// Importar clases de API
import { MeshyApi, Configuration } from '@/client';
```

**Ventajas:**
- ✅ Tipos siempre sincronizados con el backend
- ✅ Autocompletado completo en el IDE
- ✅ Detección de errores en tiempo de compilación
- ✅ Sin necesidad de mantener tipos manualmente

### 1.4 Variables de Entorno

Agregar a `.env` o `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_MESHY_POLLING_INTERVAL=3000  # 3 segundos
```

---

## 🔌 2. Servicios API

### 2.1 Tipos TypeScript (Generados desde OpenAPI)

**Ubicación:** `src/client/` (generado automáticamente)

**Contenido generado automáticamente:**
- Todos los DTOs: `CreateImageTo3DDto`, `TaskStatusResponseDto`, etc.
- Todos los Enums: `TaskStatus`, `ModelFormat`, etc.
- Todas las Interfaces y tipos necesarios

**Importar tipos:**
```typescript
import type { 
  CreateImageTo3DDto,
  TaskStatusResponseDto,
  TaskStatus,
  ModelFormat 
} from '@/client';
```

### 2.2 Servicio Meshy (`service/meshy/meshy.service.ts`)

**Objetivo:** Servicio con funciones para cada endpoint, usando el cliente OpenAPI generado.

**Implementación:**
```typescript
import { MeshyApi, Configuration } from '@/client';
import type { 
  CreateImageTo3DDto,
  TaskStatusResponseDto,
  ModelFormat 
} from '@/client';

// Instancia del cliente API
const createMeshyApi = () => {
  const config = new Configuration({
    basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  });
  return new MeshyApi(config);
};

// Servicio con funciones para cada endpoint
export const meshyService = {
  /**
   * Crear una nueva tarea de generación de imagen a 3D
   */
  createImageTo3DTask: async (dto: CreateImageTo3DDto) => {
    const api = createMeshyApi();
    const response = await api.createImageTo3D({ createImageTo3DDto: dto });
    return response.data;
  },

  /**
   * Obtener el estado de una tarea
   */
  getTaskStatus: async (taskId: string): Promise<TaskStatusResponseDto> => {
    const api = createMeshyApi();
    const response = await api.getTaskStatus({ taskId });
    return response.data;
  },

  /**
   * Obtener el estado directamente desde Meshy (sin pasar por BD)
   */
  getTaskStatusFromMeshy: async (meshyTaskId: string): Promise<TaskStatusResponseDto> => {
    const api = createMeshyApi();
    const response = await api.getTaskStatusFromMeshy({ meshyTaskId });
    return response.data;
  },

  /**
   * Obtener URL de descarga del modelo
   */
  downloadModel: async (taskId: string, format: ModelFormat = 'glb') => {
    const api = createMeshyApi();
    const response = await api.downloadModel({ taskId, format });
    return response.data;
  },

  /**
   * Cancelar una tarea
   */
  cancelTask: async (taskId: string): Promise<void> => {
    const api = createMeshyApi();
    await api.cancelTask({ taskId });
  },

  /**
   * Obtener todas las tareas
   */
  getAllTasks: async (): Promise<TaskStatusResponseDto[]> => {
    const api = createMeshyApi();
    const response = await api.getAllTasks();
    return response.data;
  },
};
```

**Características:**
- Funciones simples y directas para cada endpoint
- Tipado fuerte usando tipos generados de OpenAPI
- Instancia del cliente creada por función (permite configuración dinámica)
- Manejo de errores delegado al cliente generado

---

## 🎣 3. React Query Hooks (`hooks/useMeshy.ts`)

### 3.1 Query Keys (`hooks/useMeshy.ts`)

**Propósito:** Centralizar todas las query keys para React Query.

**Implementación:**
```typescript
export const meshyQueryKeys = {
  all: ['meshy'] as const,
  tasks: () => [...meshyQueryKeys.all, 'tasks'] as const,
  task: (taskId: string) => [...meshyQueryKeys.tasks(), taskId] as const,
  taskStatus: (taskId: string) => [...meshyQueryKeys.task(taskId), 'status'] as const,
  taskStatusFromMeshy: (meshyTaskId: string) => 
    [...meshyQueryKeys.all, 'meshy-direct', meshyTaskId] as const,
  download: (taskId: string, format?: string) => 
    [...meshyQueryKeys.task(taskId), 'download', format] as const,
} as const;
```

### 3.2 Query: `useMeshyTaskStatus`

**Propósito:** Obtener y hacer polling del estado de una tarea.

**Implementación:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { meshyService } from '@/service/meshy/meshy.service';
import type { TaskStatusResponseDto, TaskStatus } from '@/client';
import { meshyQueryKeys } from './useMeshy';

export function useMeshyTaskStatus(taskId: string, options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: meshyQueryKeys.taskStatus(taskId),
    queryFn: () => meshyService.getTaskStatus(taskId),
    enabled: options?.enabled !== false && !!taskId,
    refetchInterval: (query) => {
      const data = query.state.data as TaskStatusResponseDto | undefined;
      if (!data) return options?.refetchInterval ?? 3000;
      
      // Detener polling si la tarea está completada o falló
      if (data.status === TaskStatus.SUCCEEDED || data.status === TaskStatus.FAILED) {
        return false;
      }
      
      return options?.refetchInterval ?? 3000;
    },
    staleTime: 0, // Siempre considerar stale para polling activo
  });
}
```

**Uso:**
```typescript
const { data: taskStatus, isLoading, error } = useMeshyTaskStatus(taskId);
```

### 3.3 Mutation: `useCreateMeshyTask`

**Propósito:** Crear una nueva tarea de generación.

**Implementación:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meshyService } from '@/service/meshy/meshy.service';
import type { CreateImageTo3DDto } from '@/client';
import { meshyQueryKeys } from './useMeshy';

export function useCreateMeshyTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateImageTo3DDto) => 
      meshyService.createImageTo3DTask(dto),
    onSuccess: (data) => {
      // Invalidar queries relacionadas si es necesario
      queryClient.invalidateQueries({ queryKey: meshyQueryKeys.tasks() });
      
      // Prefetch del estado de la tarea
      queryClient.prefetchQuery({
        queryKey: meshyQueryKeys.taskStatus(data.taskId),
        queryFn: () => meshyService.getTaskStatus(data.taskId),
      });
    },
  });
}
```

**Uso:**
```typescript
const createTask = useCreateMeshyTask();

const handleCreate = async () => {
  try {
    const result = await createTask.mutateAsync({
      imageBase64: imageData,
      modelType: 'standard',
    });
    // result contiene CreateTaskResponseDto
  } catch (error) {
    // Manejo de errores
  }
};
```

### 3.4 Mutation: `useCancelMeshyTask`

**Propósito:** Cancelar una tarea en progreso.

**Implementación:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meshyService } from '@/service/meshy/meshy.service';
import { meshyQueryKeys } from './useMeshy';

export function useCancelMeshyTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => meshyService.cancelTask(taskId),
    onSuccess: (_, taskId) => {
      // Invalidar el estado de la tarea
      queryClient.invalidateQueries({ 
        queryKey: meshyQueryKeys.taskStatus(taskId) 
      });
    },
  });
}
```

**Uso:**
```typescript
const cancelTask = useCancelMeshyTask();

const handleCancel = () => {
  cancelTask.mutate(taskId);
};
```

### 3.5 Query: `useMeshyDownloadModel`

**Propósito:** Obtener URL de descarga del modelo.

**Implementación:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { meshyService } from '@/service/meshy/meshy.service';
import type { ModelFormat, TaskStatus } from '@/client';
import { meshyQueryKeys } from './useMeshy';

export function useMeshyDownloadModel(
  taskId: string, 
  format: ModelFormat = 'glb',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: meshyQueryKeys.download(taskId, format),
    queryFn: () => meshyService.downloadModel(taskId, format),
    enabled: options?.enabled !== false && !!taskId,
    staleTime: 1000 * 60 * 60, // Cache por 1 hora
  });
}
```

**Uso:**
```typescript
const { data: downloadData, isLoading } = useMeshyDownloadModel(
  taskId, 
  'glb',
  { enabled: taskStatus?.status === TaskStatus.SUCCEEDED }
);
```

### 3.6 Query: `useMeshyTaskStatusFromMeshy`

**Propósito:** Obtener estado directamente desde Meshy (sin pasar por BD).

**Implementación:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { meshyService } from '@/service/meshy/meshy.service';
import type { TaskStatusResponseDto } from '@/client';
import { meshyQueryKeys } from './useMeshy';

export function useMeshyTaskStatusFromMeshy(
  meshyTaskId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) {
  return useQuery({
    queryKey: meshyQueryKeys.taskStatusFromMeshy(meshyTaskId),
    queryFn: () => meshyService.getTaskStatusFromMeshy(meshyTaskId),
    enabled: options?.enabled !== false && !!meshyTaskId,
    refetchInterval: (query) => {
      const data = query.state.data as TaskStatusResponseDto | undefined;
      if (!data) return options?.refetchInterval ?? 3000;
      
      // Detener polling si la tarea está completada o falló
      if (data.status === 'SUCCEEDED' || data.status === 'FAILED') {
        return false;
      }
      
      return options?.refetchInterval ?? 3000;
    },
    staleTime: 0,
  });
}
```

### 3.7 Query: `useMeshyAllTasks`

**Propósito:** Obtener todas las tareas.

**Implementación:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { meshyService } from '@/service/meshy/meshy.service';
import { meshyQueryKeys } from './useMeshy';

export function useMeshyAllTasks() {
  return useQuery({
    queryKey: meshyQueryKeys.tasks(),
    queryFn: () => meshyService.getAllTasks(),
    staleTime: 1000 * 30, // 30 segundos
  });
}
```

### 3.8 Hook Helper: `useMeshyTaskWithStatus`

**Propósito:** Hook combinado que maneja creación y polling automático.

**Implementación:**
```typescript
import { useState } from 'react';
import { useCreateMeshyTask, useMeshyTaskStatus } from './useMeshy';
import type { CreateImageTo3DDto } from '@/client';

export function useMeshyTaskWithStatus() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const createTask = useCreateMeshyTask();
  const { data: taskStatus } = useMeshyTaskStatus(taskId!, {
    enabled: !!taskId,
  });
  
  const handleCreate = async (dto: CreateImageTo3DDto) => {
    const result = await createTask.mutateAsync(dto);
    setTaskId(result.taskId);
    return result;
  };
  
  return {
    createTask: handleCreate,
    taskId,
    taskStatus,
    isLoading: createTask.isPending,
    error: createTask.error,
  };
}
```

---

## 🗄️ 4. Estado UI (Opcional con Zustand)

### 4.1 Store UI de Meshy (Opcional)

**Propósito:** Solo para estado de UI, no para datos de servidor.

**Estado a gestionar (si es necesario):**
```typescript
interface MeshyUIState {
  // Tarea seleccionada en la UI
  selectedTaskId: string | null;
  setSelectedTask: (taskId: string | null) => void;
  
  // Dialog abierto/cerrado
  isDialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}
```

**Nota:** Los datos de las tareas se gestionan completamente con React Query. Zustand solo para estado de UI si es necesario.

---

## 🎨 5. Componentes UI

### 5.1 `MeshyImageTo3DDialog`

**Propósito:** Dialog modal para crear una nueva tarea.

**Características:**
- Upload de imagen (drag & drop o selector de archivos)
- Preview de imagen seleccionada
- Opciones avanzadas (colapsable):
  - Tipo de modelo (standard/premium)
  - Target polycount (slider)
  - Should texture (checkbox)
  - Should remesh (checkbox)
  - Symmetry (select)
  - Moderation (checkbox)
- Validación de imagen
- Botones: Cancelar, Generar
- Loading state durante la creación

**Ubicación:** Se puede abrir desde el Sidebar o TopBar

### 5.2 `MeshyTaskCard`

**Propósito:** Card individual para mostrar el estado de una tarea.

**Estados visuales:**
- **PENDING:** Indicador de espera
- **IN_PROGRESS:** Barra de progreso animada
- **SUCCEEDED:** Check verde + preview del modelo
- **FAILED:** Icono de error + mensaje

**Información mostrada:**
- Imagen original (thumbnail)
- Estado y progreso
- Fecha de creación
- Botones de acción:
  - Ver detalles
  - Cargar en editor (si completado)
  - Descargar modelo
  - Cancelar (si en progreso)
  - Eliminar

### 5.3 `MeshyTaskList`

**Propósito:** Lista de todas las tareas (activas y completadas).

**Características:**
- Tabs o secciones: "En Progreso" / "Completadas"
- Ordenamiento por fecha (más reciente primero)
- Filtros opcionales:
  - Por estado
  - Por tipo de modelo
  - Por fecha
- Empty states
- Scroll infinito (opcional para historial)

### 5.4 `MeshyTaskProgress`

**Propósito:** Componente reutilizable para mostrar progreso.

**Características:**
- Barra de progreso animada
- Porcentaje numérico
- Indicador de tiempo estimado (opcional)
- Animaciones suaves

### 5.5 `MeshyModelPreview`

**Propósito:** Preview 3D del modelo generado.

**Características:**
- Viewer 3D usando Three.js (ya disponible en el proyecto)
- Controles de rotación/zoom
- Información del modelo:
  - Formato
  - Tamaño (si disponible)
  - Fecha de generación
- Botón para cargar en editor principal

### 5.6 `MeshySection` (en Sidebar)

**Propósito:** Sección dedicada en el sidebar para Meshy.

**Características:**
- Botón "Generar desde Imagen"
- Lista compacta de tareas activas
- Acceso rápido al historial
- Notificaciones de tareas completadas

---

## 🔄 6. Flujo de Usuario

### 6.1 Crear Nueva Tarea

1. Usuario hace clic en "Generar desde Imagen" (Sidebar o TopBar)
2. Se abre `MeshyImageTo3DDialog`
3. Usuario selecciona/sube imagen
4. (Opcional) Configura opciones avanzadas
5. Usuario hace clic en "Generar"
6. Se muestra `MeshyTaskCard` en estado PENDING
7. Comienza polling automático del estado

### 6.2 Seguimiento de Progreso

1. `useMeshyTaskStatus` se configura con `refetchInterval: 3000`
2. React Query hace polling automático cada 3 segundos
3. `MeshyTaskCard` se actualiza automáticamente con:
   - Estado actualizado (desde React Query cache)
   - Progreso (0-100%)
   - Cualquier error
4. Cuando `status === SUCCEEDED`:
   - React Query detecta automáticamente y detiene el polling
   - Se muestra preview del modelo
   - Se habilitan botones de acción
5. Cuando `status === FAILED`:
   - React Query detiene el polling automáticamente
   - Se muestra mensaje de error
   - Se ofrece opción de reintentar

### 6.3 Cargar Modelo en Editor

1. Usuario hace clic en "Cargar en Editor" en una tarea completada
2. Se obtiene URL de descarga (formato GLB por defecto)
3. Se carga el modelo usando Three.js GLTFLoader
4. Se agrega a la escena del editor
5. Se cierra el dialog/list de Meshy

### 6.4 Descargar Modelo

1. Usuario hace clic en "Descargar"
2. Se muestra selector de formato (GLB, FBX, OBJ, USDZ)
3. Se obtiene URL de descarga del formato seleccionado
4. Se inicia descarga del archivo

---

## 🛠️ 7. Utilidades

### 7.1 `imageUtils.ts`

**Funciones:**
- `convertFileToBase64(file: File): Promise<string>`
- `validateImageFile(file: File): { valid: boolean; error?: string }`
- `getImageDimensions(file: File): Promise<{ width: number; height: number }>`
- `compressImage(file: File, maxSizeMB: number): Promise<File>`

---

## ⚙️ 8. Configuración y Constantes

### 8.1 Constantes

```typescript
// service/meshy/constants.ts
export const MESHY_CONFIG = {
  POLLING_INTERVAL: 3000, // 3 segundos
  MAX_POLLING_ATTEMPTS: 100, // ~5 minutos
  MAX_IMAGE_SIZE_MB: 10,
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  DEFAULT_MODEL_FORMAT: 'glb' as ModelFormat,
} as const;
```

---

## 🎯 9. Integración con Editor Existente

### 9.1 Cargar Modelo en Escena

**Ubicación:** `hooks/useMeshyModelLoader.ts`

**Implementación:**
```typescript
import { useMutation } from '@tanstack/react-query';
import { meshyService } from '@/service/meshy/meshy.service';
import type { ModelFormat } from '@/client';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function useMeshyModelLoader() {
  const { commands } = useEditorContext();
  
  const loadModel = useMutation({
    mutationFn: async ({ taskId, format = 'glb' }: {
      taskId: string;
      format?: ModelFormat;
    }) => {
      // 1. Obtener URL de descarga usando el servicio
      const downloadData = await meshyService.downloadModel(taskId, format);
      
      // 2. Cargar modelo con GLTFLoader
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(downloadData.downloadUrl);
      
      // 3. Agregar a escena usando el sistema de comandos existente
      commands.addObject({
        id: generateId(),
        type: 'model',
        mesh: gltf.scene,
        // ... otras propiedades
      });
      
      return gltf;
    },
  });
  
  return {
    loadModel: loadModel.mutateAsync,
    isLoading: loadModel.isPending,
    error: loadModel.error,
  };
}
```

**Uso:**
```typescript
const { loadModel, isLoading } = useMeshyModelLoader();

const handleLoad = async () => {
  await loadModel({ taskId, format: 'glb' });
};
```

### 9.2 Integración en Sidebar

Agregar nueva sección "Meshy AI" en el Sidebar con:
- Botón para abrir dialog de creación
- Lista de tareas activas
- Link al historial completo

---

## 🚨 10. Manejo de Errores

### 10.1 Tipos de Errores

- **Errores de red:** Mostrar mensaje amigable + opción de reintentar
- **Errores de validación:** Mostrar mensaje específico del campo
- **Errores de API:** Mostrar mensaje del servidor
- **Timeouts:** Ofrecer opción de continuar polling o cancelar

### 10.2 Notificaciones

Usar Material-UI Snackbar para:
- Tarea creada exitosamente
- Tarea completada
- Error en tarea
- Modelo cargado en editor

---

## 📊 11. Optimizaciones

### 11.1 Polling Inteligente con React Query

- **Intervalo adaptativo:** Configurado en `refetchInterval` del query
- **Detención automática:** React Query detiene polling cuando `status === SUCCEEDED || FAILED`
- **Backoff exponencial:** Configurado en `retry` y `retryDelay` del QueryClient
- **Pausar cuando inactivo:** React Query tiene `refetchOnWindowFocus: false` por defecto

**Ejemplo de configuración avanzada:**
```typescript
import type { TaskStatusResponseDto } from '@/client';

refetchInterval: (query) => {
  const data = query.state.data as TaskStatusResponseDto | undefined;
  if (!data) return 3000;
  
  // Polling más lento para PENDING
  if (data.status === 'PENDING') return 5000;
  
  // Polling normal para IN_PROGRESS
  if (data.status === 'IN_PROGRESS') return 3000;
  
  // Detener para estados finales
  return false;
}
```

### 11.2 Cacheo con React Query

- **Cache automático:** React Query cachea todas las queries automáticamente
- **Invalidación inteligente:** Usar `queryClient.invalidateQueries()` cuando sea necesario
- **Stale time:** Configurar `staleTime` según necesidades (ej: URLs de descarga por 1 hora)
- **No hacer polling de completadas:** Ya manejado automáticamente por `refetchInterval`

### 11.3 Lazy Loading

- Cargar componentes Meshy solo cuando se necesiten
- Lazy load de modelos 3D en previews
- Usar `enabled: false` en queries hasta que se necesiten

---

## 🧪 12. Testing (Opcional pero Recomendado)

### 12.1 Tests Unitarios

- Servicios API (mocks)
- Hooks (React Testing Library)
- Utilidades

### 12.2 Tests de Integración

- Flujo completo de creación de tarea
- Polling de estado
- Carga de modelo en editor

---

## 📝 13. Checklist de Implementación

### Fase 1: Infraestructura Base
- [x] Instalar React Query (`@tanstack/react-query`)
- [ ] Configurar QueryClient Provider en App
- [x] Cliente OpenAPI generado automáticamente (`client/`)
- [ ] Implementar servicio Meshy (`service/meshy/meshy.service.ts`) con funciones para cada endpoint
- [ ] Crear hooks de React Query (`hooks/useMeshy.ts`)

### Fase 2: React Query Hooks
- [ ] `useMeshyTaskStatus` (query con polling)
- [ ] `useCreateMeshyTask` (mutation)
- [ ] `useCancelMeshyTask` (mutation)
- [ ] `useMeshyDownloadModel` (query)
- [ ] `useMeshyTaskStatusFromMeshy` (query directo a Meshy)
- [ ] `useMeshyAllTasks` (query para todas las tareas)
- [ ] `useMeshyTaskWithStatus` (hook helper combinado)

**Nota:** Todos los tipos se importan desde `@/client` (generado desde OpenAPI).

### Fase 3: Componentes Base ✅ COMPLETADA
- [x] `MeshyTaskCard`
- [x] `MeshyTaskProgress`
- [x] `MeshyImageTo3DDialog` (incluye funcionalidad de lista)

### Fase 4: Funcionalidad Completa ✅ COMPLETADA
- [x] `MeshyImageTo3DDialog`
- [x] `MeshySection` en Sidebar
- [ ] `MeshyModelPreview` (opcional, puede agregarse después)

### Fase 5: Integración ✅ COMPLETADA
- [x] `useMeshyModelLoader` hook
- [x] Cargar modelos en editor
- [x] Manejo de errores básico
- [ ] Notificaciones (puede mejorarse con Snackbar)

### Fase 6: Pulido
- [ ] Optimizaciones de polling
- [ ] Animaciones y transiciones
- [ ] Responsive design
- [ ] Accesibilidad

---

## 🎨 14. Consideraciones de UX

### 14.1 Feedback Visual

- **Estados claros:** Cada estado de tarea debe ser visualmente distinto
- **Progreso visible:** Barra de progreso siempre visible durante generación
- **Feedback inmediato:** Confirmación al crear tarea, al cancelar, etc.

### 14.2 Navegación

- **Flujo intuitivo:** Crear → Ver progreso → Usar modelo
- **Acceso rápido:** Botones de acción siempre visibles
- **Historial accesible:** Fácil acceso a modelos anteriores

### 14.3 Performance

- **Carga progresiva:** Mostrar información básica primero, detalles después
- **Optimización de imágenes:** Comprimir antes de enviar
- **Polling eficiente:** No sobrecargar el servidor

---

## 🔐 15. Seguridad

- Validar tipos de archivo antes de subir
- Limitar tamaño de imágenes
- Sanitizar inputs del usuario
- Manejar tokens/autenticación si se agrega en el futuro

---

## 📚 16. Documentación

- Comentarios JSDoc en funciones públicas
- README específico para el módulo Meshy
- Ejemplos de uso en código

---

## 🚀 17. Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Crear estructura de carpetas**
3. **Implementar Fase 1 (Infraestructura)**
4. **Implementar Fase 2 (Hooks)**
5. **Implementar Fase 3 (Componentes Base)**
6. **Iterar con feedback del usuario**
7. **Completar fases restantes**

---

## 📞 18. Notas Adicionales

- El backend ya está completamente funcional
- Se puede empezar a implementar de inmediato
- La integración con Three.js ya existe en el proyecto
- Material-UI está disponible para componentes
- **React Query maneja todo el estado del servidor** (no necesitamos Zustand para datos)
- Zustand solo se usa para estado de UI si es necesario (ej: dialog abierto/cerrado)

## 🔄 19. Ventajas de React Query

### 19.1 Gestión Automática de Estado
- **Cache automático:** Todas las queries se cachean automáticamente
- **Sincronización:** Múltiples componentes usando la misma query comparten datos
- **Invalidación:** Fácil invalidar y refetch cuando sea necesario

### 19.2 Polling Inteligente
- **Configuración simple:** Solo configurar `refetchInterval`
- **Detención automática:** Se detiene cuando la tarea completa
- **Optimización:** No hace requests innecesarios

### 19.3 Manejo de Estados
- **Loading states:** `isLoading`, `isFetching`, `isPending`
- **Error handling:** `error` tipado y manejable
- **Success callbacks:** `onSuccess` en mutations

### 19.4 DevTools
- React Query DevTools para debugging (opcional)
- Ver todas las queries activas
- Inspeccionar cache

---

**Última actualización:** 2024
**Autor:** Plan de implementación Meshy AI Frontend
