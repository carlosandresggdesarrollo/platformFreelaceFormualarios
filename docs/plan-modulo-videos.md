# Plan de profesionalización — Módulo de Videos

> Objetivo: llevar el módulo de Videos de "funciona a medias" a nivel profesional
> (estable, seguro, escalable y con buena UX), por fases incrementales y verificables.

**Leyenda de esfuerzo:** 🟢 bajo (≤0.5 día) · 🟡 medio (0.5–2 días) · 🔴 alto (2–5 días)
**Estado:** ⬜ pendiente · 🟦 en progreso · ✅ hecho

> **Principio transversal — Logging/auditoría:** TODA operación del módulo de Videos
> (subir, editar, borrar, categoría CRUD, comentario, like, reproducción, job de la cola, login fallido, etc.)
> debe registrar un log. Los logs se guardan **por día** dentro del propio módulo y se consultan
> desde un **módulo de Logs** independiente. Cada entrada trae su fecha/día. Ver **Fase 6**.

---

## Resumen de fases

| Fase | Tema | Resultado | Prioridad |
|------|------|-----------|-----------|
| 1 | Cimientos (que funcione end-to-end) | Subir → procesar → ver, sin atascos | 🔴 Crítica |
| 2 | Seguridad y robustez | Endpoints protegidos, streaming seguro | 🔴 Alta |
| 3 | Experiencia profesional (UX) | Reproductor pro, calidad adaptativa | 🟠 Media-alta |
| 4 | Funcionalidades completas | Tags, búsqueda, analíticas, subida grande | 🟠 Media |
| 5 | Calidad de código / escalabilidad | Prepared statements, storage desacoplado | 🟡 Media-baja |
| 6 | Logging y auditoría (logs por día + visor) | Cada operación registrada, consultable por día | 🔴 Alta |

**Dependencias clave:** Fase 1 desbloquea todo. Fase 2 depende de 1. Fase 3 puede ir en paralelo a 4. Fase 5 es transversal.
La **Fase 6 (logging) es transversal**: su infraestructura (6.1) conviene montarla temprano (junto con Fase 1) para que cada
tarea de las demás fases ya emita logs desde el inicio. El visor (6.2) puede venir después.

---

## FASE 1 — Cimientos (que funcione de verdad)

> Sin esto, una subida se queda colgada en "procesando" para siempre.

### 1.0 ✅ 🟡 Conexión PDO faltante (desbloqueo no previsto)
- **Hallazgo:** el modelo de Videos (y UML) requerían `database.php` (`class database`, PDO) que **no existía**
  → el módulo no podía ni conectarse a la BD.
- **Hecho:** creado `src/config/database.php` (PDO por env, defaults de docker-compose) y require resiliente
  en el modelo (`/config` con respaldo `/src/config`). Además el constructor crea las carpetas de `uploads/`.
- **Pendiente menor:** `ModuleUML` tiene el mismo require viejo (`/src/config/...`); aplicar el mismo ajuste.

### 1.1 ✅ 🟢 Instalar FFmpeg en el contenedor
- **Qué:** agregar `ffmpeg` a la imagen del backend.
- **Archivos:** `docker/Dockerfile` (añadir `ffmpeg` al `apt-get install`).
- **Verificación:** `docker compose exec web_platform ffmpeg -version` y `ffprobe -version` responden.
- **Criterio de aceptación:** el modelo encuentra `/usr/bin/ffmpeg` y `/usr/bin/ffprobe`.

### 1.2 ✅ 🔴 Worker de la cola de procesamiento
- **Qué:** proceso que consume `videos_cola_procesamiento`: toma pendientes → ejecuta FFmpeg
  (convertir web, thumbnail, GIF, extraer metadata) → actualiza estado/progreso → reintenta (máx 3).
- **Archivos nuevos:**
  - `src/administrador/Modules/ModuleVideos/worker/procesar-cola.php` (script CLI).
  - Servicio en `docker-compose.yml`: contenedor worker que corre el script en loop (o cron).
