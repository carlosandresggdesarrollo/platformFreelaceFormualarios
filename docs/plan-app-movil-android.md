# Plan — App móvil Android (React Native) conectada al mismo backend

> Objetivo: crear una app **Android (APK)** en React Native, en una carpeta **hermana** de
> `material-kit-react-main/`, que replique los módulos de la web y consuma el **mismo backend PHP**.
> Si hace falta, se añade una **capa de API/autenticación** para móvil.

**Ubicación del nuevo proyecto:** `./app-movil/` (raíz del repo, al lado de `material-kit-react-main/`).
**Leyenda esfuerzo:** 🟢 bajo · 🟡 medio · 🔴 alto · **Estado:** ⬜ pendiente · 🟦 en curso · ✅ hecho

---

## 1. Realidad del backend (lo que ya hay y lo que falta)

- ✅ Existe infraestructura **JWT** en `src/administrador/manejoJWT/` (login, refresh, logout, `middleware.auth.php`, `jwt.helper.php`).
- ⚠️ Pero **los endpoints de los módulos usan `$_SESSION`** (cookies), no el token. Una app móvil
  no mantiene cookies de sesión PHP de forma natural → hoy esos endpoints **no autenticarían** al usuario móvil.
- ✅ Los controllers ya mandan `Access-Control-Allow-Origin: *` → **CORS no será problema**.
- ✅ Las respuestas ya son **JSON**.

**Conclusión:** no hace falta reescribir todo el backend ni un API nuevo desde cero. Basta con un
**puente de autenticación**: que los endpoints acepten `Authorization: Bearer <token>` y, a partir del
token, pueblen el `$_SESSION["administrador-idUsuario"]` que el código ya usa. Así la app móvil reusa
los mismos endpoints que la web.

---

## 2. Estrategia de arquitectura

```
┌───────────────────────┐         HTTPS + JWT (Bearer)
│  App Android (RN)     │ ───────────────────────────────► ┌──────────────────────────┐
│  Expo + EAS Build     │ ◄─────────────── JSON ──────────  │  Backend PHP (mismo)     │
└───────────────────────┘                                   │  + puente de auth JWT    │
        │                                                   └──────────────────────────┘
        └── material-kit-react-main (web) usa los mismos endpoints
```

- **Una sola fuente de verdad** (el backend PHP actual). La app y la web consumen los mismos endpoints.
- **Auth por token** en móvil (no cookies). La web puede seguir con sesión o migrar a token también.
- **URL base configurable** (en dev apunta a la IP del servidor/PC; en prod al dominio con HTTPS).

---

## 3. Stack recomendado para la app

| Área | Elección | Por qué |
|------|----------|---------|
| Framework | **Expo (managed)** | Camino más rápido a un **APK** con `eas build`; sin Android Studio obligatorio |
| Build APK | **EAS Build** (`eas build -p android --profile preview`) | Genera el `.apk`/`.aab` en la nube o local |
| Navegación | **React Navigation** (stack + tabs/drawer) | Estándar de RN |
| UI | **React Native Paper** (o Gluestack/Tamagui) | Componentes Material listos, parecido a MUI |
| Datos/cache | **TanStack Query** | Igual que se podría usar en web; cache, reintentos |
| HTTP | **axios** con interceptores | Adjunta el Bearer y refresca token |
| Estado auth | **Zustand** o Context | Ligero |
| Token seguro | **expo-secure-store** | Guarda access/refresh token cifrados |
| Formularios | **react-hook-form** | Ligero |
| Fechas | **dayjs** | Igual que la web |

> Alternativa: **bare React Native** (sin Expo) si necesitas librerías nativas no soportadas por Expo.
> Para este caso (consumir API REST), **Expo es suficiente y mucho más rápido**.

---

## 4. Estructura de carpetas propuesta (`app-movil/`)

