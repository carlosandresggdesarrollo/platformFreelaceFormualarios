#!/usr/bin/env bash
# Recompila el frontend React y lo deja dentro de src/.
# Tras ejecutarlo, solo tienes que subir la carpeta src/ a producción.
set -e
echo "==> Compilando frontend (React)..."
docker compose up -d frontend >/dev/null
docker exec frontend sh -lc "cd /app && npm run build"

echo "==> Copiando el build a src/..."
rm -rf src/assets src/index.html src/galaxy.svg src/favicon.ico src/_redirects
cp -a material-kit-react-main/dist/. src/

echo "==> Listo. Sube la carpeta 'src/' a producción."
