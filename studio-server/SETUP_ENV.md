# 🔧 Configuración de Variables de Entorno

## ⚠️ Error de Validación

Si estás viendo este error:
```
Error: Config validation error: "DB_USERNAME" is required. "DB_PASSWORD" is required. "DB_DATABASE" is required. MESHY_API_KEY es requerida
```

## ✅ Solución Rápida

### Opción 1: Crear archivo .env manualmente

1. Ve a la carpeta `studio-server`
2. Copia el archivo `env.example` y renómbralo a `.env`
3. Edita el archivo `.env` y reemplaza:
   - `MESHY_API_KEY=your_meshy_api_key_here` con tu API key real de Meshy.ai

### Opción 2: Usar valores por defecto (solo desarrollo)

He actualizado el esquema de validación para que use valores por defecto en desarrollo. Ahora puedes:

1. **Crear el archivo `.env`** en `studio-server/` con este contenido mínimo:

```env
# Para desarrollo, estos valores son opcionales (tienen defaults)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=studio_user
DB_PASSWORD=studio_password
DB_DATABASE=studio_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# IMPORTANTE: Reemplaza esto con tu API key real
MESHY_API_KEY=your_meshy_api_key_here

# El resto tiene valores por defecto
PORT=3000
NODE_ENV=development
```

2. **O simplemente crear un archivo `.env` vacío** - los valores por defecto se aplicarán automáticamente.

### Opción 3: Usar el script PowerShell

Ejecuta desde la carpeta `studio-server`:

```powershell
.\create-env.ps1
```

Luego edita el archivo `.env` generado y reemplaza `MESHY_API_KEY`.

## 📝 Notas Importantes

- **En desarrollo**: Puedes usar valores por defecto, pero necesitarás una API key válida de Meshy para probar los endpoints.
- **En producción**: Todas las variables son requeridas y deben estar configuradas correctamente.
- El archivo `.env` está en `.gitignore` y no se subirá al repositorio.

## 🔑 Obtener API Key de Meshy

1. Ve a https://www.meshy.ai/api
2. Crea una cuenta o inicia sesión
3. Obtén tu API key
4. Reemplázala en el archivo `.env`

## 🐳 Base de Datos

Si vas a usar PostgreSQL con Docker:

```bash
docker-compose up -d
```

Esto levantará PostgreSQL con las credenciales por defecto que coinciden con los valores del `.env`.