```
app-movil/
├── app.json / eas.json          # Config Expo + perfiles de build
├── package.json
├── src/
│   ├── api/
│   │   ├── client.ts            # axios + baseURL + interceptores (Bearer/refresh)
│   │   ├── auth.api.ts          # login, refresh, logout
│   │   ├── agenda.api.ts        # endpoints de agenda
│   │   ├── proyectos.api.ts
│   │   ├── usuarios.api.ts
│   │   ├── deepseek.api.ts
│   │   └── ...
│   ├── config/
│   │   └── env.ts               # API_BASE_URL (por entorno)
│   ├── store/
│   │   └── auth.store.ts        # token, usuario, isAuthenticated
│   ├── navigation/
│   │   ├── RootNavigator.tsx    # Auth vs App
│   │   ├── AppTabs.tsx          # tabs/drawer de módulos
│   │   └── ...
│   ├── screens/
│   │   ├── auth/LoginScreen.tsx
│   │   ├── dashboard/...
│   │   ├── agenda/...
│   │   ├── proyectos/...
│   │   ├── usuarios/...
│   │   ├── deepseek/ChatScreen.tsx
│   │   └── ...
│   ├── components/              # UI reutilizable
│   └── theme/                   # colores (reusar paleta de la web)
└── assets/                      # icono, splash
```

---

## 5. Mapa de módulos web → pantallas móviles

| Web | App móvil | Prioridad |
|-----|-----------|-----------|
| Login (JWT) | LoginScreen | 🔴 base |
| Dashboard / Calendario | DashboardScreen | 🟠 |
| Mi Agenda (tareas + puntitos) | AgendaScreen | 🟠 |
| Seguridad / Usuarios | UsuariosScreen (listar/crear) | 🟠 |
| Proyectos (Jira) | ProyectosScreen + detalle | 🟠 |
| DeepSeek Chat | ChatScreen | 🟢 (reusa endpoint chat) |
| DeepSeek Tareas programadas | TareasIAScreen | 🟢 |
| Videos | VideosScreen (ver/reproducir) | 🟢 |
| Asistente flotante | Botón flotante global (opcional) | 🟢 |

---

## FASE 0 — Puente de autenticación en el backend (habilitador)

> Sin esto, la app no puede autenticar contra los endpoints existentes.

### 0.1 ✅ 🟡 Bootstrap de auth por token
- **Qué:** un archivo `auth.bootstrap.php` que: lee `Authorization: Bearer <token>`, lo valida con
  `manejoJWT/api/jwt.helper.php`, y si es válido setea `$_SESSION["administrador-idUsuario"]` (y demás)
  igual que haría el login web. Si no hay token, se comporta como hoy (sesión por cookie).
- **Integración:** incluirlo al inicio de los controllers (o vía `auto_prepend_file` en Apache para todo `/administrador`).
- **Resultado:** los mismos endpoints sirven web (cookie) y móvil (token), sin duplicar lógica.

### 0.2 ⬜ 🟢 Confirmar endpoints de login/refresh
- Verificar formato exacto de `login.controller.php` y `refresh.controller.php` (qué reciben/devuelven)
  para implementarlos en la app.

### 0.3 ⬜ 🟢 (Opcional) Endpoint de "perfil/me"
- Un `me.php` que con el token devuelva el usuario actual (para inicializar la sesión de la app).

---

## FASE 1 — Setup del proyecto móvil

### 1.1 ⬜ 🟢 Crear proyecto Expo en `app-movil/`
- `npx create-expo-app app-movil` (plantilla TypeScript). Instalar deps base.
### 1.2 ⬜ 🟢 Configurar `env.ts` con `API_BASE_URL` (dev = IP local del backend, prod = dominio HTTPS).
### 1.3 ⬜ 🟢 Cliente HTTP (`api/client.ts`): axios con baseURL + interceptores (adjuntar Bearer, refrescar al 401).
### 1.4 ⬜ 🟢 Tema/paleta reusando los colores de la web; navegación base (Auth vs App).

---

## FASE 2 — Autenticación