- **Decisiones:** loop con sleep vs cron; lock para no procesar 2 veces; timeout por job.
- **Verificación:** subir un video y ver que pasa pendiente → procesando → completado.
- **Criterio de aceptación:** un video subido queda reproducible sin intervención manual.

### 1.3 ✅ 🟢 Controlador de comentarios faltante
- **Qué:** crear el endpoint que el reproductor ya llama.
- **Archivos nuevos:** `src/administrador/Modules/ModuleVideos/api/administrador.controller.comentario.php`
  (POST crear, GET listar; reusar `agregarComentario()`/`selectComentarios()` del modelo).
- **Verificación:** comentar en el reproductor y que persista/aparezca (ya no 404).

**Hito 1 (Demo):** subir un video real, que se procese solo y se reproduzca con comentarios.

---

## FASE 2 — Seguridad y robustez

### 2.1 ⬜ 🟡 Autenticación y autorización en endpoints
- **Qué:** validar sesión + rol ADMINISTRADOR en cada controller; `idUsuario` desde la sesión, no `$_POST`.
- **Archivos:** todos los `api/*.php` de `ModuleVideos`; helper común de auth (p. ej. `api/_auth.php`).
- **Criterio de aceptación:** sin sesión válida, los endpoints responden 401/403; no se puede suplantar usuario.

### 2.2 ⬜ 🔴 Streaming protegido con HTTP Range
- **Qué:** servir el archivo vía un controller PHP que (a) verifique privado/contraseña/permiso y
  (b) soporte `Range` (206 Partial Content) para seek y reproducción progresiva.
- **Archivos nuevos:** `api/administrador.controller.stream.php`; ajustar el reproductor para apuntar al stream.
- **Criterio de aceptación:** un video privado no es accesible por URL directa; el seek funciona.

### 2.3 ⬜ 🟡 Endurecer la subida
- **Qué:** límite de tamaño explícito, validar MIME real (`finfo`), `escapeshellarg()` en comandos FFmpeg,
  rechazar nombres peligrosos.
- **Archivos:** `api/administrador.controller.upload.php`, `model/administrador.model.videos.php`.
- **Criterio de aceptación:** archivos no permitidos/oversize se rechazan con mensaje claro; sin shell injection.

### 2.4 ⬜ 🟢 Restringir CORS
- **Qué:** quitar `Access-Control-Allow-Origin: *`; permitir solo el origen del frontend.
- **Archivos:** todos los `api/*.php`.

**Hito 2:** módulo seguro: solo admin opera, privados protegidos, subida validada.

---

## FASE 3 — Experiencia profesional (UX)

### 3.1 ⬜ 🟡 Reproductor profesional (Plyr o Video.js)
- **Qué:** reemplazar `<video>` por Plyr/Video.js: velocidad, fullscreen, atajos, subtítulos,
  "reanudar donde quedaste" usando `videos_historial`.
- **Archivos:** `sections/videos/reproductor/view/videos-reproductor-view.tsx`; nueva dependencia npm.
- **Criterio de aceptación:** controles completos + reanudación de progreso.

### 3.2 ⬜ 🔴 Calidad adaptativa (HLS multi-resolución)
- **Qué:** FFmpeg genera 360p/720p/1080p + playlist HLS; el worker lo produce; el player reproduce HLS.
- **Archivos:** worker (1.2), modelo (perfiles de transcodificación), reproductor (hls.js).
- **Criterio de aceptación:** el video ajusta calidad según el ancho de banda.
- **Nota:** depende de Fase 1.2.

### 3.3 ⬜ 🟢 Thumbnails y preview animado en la biblioteca
- **Qué:** mostrar el GIF/preview al pasar el mouse (ya se genera `thumbnailAnimado`).
- **Archivos:** `sections/videos/biblioteca/view/videos-biblioteca-view.tsx`.

### 3.4 ⬜ 🟢 Estados de UI pulidos
- **Qué:** barra de progreso real de procesamiento, skeletons, manejo de error con reintento, empty-states.
- **Archivos:** vistas de `sections/videos/*`.

