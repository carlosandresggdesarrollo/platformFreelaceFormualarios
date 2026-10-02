-- ============================================================
--  Modal de Bienvenida configurable
-- ============================================================

CREATE TABLE IF NOT EXISTS home_modal_bienvenida (
  idConfig INT NOT NULL DEFAULT 1 PRIMARY KEY,
  activo TINYINT(1) NOT NULL DEFAULT 0,
  textoAgradecimiento TEXT,
  textoTerapeutas TEXT,
  textoColaboradores TEXT,
  textoCursos TEXT,
  fechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS home_modal_contactos (
  idContacto INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('terapeuta','colaborador','curso') NOT NULL DEFAULT 'colaborador',
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  enlace VARCHAR(500),
  enlaceTexto VARCHAR(200),
  orden INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  bstate TINYINT(1) NOT NULL DEFAULT 1,
  fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Config por defecto
INSERT INTO home_modal_bienvenida (idConfig, activo, textoAgradecimiento, textoTerapeutas, textoColaboradores, textoCursos)
VALUES (
  1, 1,
  'Agradezco profundamente a Rodrigo Garcia Platas y a toda la comunidad por apoyarme en este proyecto sin fines de lucro. Hago un hincapie en que las personas que buscan bienestar merecen acceso a informacion de calidad sobre los biotipos Unani. Este proyecto nace del amor por la medicina tradicional y el deseo de compartir este conocimiento ancestral con todos.',
  'Si necesitas una terapia con una persona profesional, tengo los siguientes contactos de confianza:',
  'Agradezco a los siguientes colaboradores que me han apoyado con su conocimiento y experiencia:',
  'Si deseas profundizar tus conocimientos con un curso profesional, puedes contactar directamente:'
)
ON DUPLICATE KEY UPDATE idConfig = idConfig;

-- Datos de prueba: Terapeutas
INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
SELECT 'terapeuta', 'Dra. Maria Elena Ramirez', 'Terapeuta holistica certificada en Medicina Unani y Naturopatia. Mas de 15 anos de experiencia en equilibrio de biotipos y fitoterapia personalizada.', '+52 55 1234 5678', 'dra.ramirez@ejemplo.com', NULL, NULL, 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_modal_contactos WHERE tipo='terapeuta' LIMIT 1);

INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
SELECT 'terapeuta', 'Lic. Roberto Sanchez Flores', 'Psicologo clinico especializado en terapia cognitivo-conductual. Atencion presencial y en linea. Cedula profesional: 12345678.', '+52 33 9876 5432', 'lic.sanchez@ejemplo.com', NULL, NULL, 2
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_modal_contactos WHERE tipo='terapeuta' AND nombre LIKE '%Roberto%');

-- Datos de prueba: Colaboradores
INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
SELECT 'colaborador', 'Lic. Ana Patricia Lopez', 'Abogada especialista en derecho familiar y derechos humanos. Ha colaborado con asesoria legal gratuita para la comunidad del proyecto.', '+52 55 5555 1234', 'ana.lopez@ejemplo.com', NULL, NULL, 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_modal_contactos WHERE tipo='colaborador' LIMIT 1);

INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
SELECT 'colaborador', 'Ing. Carlos Martinez Ruiz', 'Ingeniero en sistemas y desarrollador web. Apoyo tecnico voluntario en la infraestructura del proyecto desde sus inicios.', '+52 81 4321 8765', 'carlos.mtz@ejemplo.com', NULL, NULL, 2
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_modal_contactos WHERE tipo='colaborador' AND nombre LIKE '%Carlos Martinez%');

INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
SELECT 'colaborador', 'Mtra. Lucia Hernandez Vega', 'Nutriologa clinica con maestria en medicina integrativa. Aporta contenido sobre alimentacion segun biotipos Unani.', '+52 55 7777 3333', 'lucia.hdz@ejemplo.com', NULL, NULL, 3
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_modal_contactos WHERE tipo='colaborador' AND nombre LIKE '%Lucia%');

-- Datos de prueba: Cursos
INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
SELECT 'curso', 'Curso de Biotipos Unani con Rodrigo Garcia Platas', 'Curso completo de introduccion a los cuatro biotipos de la medicina Unani. Aprende a identificar tu temperamento y el de los demas.', NULL, NULL, 'https://www.facebook.com/RodrigoGarciaPlatas', 'Visitar pagina de Facebook', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_modal_contactos WHERE tipo='curso' LIMIT 1);

INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
SELECT 'curso', 'Diplomado en Medicina Tradicional Unani', 'Diplomado avalado por instituciones de medicina integrativa. Incluye modulos de fitoterapia, diagnostico por temperamento y nutricion personalizada.', NULL, 'info@diplomadounani.ejemplo.com', 'https://www.ejemplo.com/diplomado-unani', 'Mas informacion del diplomado', 2
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM home_modal_contactos WHERE tipo='curso' AND nombre LIKE '%Diplomado%');
