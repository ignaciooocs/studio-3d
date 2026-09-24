# Studio 3D

**Editor 3D en el navegador para preparar piezas antes de imprimirlas, con generación de modelos por IA a partir de una imagen.**

Acomodar una pieza para imprimirla suele implicar abrir un programa de modelado pesado, aunque lo único que haga falta sea rotarla, escalarla y confirmar que entre en la cama de la impresora. Studio 3D mueve ese paso al navegador: insertás figuras y texto, los acomodás sobre la cama de la impresora que elegiste, verificás que entren en el volumen de impresión y exportás a STL.

Y si no tenés el modelo, se puede generar: subís una imagen y el backend la manda a la API de [Meshy](https://www.meshy.ai/) para obtener una malla 3D que cae directo en la escena.

<!-- Capturas: agregar aquí una imagen del editor y un GIF del flujo imagen → 3D. -->

---

## Funcionalidades

### Editor

- Escena 3D sobre Three.js y React Three Fiber, con cama de impresión, volumen de construcción y cubo de orientación para navegar.
- Inserción de cubos, esferas, texto y modelos importados, con gizmos de traslación, rotación y escala.
- Panel de propiedades por objeto: color, material y dimensiones en milímetros.
- Deshacer y rehacer sobre toda la edición, implementado con un patrón de comandos (`AddObject`, `DeleteObject`, `TransformObject`, `ChangeColor`, `ChangeMaterial`, `AddText` y comandos compuestos).
- Tema claro y oscuro.

### Impresoras

Presets con las dimensiones reales de cama y volumen de **Creality Ender 3 V3 KE**, **Bambu Lab A1** y **Bambu Lab A1 Mini**. Al cambiar de impresora, la cama y el volumen de la escena se ajustan solos, así que se ve al instante si la pieza entra.

### Exportación

Exportación de la escena a **STL** (el formato que esperan los laminadores) y a **GLTF**.

### Generación por IA

Flujo completo de imagen a modelo 3D contra la API de Meshy:

1. Se sube una imagen desde el panel de Meshy.
2. El servidor crea la tarea y la persiste en PostgreSQL con su estado (`PENDING`, `IN_PROGRESS`, `SUCCEEDED`, `FAILED`).
3. El frontend consulta el progreso hasta que termina.
4. El modelo resultante se descarga a través del servidor, que hace de proxy para evitar problemas de CORS, y se inserta en la escena.

Formatos soportados por la generación: GLB, FBX, OBJ y USDZ.

---

## Arquitectura

Monorepo con dos aplicaciones independientes:

| Carpeta | Qué es | Stack |
|---|---|---|
| [`studio-ui`](studio-ui/) | El editor | React 19, Vite, Three.js, React Three Fiber, drei, MUI, Zustand, TanStack Query |
| [`studio-server`](studio-server/) | La API | NestJS 11, TypeORM, PostgreSQL, Swagger |

El cliente HTTP del frontend se genera a partir del OpenAPI del servidor (`studio-ui/src/client`), así que los tipos de la API no se escriben a mano de los dos lados.

La documentación de diseño más extensa está en [`docs/`](docs/).

---

## Cómo correrlo

**Requisitos:** Node 20+, PostgreSQL y una API key de [Meshy](https://www.meshy.ai/).

### Backend

```bash
cd studio-server
cp env.example .env     # completar MESHY_API_KEY y las credenciales de la base
npm install
npm run start:dev
```

Queda en `http://localhost:3000`, con la documentación Swagger en `http://localhost:3000/api`.

### Frontend

```bash
cd studio-ui
npm install
npm run dev
```

Queda en `http://localhost:5173`.

### Variables de entorno

| Variable | Para qué |
|---|---|
| `MESHY_API_KEY` | API key de Meshy. Sin esto, la generación por IA no funciona. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Conexión a PostgreSQL. |
| `DB_SYNCHRONIZE`, `DB_LOGGING` | Sincronización de esquema y logs de TypeORM. Solo para desarrollo. |
| `PORT`, `NODE_ENV` | Puerto y entorno del servidor. |

---

## API

Todos los endpoints cuelgan de `/meshy`:

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/meshy/image-to-3d` | Crea una tarea de generación a partir de una imagen. |
| `GET` | `/meshy/tasks` | Lista las tareas guardadas. |
| `GET` | `/meshy/task/:taskId` | Consulta el estado de una tarea en Meshy. |
| `GET` | `/meshy/meshy-task/:taskIdOrMeshyId` | Busca la tarea persistida por id local o id de Meshy. |
| `GET` | `/meshy/task/:taskId/proxy` | Sirve el modelo generado como buffer, evitando CORS en el navegador. |
| `GET` | `/meshy/task/:taskId/download` | Descarga el modelo generado. |
| `DELETE` | `/meshy/task/:taskId` | Elimina una tarea. |

---

## Estado del proyecto

**Funciona hoy:** el editor completo — escena, gizmos, propiedades, deshacer/rehacer, presets de impresoras y exportación a STL y GLTF — y la integración con Meshy de punta a punta.

**Todavía no:** el backend implementa únicamente el módulo de Meshy. La escena vive en el navegador, así que no hay cuentas de usuario ni escenas guardadas en el servidor. El diseño de esa parte — autenticación, CRUD de escenas, plantillas y multi‑tenant — está documentado en [`docs/README.md`](docs/README.md), pero no está construido.

---

## Licencia

[MIT](LICENSE)