**Hito 3:** experiencia tipo YouTube/Vimeo (player pro + calidad adaptativa + previews).

---

## FASE 4 — Funcionalidades completas

### 4.1 ⬜ 🟡 Sistema de tags (terminar)
- **Qué:** endpoints CRUD para `videos_tags`/`videos_video_tags`; UI de asignar/filtrar por tag.
- **Archivos:** nuevo `api/administrador.controller.tags.php`; modelo; vistas biblioteca/subir/editar.

### 4.2 ⬜ 🟢 Búsqueda + paginación + orden server-side
- **Qué:** aprovechar limit/offset existentes; orden por vistas/fecha/duración; búsqueda por título/tag.
- **Archivos:** `controller.videos.php`, modelo, vista biblioteca.

### 4.3 ⬜ 🔴 Subida resumible por chunks
- **Qué:** subida por partes (estilo tus) con barra de progreso fiable para archivos grandes.
- **Archivos:** `controller.upload.php` (ensamblado de chunks), `videos-subir-view.tsx`.

### 4.4 ⬜ 🟡 Analíticas
- **Qué:** "más vistos", retención, likes, usando `videos_historial`/`videos_likes`.
- **Archivos:** nuevo controller de stats; pequeña vista/dashboard de videos.

**Hito 4:** búsqueda rica, tags, subida robusta y métricas.

---

## FASE 5 — Calidad de código / escalabilidad (transversal)

### 5.1 ⬜ 🔴 Prepared statements en todo el modelo
- **Qué:** migrar concatenación de strings a sentencias preparadas (mysqli/PDO).
- **Archivos:** `model/administrador.model.videos.php`.

### 5.2 ⬜ 🔴 Almacenamiento desacoplado (S3/MinIO)
- **Qué:** abstraer el storage para usar disco local o S3/MinIO; preparar backups/escala.
- **Archivos:** capa de storage en el modelo; config por entorno.

### 5.3 ⬜ 🟡 Separación en capas + respuestas JSON consistentes
- **Qué:** controller → service → model; formato uniforme `{ success, data, message, error }`.
- **Archivos:** `ModuleVideos/*`.

---

## FASE 6 — Logging y auditoría (logs por día + visor)

> Requisito: **cada movimiento del módulo de Videos genera un log**. Los logs se guardan **por día**
> dentro del propio módulo de Videos, y se **consultan desde un módulo de Logs independiente**.
> Cada entrada lleva su fecha/día.

### Diseño propuesto
- **Almacenamiento:** un archivo por día dentro del módulo →
  `src/administrador/Modules/ModuleVideos/logs/YYYY-MM-DD.log`
  (formato **JSON Lines**: una línea = un evento, fácil de leer y filtrar).
  *Opcional/complementario:* además una tabla `videos_logs` en BD (con índice por `fecha`)
  para consultas/paginación rápidas. Decisión: empezar con archivos por día (cumple "dentro del módulo");
  agregar tabla solo si se necesita búsqueda potente.
- **Estructura de cada entrada (log):**
  `fecha` (día, YYYY-MM-DD), `timestamp` (hora exacta), `idUsuario`, `accion`
  (UPLOAD, UPDATE, DELETE, CATEGORIA_CREATE, COMENTARIO, VISTA, LIKE, JOB_PROCESADO, ERROR, …),
  `entidad` (video/categoría/grupo), `idEntidad`, `resultado` (OK/ERROR), `detalle`/`mensaje`, `ip`.
- **Rotación:** el "día" se deriva de la fecha del servidor; un archivo nuevo por día automáticamente.

### 6.1 ✅ 🟡 Logger del módulo de Videos (infra de escritura)
- **Qué:** clase/función `VideosLogger::log($accion, $entidad, $idEntidad, $resultado, $detalle)`
  que abre/crea `logs/{hoy}.log` y agrega la entrada (con `flock` para concurrencia).
