-- ============================================================
--  Modulo HOME ADMIN: contenido gestionable del home publico.
--  Tablas: config, nav, carruseles, items, audit log.
--  Idempotente (IF NOT EXISTS).
-- ============================================================

-- Configuracion principal del hero (una sola fila, id=1)
CREATE TABLE IF NOT EXISTS home_config (
  idConfig INT NOT NULL DEFAULT 1,
  tituloPrincipal VARCHAR(255) NOT NULL DEFAULT 'Formularios Web',
  subtitulo VARCHAR(255) NULL DEFAULT 'Crea, comparte y analiza formularios',
  imagenFondo VARCHAR(255) NULL,
  registroActivo TINYINT(1) NOT NULL DEFAULT 1,
  nombreSitio VARCHAR(255) DEFAULT 'Formularios Web',
  fechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (idConfig)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Items de navegacion del home publico
CREATE TABLE IF NOT EXISTS home_nav (
  idNav INT AUTO_INCREMENT PRIMARY KEY,
  texto VARCHAR(150) NOT NULL,
  link VARCHAR(255) NOT NULL DEFAULT '#',
  orden INT NOT NULL DEFAULT 0,
  bstate TINYINT(1) NOT NULL DEFAULT 1,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carruseles (3 predefinidos; se pueden renombrar)
CREATE TABLE IF NOT EXISTS home_carruseles (
  idCarrusel INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  bstate TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Items de cada carrusel
CREATE TABLE IF NOT EXISTS home_carrusel_items (
  idItem INT AUTO_INCREMENT PRIMARY KEY,
  idCarrusel INT NOT NULL,
  imagen VARCHAR(255) NULL,
  icono VARCHAR(100) NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NULL,
  link VARCHAR(255) NULL,
  orden INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  bstate TINYINT(1) NOT NULL DEFAULT 1,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_carrusel (idCarrusel),
  INDEX idx_orden (orden),
  CONSTRAINT fk_item_carrusel FOREIGN KEY (idCarrusel)
    REFERENCES home_carruseles(idCarrusel) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Log de auditoria del panel home admin
CREATE TABLE IF NOT EXISTS home_audit_log (
  idLog INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL DEFAULT 0,
  accion VARCHAR(100) NOT NULL,
  entidad VARCHAR(50) NOT NULL,
  idEntidad INT NULL,
  detalle TEXT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha),
  INDEX idx_usuario (idUsuario),
  INDEX idx_entidad (entidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  DATOS INICIALES - Formularios Web
-- ============================================================

-- Config por defecto
INSERT INTO home_config (idConfig, tituloPrincipal, subtitulo, imagenFondo)
VALUES (1, 'Formularios Web', 'Crea, comparte y analiza formularios en tiempo real', NULL)
ON DUPLICATE KEY UPDATE idConfig = idConfig;

-- Carruseles predefinidos (solo si la tabla esta vacia)
INSERT INTO home_carruseles (nombre, orden)
SELECT 'Funcionalidades', 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_carruseles LIMIT 1);
INSERT INTO home_carruseles (nombre, orden)
SELECT 'Como Funciona', 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_carruseles WHERE nombre = 'Como Funciona');
INSERT INTO home_carruseles (nombre, orden)
SELECT 'Beneficios', 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_carruseles WHERE nombre = 'Beneficios');

-- Nav por defecto (solo si la tabla esta vacia)
INSERT INTO home_nav (texto, link, orden)
SELECT 'Inicio', '#inicio', 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_nav LIMIT 1);
INSERT INTO home_nav (texto, link, orden)
SELECT 'Funcionalidades', '#caracteristicas', 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_nav WHERE texto = 'Funcionalidades');
INSERT INTO home_nav (texto, link, orden)
SELECT 'Como Funciona', '#caracteristicas-fisicas', 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_nav WHERE texto = 'Como Funciona');
INSERT INTO home_nav (texto, link, orden)
SELECT 'Contacto', '#contacto', 4 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_nav WHERE texto = 'Contacto');

-- ============================================================
-- Datos semilla de carruseles (solo si la tabla esta vacia)
-- ============================================================
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS _seed_carrusel_items()
BEGIN
  IF (SELECT COUNT(*) FROM home_carrusel_items) = 0 THEN
    INSERT INTO home_carrusel_items (idCarrusel, icono, titulo, descripcion, orden) VALUES
    (1, 'mdi:form-select', 'Crea Formularios',
     'Disena formularios personalizados con preguntas de opcion multiple y abiertas. Organiza las preguntas con drag and drop, publica cuando estes listo y comparte con un enlace unico.', 1),
    (1, 'mdi:chart-line', 'Analitica en Tiempo Real',
     'Visualiza las respuestas a medida que llegan. Graficas de barras, porcentajes por pregunta y tabla de visitantes recientes. Todo se actualiza automaticamente cada pocos segundos.', 2),
    (1, 'mdi:share-variant', 'Comparte con un Link',
     'Cada formulario publicado genera un enlace unico con slug amigable para SEO. Comparte por correo, redes sociales o cualquier canal. Sin necesidad de que el respondiente cree una cuenta.', 3),
    (1, 'mdi:shield-check', 'Roles y Permisos',
     'Tres roles claros: Administrador supervisa todo, Cliente crea y gestiona sus formularios, Auditor revisa en modo solo lectura. Control total sobre quien puede hacer que.', 4),
    (2, 'mdi:account-plus', 'Paso 1: Registrate',
     'Crea tu cuenta como Cliente en segundos. Solo necesitas nombre, email y contrasena. Inmediatamente tendras acceso a tu panel de formularios.', 1),
    (2, 'mdi:pencil-ruler', 'Paso 2: Disena tu Formulario',
     'Usa el editor visual para agregar preguntas. Elige entre opcion multiple o preguntas abiertas. Reorganiza el orden con un simple arrastrar y soltar.', 2),
    (2, 'mdi:send', 'Paso 3: Publica y Comparte',
     'Cuando tu formulario este listo, publicalo con un clic. Se genera automaticamente un enlace con slug amigable. Copialo y compartelo donde quieras.', 3),
    (2, 'mdi:chart-bar', 'Paso 4: Analiza Resultados',
     'Las respuestas llegan en tiempo real a tu panel de estadisticas. Ve totales, porcentajes por opcion y los ultimos visitantes. Toma decisiones basadas en datos.', 4),
    (3, 'mdi:clock-fast', 'Rapido y Sencillo',
     'Crea un formulario en minutos, no en horas. La interfaz intuitiva te guia paso a paso. Sin curva de aprendizaje, sin configuraciones complicadas.', 1),
    (3, 'mdi:eye', 'Monitoreo en Vivo',
     'No esperes a que termine la encuesta. Ve las respuestas llegando en tiempo real. Ideal para eventos, clases o cualquier situacion donde necesites feedback inmediato.', 2),
    (3, 'mdi:link-variant', 'URLs Amigables',
     'Tus formularios tienen URLs limpias y legibles. En lugar de codigos crípticos, tus enlaces incluyen el titulo del formulario para que los respondientes sepan que esperar.', 3),
    (3, 'mdi:cellphone-link', 'Responsive',
     'Tus formularios se ven perfectos en cualquier dispositivo. Los respondientes pueden contestar desde su celular, tablet o computadora sin problemas.', 4);
  END IF;
END //
DELIMITER ;
CALL _seed_carrusel_items();
DROP PROCEDURE IF EXISTS _seed_carrusel_items;
