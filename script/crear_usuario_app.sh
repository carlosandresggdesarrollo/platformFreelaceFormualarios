#!/usr/bin/env bash
# Crea (o actualiza) el usuario de base de datos con permisos minimos que usa la aplicacion.
# Necesario una sola vez en bases que ya existian antes de definir DB_USER/DB_PASS en .env.
# Uso:  bash script/crear_usuario_app.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

docker exec -i -e MYSQL_PWD="$DB_ROOT_PASS" plata_formularios_db mysql -uroot <<SQL
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';
ALTER USER '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM '${DB_USER}'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL
echo "Usuario '${DB_USER}' listo con permisos SELECT/INSERT/UPDATE/DELETE sobre '${DB_NAME}'."
