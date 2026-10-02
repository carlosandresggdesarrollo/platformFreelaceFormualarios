-- ============================================================
--  Modulo HOME ADMIN: contenido gestionable del home publico.
--  Tablas: config, nav, carruseles, items, audit log.
--  Idempotente (IF NOT EXISTS).
-- ============================================================

-- Configuracion principal del hero (una sola fila, id=1)
CREATE TABLE IF NOT EXISTS home_config (
  idConfig INT NOT NULL DEFAULT 1,
  tituloPrincipal VARCHAR(255) NOT NULL DEFAULT 'BIOTIPOS UNANI',
  subtitulo VARCHAR(255) NULL DEFAULT 'Conoce tu Temperamento',
  imagenFondo VARCHAR(255) NULL,
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
--  DATOS INICIALES - Biotipos Unani
--  Marco: Rodrigo Garcia Platas y David Duarte
-- ============================================================

-- Config por defecto
INSERT INTO home_config (idConfig, tituloPrincipal, subtitulo, imagenFondo)
VALUES (1, 'BIOTIPOS UNANI', 'Conoce tu Temperamento Natural', '/images/imagen10.png')
ON DUPLICATE KEY UPDATE idConfig = idConfig;

-- Carruseles predefinidos (solo si la tabla esta vacia)
INSERT INTO home_carruseles (nombre, orden)
SELECT 'Los Cuatro Biotipos', 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_carruseles LIMIT 1);
INSERT INTO home_carruseles (nombre, orden)
SELECT 'Caracteristicas Fisicas y Emocionales', 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_carruseles WHERE nombre = 'Caracteristicas Fisicas y Emocionales');
INSERT INTO home_carruseles (nombre, orden)
SELECT 'Equilibrio y Bienestar', 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_carruseles WHERE nombre = 'Equilibrio y Bienestar');