- **Archivos nuevos:** `src/administrador/Modules/ModuleVideos/logs/VideosLogger.php`,
  carpeta `logs/` (con `.gitignore` para no versionar los logs y `index.php` vacío para evitar listado web).
- **Integración:** invocar el logger en **cada** operación del modelo/controladores
  (upload, video CRUD, categorías, grupos, comentario, vista, like, y en el worker de la cola).
- **Criterio de aceptación:** tras cualquier acción, aparece una línea nueva en `logs/{hoy}.log`
  con su día, usuario, acción y resultado.

### 6.2 ⬜ 🟡 Módulo/visor de Logs (consulta desde otro módulo)
- **Qué:** módulo independiente que lista los días disponibles y muestra las entradas de cada día,
  con filtros (acción, usuario, OK/ERROR) y descarga del log del día.
- **Archivos backend nuevos:** `src/administrador/Modules/ModuleLogs/api/`
  - `controller.dias.php` (lista los días con logs disponibles),
  - `controller.logs.php` (lee y pagina las entradas de un día: `?fecha=YYYY-MM-DD`),
  - `controller.descargar.php` (descarga el `.log` del día).
  - `model/model.logs.php` (lee la carpeta `ModuleVideos/logs/`, parsea JSON Lines, filtra).
- **Archivos frontend nuevos:**
  - `material-kit-react-main/src/pages/logs/logs.tsx`
  - `material-kit-react-main/src/sections/logs/view/logs-view.tsx`
    (selector de día / calendario + tabla de eventos + filtros + botón descargar),
  - ruta `/logs` en `routes/sections.tsx` y entrada "Logs" en `nav-config-admin.tsx`.
- **Criterio de aceptación:** desde el módulo de Logs puedo elegir un día y ver todos los
  movimientos del módulo de Videos de ese día, con su fecha, filtrar y descargar el archivo.

### 6.3 ⬜ 🟢 Retención y seguridad de los logs
- **Qué:** evitar acceso web directo a la carpeta `logs/` (solo vía el visor con auth de admin);
  política de retención (p. ej. conservar 90 días, borrar/zip los más viejos).
- **Archivos:** `ModuleVideos/logs/.htaccess` (deny all), tarea de limpieza (cron/worker).
- **Criterio de aceptación:** los logs no son accesibles por URL directa; los antiguos se purgan/comprimen.

**Hito 6:** cada operación del módulo deja rastro; desde el módulo de Logs se navegan por día,
se filtran y se descargan, con su fecha en cada entrada.

> **Nota de generalización:** aunque hoy aplica al módulo de Videos, el visor (6.2) y el logger (6.1)
> conviene diseñarlos para que **otros módulos** puedan escribir sus propios logs diarios
> (cada módulo con su carpeta `logs/{YYYY-MM-DD}.log`), y el módulo de Logs los liste por módulo + día.

---

## Orden recomendado (mayor ROI primero)

1. **Fase 1 completa** (1.1 → 1.2 → 1.3) **+ Fase 6.1 (logger)** — desbloquea el módulo end-to-end
   y desde el primer momento cada operación ya queda registrada.
2. **Fase 2 (2.1, 2.2, 2.3)** — seguridad y streaming sólido.
3. **Fase 6.2 (visor de logs)** — poder consultar por día lo que ya se está registrando.
4. **Fase 3.1 + 3.3 + 3.4** — salto visual con poco esfuerzo.
5. **Fase 4.2 + 4.1** — búsqueda y tags.
6. **Fase 3.2 (HLS)** y **Fase 4.3 (chunks)** — cuando ya hay base estable.
7. **Fase 5 + 6.3** — endurecer calidad/escala y retención de logs de forma continua.

## Riesgos y notas
- **FFmpeg es pesado:** el worker debe limitar concurrencia y CPU para no tumbar el host.
- **Espacio en disco:** multi-resolución + originales crece rápido → prever limpieza/retención (Fase 5.2).
- **Migración de datos:** los cambios de BD deben ir como scripts de migración numerados (08_*.sql).
- **Compatibilidad:** validar todo dentro de Docker (no asumir binarios del host).