### 2.1 ⬜ 🟡 LoginScreen → `login.controller.php` → guardar access/refresh en `expo-secure-store`.
### 2.2 ⬜ 🟡 Auto-refresh de token (interceptor 401 → refresh → reintento).
### 2.3 ⬜ 🟢 Logout + arranque (si hay token válido, entra directo).
### 2.4 ⬜ 🟢 Guard de navegación (Auth stack vs App stack).

---

## FASE 3 — Módulos núcleo (uno por uno, reusando endpoints)

> Cada módulo: pantalla de lista + crear/editar, conectado a sus endpoints PHP.

### 3.1 ⬜ 🟡 **Mi Agenda** — grilla/lista por día + marcar puntito + progreso (endpoints `ModuleAgenda`).
### 3.2 ⬜ 🟡 **Usuarios** — listar + crear (endpoints `ModuleUsersUsers`).
### 3.3 ⬜ 🟡 **Proyectos** — listar + crear + detalle (endpoints `ModuleJiraProyectos`).
### 3.4 ⬜ 🟢 **DeepSeek Chat** — chat con selección de modelo y tokens (endpoint chat).
### 3.5 ⬜ 🟢 **Dashboard** — KPIs/calendario (endpoints de stats).
### 3.6 ⬜ 🟢 **Videos** — listar y reproducir (player nativo `expo-av`).

---

## FASE 4 — Build del APK y distribución

### 4.1 ⬜ 🟡 Configurar `eas.json` (perfil `preview` = APK; `production` = AAB para Play Store).
### 4.2 ⬜ 🟡 `eas build -p android --profile preview` → descargar el **APK** e instalarlo en el teléfono.
### 4.3 ⬜ 🟢 Icono, splash, nombre y versión de la app.
### 4.4 ⬜ 🟢 (Opcional) Publicar en Play Store (AAB + cuenta de desarrollador).

---

## FASE 5 — Pulido

- Manejo de errores y estados de carga (skeletons), modo offline básico (cache de TanStack Query).
- Notificaciones push (ej. recordatorios de la agenda o resultados de tareas IA) con `expo-notifications`.
- Asistente flotante (como en la web) si se desea.

---

## Riesgos y consideraciones

1. **HTTPS obligatorio:** Android bloquea HTTP en claro por defecto. En prod el backend debe ir por **HTTPS**
   (o configurar `usesCleartextTraffic` solo para pruebas en red local).
2. **URL base / red local:** en desarrollo, el teléfono debe alcanzar el backend (IP de la PC en la LAN,
   no `localhost`). El backend hoy corre en Docker (puerto 80).
3. **Sesión vs token (Fase 0):** es el habilitador; sin el puente, los endpoints no autentican al móvil.
4. **Subida de archivos** (videos/PDF): usar `expo-document-picker`/`expo-image-picker` + `FormData`.
5. **Reutilización de código:** se pueden compartir **tipos** y helpers en un paquete común, pero la UI de
   RN es distinta a la web (no se reusan componentes MUI). Se reusan **API contracts** y lógica.
6. **Versionado del APK** y actualizaciones (EAS Update / OTA para JS, build nuevo para cambios nativos).

---

## Orden recomendado (mayor ROI)
1. **Fase 0.1** (puente de auth) — habilita todo lo demás.
2. **Fase 1 + 2** (setup + login) — app que entra y autentica.
3. **Fase 3.4 (DeepSeek Chat)** y **3.1 (Agenda)** — módulos de alto valor y endpoints simples.
4. **Fase 3.2/3.3** (Usuarios, Proyectos).
5. **Fase 4** (generar el APK y probar en el teléfono).
6. **Fase 5** (pulido, push, offline).

## Decisiones que necesito de ti antes de programar
- **¿Expo (recomendado) o bare React Native?**
- **¿Qué módulos primero?** (sugerido: Login → Agenda → DeepSeek Chat).
- **¿URL del backend** para dev (IP de la PC en la red) y si ya tienes **dominio + HTTPS** para prod?
