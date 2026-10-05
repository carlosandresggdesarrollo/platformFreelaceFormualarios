# Formularios Web

Plataforma para crear, compartir y analizar formularios y encuestas: analítica con gráficos, reportes PDF/Excel y creación con IA.

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 + MUI v7 + Recharts |
| Backend | PHP 7.4 + Apache |
| Base de datos | MariaDB 10 |
| Contenedores | Docker Compose |

---

## Instalación

Requisitos: Docker Desktop (o Docker Engine + Compose) y Git.

### 1. Clonar y configurar secretos

```bash
git clone <URL_DEL_REPO> platformFreelaceFormualarios
cd platformFreelaceFormualarios
cp .env.example .env
```

Edita `.env` y define **todas** estas variables. Ningún secreto vive en el código ni en git.

| Variable | Para qué sirve |
|---|---|
| `DB_ROOT_PASS` | Contraseña root de MariaDB (solo administración) |
| `DB_USER` / `DB_PASS` | Usuario con permisos mínimos que usa la aplicación |
| `JWT_SECRET` | Firma de los tokens de sesión. Genera uno con `openssl rand -base64 48` |
| `APP_URL` | URL pública del frontend (va en los enlaces de los correos) |
| `DEEPSEEK_API_KEY` | Opcional, para "Crear con IA" |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Correo de confirmación y recuperación de contraseña |

### 2. Levantar

```bash
docker compose up -d --build
```

| Servicio | Dirección | Notas |
|---|---|---|
| Aplicación (frontend) | http://localhost:3039/formularios/sign-in | |
| Backend PHP | http://localhost:8085 | Solo accesible desde esta máquina |
| phpMyAdmin | http://localhost:8088 | Solo local; pide usuario y contraseña |
| MariaDB | localhost:3303 | Solo local |

### 3. Si la base de datos ya existía

En una base nueva, Docker crea el usuario de la aplicación automáticamente. Si ya tenías datos de antes (carpeta `mysql-data/`), créalo una vez:

```bash
bash script/crear_usuario_app.sh
```

### 4. Importar o exportar datos

```bash
# Exportar (te pedirá la contraseña root)
docker exec -i plata_formularios_db mysqldump -uroot -p --routines --triggers --single-transaction formularios > database/formularios_dump.sql

# Importar
docker exec -i plata_formularios_db mysql -uroot -p formularios < database/formularios_dump.sql
```

El dump contiene datos personales y hashes de contraseñas: no lo subas a git.

---

## Seguridad

Todo el backend pasa por un único guardia, `src/formularios/administrador/manejoJWT/api/auth.bootstrap.php`, que PHP ejecuta antes de cada script (`auto_prepend_file` en `docker/php.ini`).

- **Negación por defecto.** Solo responden los endpoints declarados en `auth.policy.php`; cualquier otro archivo PHP devuelve 403.
- **Roles.** Cada endpoint declara qué roles lo pueden usar (`ADMINISTRADOR`, `AUDITOR`, `CLIENTE`) o si es público.
- **Sesión.** Cookie de sesión (web) o `Authorization: Bearer` (app móvil). El id de usuario siempre sale de la sesión, nunca de la petición.
- **Límite de intentos** en login, registro, recuperación de contraseña, envío de formularios e IA.
- **Subidas.** Solo imágenes/audio validados por tipo real, con nombre aleatorio, en `src/uploads/`, donde no se ejecuta PHP.
- **Errores.** Van al log del servidor (`log/`), no a la respuesta.

### Agregar un endpoint nuevo

1. Crea el controlador en `Modules/<Modulo>/api/`.
2. Regístralo en `auth.policy.php`: en `publico` si no requiere login, o en `roles` con los roles permitidos.
3. Usa sentencias preparadas para toda consulta que reciba datos del usuario.

Sin el paso 2 el endpoint responde 403.

### Antes de publicar en producción

- Usa valores propios y nuevos en `.env` (nunca los de desarrollo).
- Sirve todo por HTTPS; la cookie de sesión se marca `Secure` automáticamente.
- No publiques phpMyAdmin ni el puerto de MariaDB.
- Verifica que `auto_prepend_file` esté activo: sin él, el backend se niega a conectar a la base de datos.

---

## Estructura

```
├── docker/                     Imagen PHP + Apache (Dockerfile, php.ini)
├── docker-compose.yml
├── script/                     SQL de inicialización y utilidades
├── src/                        Raíz web del backend
│   ├── uploads/                Archivos subidos (sin ejecución de PHP)
│   └── formularios/administrador/
│       ├── manejoJWT/          Login, tokens y guardia de acceso
│       └── Modules/            Un módulo por funcionalidad (api/ + model/)
└── material-kit-react-main/    Frontend React
    └── src/sections/           Vistas por funcionalidad
```

## Comandos útiles

```bash
docker compose ps                          # estado de los servicios
docker logs -f plata_formularios_web       # log del backend
docker logs -f plata_formularios_frontend  # log del frontend
docker compose restart
docker compose down
```

## Problemas comunes

- **La página carga en blanco tras instalar una dependencia:** `docker compose up -d --build frontend_platform`.
- **"Configuracion de seguridad incompleta":** el contenedor PHP no cargó `docker/php.ini`; reconstruye con `docker compose up -d --build web_platform`.
- **Todas las peticiones fallan tras cambiar `.env`:** recrea el contenedor con `docker compose up -d web_platform`.
- **El login responde 429:** se alcanzó el límite de intentos; espera 15 minutos.