-- Nav por defecto (solo si la tabla esta vacia)
INSERT INTO home_nav (texto, link, orden)
SELECT 'Inicio', '#inicio', 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_nav LIMIT 1);
INSERT INTO home_nav (texto, link, orden)
SELECT 'Biotipos', '#caracteristicas', 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_nav WHERE texto = 'Biotipos');
INSERT INTO home_nav (texto, link, orden)
SELECT 'Caracteristicas', '#caracteristicas-fisicas', 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM home_nav WHERE texto = 'Caracteristicas');
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
    (1, 'mdi:fire', 'Colerico (Bilis Amarilla)',
     'Elemento Fuego. Temperamento caliente y seco. Segun el marco de Rodrigo Garcia Platas y David Duarte, el colerico es un lider nato con gran determinacion y energia. Posee una voluntad fuerte, toma decisiones rapidas y se orienta a la accion. Es el biotipo que impulsa los proyectos y no teme a los desafios.', 1),
    (1, 'mdi:weather-windy', 'Sanguineo (Sangre)',
     'Elemento Aire. Temperamento caliente y humedo. El sanguineo es sociable, optimista y entusiasta por naturaleza. Segun David Duarte, este biotipo se caracteriza por su capacidad de comunicacion, su creatividad y su facilidad para conectar con los demas. Irradia alegria y es el alma de cualquier reunion.', 2),
    (1, 'mdi:water', 'Flematico (Flema)',
     'Elemento Agua. Temperamento frio y humedo. El flematico es calmado, paciente y profundamente compasivo. En la vision de Rodrigo Garcia Platas, este biotipo representa la estabilidad emocional y la perseverancia silenciosa. Es leal, confiable y posee una resistencia interior que lo hace inquebrantable.', 3),
    (1, 'mdi:earth', 'Melancolico (Bilis Negra)',
     'Elemento Tierra. Temperamento frio y seco. El melancolico es analitico, detallista y profundamente reflexivo. Segun la medicina Unani, este biotipo tiene una sensibilidad artistica unica y una capacidad excepcional para el pensamiento profundo. Es perfeccionista, organizado y busca el sentido en todas las cosas.', 4),
    (2, 'mdi:fire-circle', 'Fisico del Colerico',
     'Complexion media a atletica, rasgos angulosos y definidos. Piel calida con tendencia al enrojecimiento. Digestion fuerte y metabolismo acelerado. Mirada penetrante y decidida. Movimientos rapidos y energicos. Propenso a tension muscular y calor corporal elevado.', 1),
    (2, 'mdi:emoticon-happy-outline', 'Emociones del Sanguineo',
     'Expresivo y carismatico, cambia de estado de animo con facilidad pero siempre vuelve al optimismo. Disfruta la variedad y las experiencias nuevas. Tiene facilidad para el humor y la risa. Puede dispersarse si no canaliza su energia. Su mayor fortaleza es la capacidad de motivar e inspirar a otros.', 2),
    (2, 'mdi:heart-pulse', 'Fisico del Flematico',
     'Complexion robusta con tendencia a acumular peso. Rasgos suaves y redondeados. Piel fresca y humeda con buena hidratacion natural. Metabolismo lento pero constante. Movimientos pausados y fluidos. Excelente resistencia fisica de larga duracion. Necesita actividad para mantener su vitalidad.', 3),
    (2, 'mdi:brain', 'Mente del Melancolico',
     'Pensamiento profundo y estructurado. Capacidad excepcional para el analisis y la planificacion. Memoria detallada y precisa. Tendencia a la introspeccion y la creatividad artistica. Puede caer en la sobreanalisis. Su mayor virtud es la capacidad de ver lo que otros pasan por alto y crear obras de gran profundidad.', 4),
    (2, 'mdi:scale-balance', 'El Equilibrio de los Humores',
     'Segun David Duarte, todos poseemos los cuatro humores en diferente proporcion. Conocer tu biotipo dominante te permite entender tus fortalezas naturales y las areas donde necesitas mayor atencion. El objetivo no es cambiar tu naturaleza sino armonizarla para alcanzar tu maximo potencial de salud y bienestar.', 5),
    (3, 'mdi:food-apple-outline', 'Alimentacion por Biotipo',
     'Cada biotipo requiere alimentos especificos para mantener su equilibrio. El colerico necesita alimentos frescos y amargos. El sanguineo se beneficia de sabores astringentes. El flematico requiere alimentos calientes y especiados. El melancolico necesita alimentos calientes y humedos para contrarrestar su sequedad.', 1),
    (3, 'mdi:yoga', 'Actividad Fisica Ideal',
     'El colerico canaliza su energia con deportes intensos y competitivos. El sanguineo disfruta actividades grupales y variadas. El flematico necesita ejercicio regular y estimulante para activar su metabolismo. El melancolico se beneficia de practicas como yoga, caminatas en la naturaleza y ejercicios de estiramiento.', 2),
    (3, 'mdi:meditation', 'Gestion Emocional',
     'Segun Rodrigo Garcia Platas, comprender tu biotipo es la clave para manejar tus emociones. El colerico debe aprender a soltar el control. El sanguineo a cultivar la constancia. El flematico a expresar lo que siente. El melancolico a no quedarse atrapado en sus pensamientos. La autoconciencia es el primer paso.', 3),
    (3, 'mdi:leaf', 'Fitoterapia Unani',
     'La medicina Unani utiliza plantas medicinales especificas para cada temperamento. Infusiones refrescantes para el colerico, tonificantes para el flematico, equilibrantes para el sanguineo y calentadoras para el melancolico. David Duarte enfatiza que las plantas trabajan en armonia con la constitucion natural de cada persona.', 4),
    (3, 'mdi:weather-sunny', 'Estilo de Vida y Rutinas',
     'Cada biotipo florece con rutinas diferentes. El colerico necesita metas claras y retos constantes. El sanguineo necesita variedad y conexion social. El flematico necesita estructura pero sin presion. El melancolico necesita tiempo a solas y espacios de creatividad. Adaptar tu estilo de vida a tu biotipo transforma tu bienestar.', 5),
    (3, 'mdi:account-group', 'Relaciones Interpersonales',
     'Conocer los biotipos mejora las relaciones. El colerico lidera pero debe aprender a escuchar. El sanguineo conecta pero debe profundizar. El flematico sostiene pero debe expresarse. El melancolico comprende pero debe abrirse. Cuando entiendes el temperamento del otro, la empatia y la comunicacion fluyen naturalmente.', 6);
  END IF;
END //
DELIMITER ;
CALL _seed_carrusel_items();
DROP PROCEDURE IF EXISTS _seed_carrusel_items;
