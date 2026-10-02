# Recompila el frontend React y lo deja dentro de src/.
# Tras ejecutarlo, solo tienes que subir la carpeta src/ a producción.
Write-Host "==> Compilando frontend (React)..." -ForegroundColor Cyan
docker compose up -d frontend | Out-Null
docker exec frontend sh -lc "cd /app && npm run build"
if ($LASTEXITCODE -ne 0) { Write-Error "Falló la compilación del frontend."; exit 1 }

Write-Host "==> Copiando el build a src/..." -ForegroundColor Cyan
Remove-Item -Recurse -Force src\assets, src\index.html, src\galaxy.svg, src\favicon.ico, src\_redirects -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force material-kit-react-main\dist\* src\

Write-Host "==> Listo. Sube la carpeta 'src/' a producción." -ForegroundColor Green
