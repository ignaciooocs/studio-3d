# Cliente API Generado

Este directorio contiene el JSON de la especificación OpenAPI generado desde Swagger.

## Generación del Cliente TypeScript

Para generar el cliente TypeScript tipado para el frontend:

### Prerequisitos

1. Asegúrate de que el servidor backend esté corriendo en `http://localhost:3000`
2. Instala las dependencias del proyecto:
   ```bash
   pnpm install
   ```

### Comandos Disponibles

#### Windows:
```bash
pnpm generate-client:win
```

#### Linux/Mac:
```bash
pnpm generate-client
```

### ¿Qué hace este comando?

1. **Obtiene el JSON de Swagger**: Descarga la especificación OpenAPI desde `http://localhost:3000/api-json` y la guarda en `./src/client/api-json.json`

2. **Genera el cliente TypeScript**: Usa `openapi-generator-cli` para generar un cliente TypeScript tipado basado en axios y lo coloca en `../studio-ui/src/client`

### Configuración del Generador

El generador está configurado con las siguientes opciones:
- **Generator**: `typescript-axios` - Genera un cliente basado en axios
- **Output**: `../studio-ui/src/client` - El cliente se genera en el directorio del frontend
- **Opciones deshabilitadas**: 
  - `apiDocs=false` - No genera documentación de API
  - `modelDocs=false` - No genera documentación de modelos
  - `apiTests=false` - No genera tests de API
  - `modelTests=false` - No genera tests de modelos

### Uso del Cliente Generado

Una vez generado, puedes importar y usar el cliente en tu aplicación React:

```typescript
import { Configuration, MeshyApi } from './client';

// Configurar el cliente
const configuration = new Configuration({
  basePath: 'http://localhost:3000',
});

const meshyApi = new MeshyApi(configuration);

// Usar el cliente
const task = await meshyApi.createImageTo3D({
  imageUrl: 'https://example.com/image.jpg',
  modelType: 'standard',
  targetPolycount: 10000,
});
```

### Notas

- El archivo `api-json.json` está en `.gitignore` ya que se genera automáticamente
- Regenera el cliente cada vez que cambies los endpoints o DTOs en el backend
- Asegúrate de que el servidor esté corriendo antes de ejecutar el comando
