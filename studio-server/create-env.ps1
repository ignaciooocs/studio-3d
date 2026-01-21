# Script para crear archivo .env desde env.example
$envExample = Join-Path $PSScriptRoot "env.example"
$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envExample) {
    Copy-Item $envExample $envFile -Force
    Write-Host "✅ Archivo .env creado exitosamente desde env.example" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Edita el archivo .env y reemplaza:" -ForegroundColor Yellow
    Write-Host "   - MESHY_API_KEY=your_meshy_api_key_here" -ForegroundColor Yellow
    Write-Host "     con tu API key real de Meshy.ai" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error: No se encontró el archivo env.example" -ForegroundColor Red
    exit 1
}
