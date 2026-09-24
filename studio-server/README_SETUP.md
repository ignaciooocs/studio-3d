# Guía de Configuración - Studio Server

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `env.example` a `.env`:

```bash
cp env.example .env
```

Edita el archivo `.env` y completa los valores necesarios, especialmente:
- `MESHY_API_KEY`: Tu API key de Meshy.ai
- Credenciales de base de datos si las cambiaste

### 3. Levantar PostgreSQL con Docker

```bash
docker-compose up -d
```

Esto levantará un contenedor de PostgreSQL en el puerto 5432.

Para verificar que está funcionando:

```bash
docker-compose ps
```

Para ver los logs:

```bash
docker-compose logs -f postgres
```

### 4. Verificar Conexión a la Base de Datos

El servidor intentará conectarse automáticamente al iniciar. Si hay problemas, verifica:

1. Que el contenedor esté corriendo: `docker-compose ps`
2. Que las credenciales en `.env` coincidan con las de `docker-compose.yml`
3. Que el puerto 5432 no esté ocupado por otra instancia de PostgreSQL

### 5. Iniciar el Servidor

```bash
# Desarrollo
pnpm run start:dev

# Producción
pnpm run build
pnpm run start:prod
```

## 📋 Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina datos)
docker-compose down -v

# Ver logs
docker-compose logs -f postgres

# Reiniciar servicios
docker-compose restart
```

### Base de Datos

```bash
# Conectarse a PostgreSQL desde el contenedor
docker-compose exec postgres psql -U studio_user -d studio_db

# Backup de la base de datos
docker-compose exec postgres pg_dump -U studio_user studio_db > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U studio_user studio_db < backup.sql
```

## 🔧 Configuración de TypeORM

### Sincronización Automática

En desarrollo, puedes usar `DB_SYNCHRONIZE=true` para que TypeORM cree/actualice las tablas automáticamente.

**⚠️ IMPORTANTE:** Nunca uses `DB_SYNCHRONIZE=true` en producción. Usa migraciones en su lugar.

### Migraciones (Futuro)

Cuando implementes migraciones:

```bash
# Generar migración
pnpm run typeorm migration:generate -- -n MigrationName

# Ejecutar migraciones
pnpm run typeorm migration:run

# Revertir última migración
pnpm run typeorm migration:revert
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm run test

# Tests e2e
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

## 📝 Notas

- El archivo `.env` está en `.gitignore` y no se subirá al repositorio
- Usa `env.example` como referencia para las variables necesarias
- La validación con Joi se ejecuta al iniciar la aplicación
- Si falta alguna variable requerida, la aplicación no iniciará y mostrará un error claro
