-- =============================================
-- MÓDULO BIOTIPOS UNANI — Determinación de Biotipo
-- =============================================

-- Fases del cuestionario de biotipos
CREATE TABLE IF NOT EXISTS biotipo_fases (
  idFase INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  totalPreguntas INT NOT NULL DEFAULT 0,
  orden INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Preguntas de cada fase
CREATE TABLE IF NOT EXISTS biotipo_preguntas (
  idPregunta INT AUTO_INCREMENT PRIMARY KEY,
  idFase INT NOT NULL,
  bloque VARCHAR(10) DEFAULT NULL,
  bloqueNombre VARCHAR(100) DEFAULT NULL,
  orden INT NOT NULL DEFAULT 0,
  textoPregunta TEXT NOT NULL,
  FOREIGN KEY (idFase) REFERENCES biotipo_fases(idFase) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opciones de cada pregunta
-- biotipoCode: S=Sanguíneo, C=Colérico, M=Melancólico, F=Flemático (NULL para Fase 4 escala)
-- valorEscala: 0,1,2,3 para preguntas de confirmación (Fase 4/5)
CREATE TABLE IF NOT EXISTS biotipo_opciones (
  idOpcion INT AUTO_INCREMENT PRIMARY KEY,
  idPregunta INT NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  textoOpcion TEXT NOT NULL,
  biotipoCode CHAR(1) DEFAULT NULL,
  valorEscala INT DEFAULT NULL,
  FOREIGN KEY (idPregunta) REFERENCES biotipo_preguntas(idPregunta) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sesiones de test (un participante haciendo el cuestionario completo)
CREATE TABLE IF NOT EXISTS biotipo_sesiones (
  idSesion INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT DEFAULT NULL,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(500) NOT NULL,
  faseActual INT NOT NULL DEFAULT 1,
  preguntaActual INT NOT NULL DEFAULT 0,
  biotipoDominante CHAR(1) DEFAULT NULL,
  biotipoSubdominante CHAR(1) DEFAULT NULL,
  completado TINYINT(1) NOT NULL DEFAULT 0,
  -- Resultados Fase 2
  puntosS INT DEFAULT 0,
  puntosC INT DEFAULT 0,
  puntosM INT DEFAULT 0,
  puntosF INT DEFAULT 0,
  porcentajeS DECIMAL(5,2) DEFAULT 0,
  porcentajeC DECIMAL(5,2) DEFAULT 0,
  porcentajeM DECIMAL(5,2) DEFAULT 0,
  porcentajeF DECIMAL(5,2) DEFAULT 0,
  -- Resultados Fase 4 (confirmación dominante)
  confirmacionDominantePuntos INT DEFAULT 0,
  confirmacionDominantePorc DECIMAL(5,2) DEFAULT 0,
  -- Resultados Fase 5 (confirmación subdominante)
  confirmacionSubdominantePuntos INT DEFAULT 0,
  confirmacionSubdominantePorc DECIMAL(5,2) DEFAULT 0,
  -- Resultado final combinado
  afinidadFinalDominante DECIMAL(5,2) DEFAULT 0,
  afinidadFinalSubdominante DECIMAL(5,2) DEFAULT 0,
  fechaInicio DATETIME DEFAULT CURRENT_TIMESTAMP,
  fechaFin DATETIME DEFAULT NULL,
  FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Respuestas individuales
CREATE TABLE IF NOT EXISTS biotipo_respuestas (
  idRespuesta INT AUTO_INCREMENT PRIMARY KEY,
  idSesion INT NOT NULL,
  idPregunta INT NOT NULL,
  idOpcion INT NOT NULL,
  idFase INT NOT NULL,
  biotipoCode CHAR(1) DEFAULT NULL,
  valorEscala INT DEFAULT NULL,
  fechaRespuesta DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idSesion) REFERENCES biotipo_sesiones(idSesion) ON DELETE CASCADE,
  FOREIGN KEY (idPregunta) REFERENCES biotipo_preguntas(idPregunta) ON DELETE CASCADE,
  FOREIGN KEY (idOpcion) REFERENCES biotipo_opciones(idOpcion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Columna en usuarios para marcar que requiere cambio de contraseña
ALTER TABLE usuarios ADD COLUMN requiereCambioPass TINYINT(1) DEFAULT 0 AFTER bstate;

-- =============================================
-- DATOS: Fases
-- =============================================
INSERT INTO biotipo_fases (numero, nombre, descripcion, totalPreguntas, orden) VALUES
(1, 'Screening', 'Preguntas iniciales de contexto para determinar tendencias generales', 10, 1),
(2, 'Determinación General', '30 preguntas puntuadas para calcular porcentajes por biotipo', 30, 2),
(3, 'Confirmación Sanguíneo', '30 preguntas específicas del biotipo Sanguíneo (Aire/Sangre)', 30, 3),
(4, 'Confirmación Colérico', '30 preguntas específicas del biotipo Colérico (Fuego/Bilis amarilla)', 30, 4),
(5, 'Confirmación Melancólico', '30 preguntas específicas del biotipo Melancólico (Tierra/Bilis negra)', 30, 5),
(6, 'Confirmación Flemático', '30 preguntas específicas del biotipo Flemático (Agua/Flema)', 30, 6);

-- =============================================
-- FASE 1 — SCREENING (10 preguntas, reformuladas a opción múltiple)
-- =============================================

INSERT INTO biotipo_preguntas (idFase, orden, textoPregunta) VALUES
(1, 1, '¿Cómo es tu relación con la temperatura?'),
(1, 2, 'Cuando recibes una mala noticia inesperada (como que te cancelaron un plan importante), ¿qué es lo primero que haces?'),
(1, 3, '¿Cómo te llevas con el hambre?'),
(1, 4, '¿Cómo es tu relación con el sueño?'),
(1, 5, 'Sin ejercicio ni dieta, ¿cómo es tu tendencia corporal natural?'),
(1, 6, 'Te ofrecen dos trabajos el mismo día y tienes 24 horas para decidir. ¿Qué haces?'),
(1, 7, 'Alguien te dice algo que te parece injusto frente a otras personas. ¿Qué pasa?'),
(1, 8, '¿Cómo se comporta tu energía durante el día?'),
(1, 9, '¿Qué tipo de situaciones te dejan sin energía más rápido?'),
(1, 10, '¿Cómo son tu piel y tu digestión de forma natural?');

-- Opciones Fase 1 (S, C, M, F por pregunta)
-- Pregunta 1: Temperatura
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=1), 1, 'Variable: a veces tengo calor, a veces frío. Mis manos y pies cambian de temperatura durante el día.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=1), 2, 'Caluroso casi siempre. Sudo con facilidad y prefiero ambientes frescos.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=1), 3, 'Friolento. Mis manos y pies suelen estar fríos. Necesito cobijas y capas extras.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=1), 4, 'Estable. No me afecta mucho ni el calor ni el frío. Mi cuerpo mantiene una temperatura pareja.', 'F');

-- Pregunta 2: Reacción a mala noticia
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=2), 1, 'Busco a alguien con quien hablar o me distraigo. No me gusta quedarme solo con la sensación.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=2), 2, 'Siento frustración o enojo. Quiero hacer algo al respecto de inmediato.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=2), 3, 'Me retiro a pensar. Analizo qué pasó y por qué, en silencio.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=2), 4, 'Lo absorbo con calma. "Ya ni modo." Espero a que pase sin alterarme.', 'F');

-- Pregunta 3: Hambre
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=3), 1, 'Irregular. Hay días que como mucho y otros que casi nada. Depende de mi ánimo.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=3), 2, 'Fuerte y puntual. Si no como a tiempo me pongo de mal humor. Como rápido y con buen apetito.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=3), 3, 'Sensible. Puedo saltarme comidas sin problema pero ciertos alimentos me caen mal. Como poco.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=3), 4, 'Estable pero lento. Rara vez tengo urgencia de comer. Disfruto la comida despacio y no me altero si se retrasa.', 'F');

-- Pregunta 4: Sueño
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=4), 1, 'Ligero e irregular. Despierto varias veces, sueños vívidos. Con pocas horas funciono pero con picos de energía.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=4), 2, 'Corto pero funcional. Me cuesta apagar la mente pero con pocas horas rindo bien.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=4), 3, 'Me cuesta dormir. Le doy vueltas a todo en la cama. Si me duermo, despierto temprano con la mente activa.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=4), 4, 'Profundo y prolongado. Necesito muchas horas y me cuesta despertar. Duermo pesado.', 'F');

-- Pregunta 5: Tendencia corporal
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=5), 1, 'Proporcional. Ni muy flaco ni muy robusto. Subo de peso si me descuido pero lo bajo sin tanto esfuerzo.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=5), 2, 'Atlético o angular. Me marco con poco esfuerzo. Mi cuerpo responde rápido al ejercicio.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=5), 3, 'Delgado. Me cuesta subir de peso y de masa muscular. Se me notan los huesos.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=5), 4, 'Robusto con tendencia a retener. Subo de peso fácil y me cuesta mucho bajarlo. Cuerpo amplio y suave.', 'F');

-- Pregunta 6: Decisión rápida
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=6), 1, 'Le pregunto a varias personas, pido opiniones y al final decido con el instinto del momento.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=6), 2, 'Decido rápido. Evalúo cuál me da más control y actúo antes de que se acabe el tiempo.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=6), 3, 'Hago una lista de pros y contras. Investigo, comparo y analizo hasta sentir que tengo la respuesta correcta.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=6), 4, 'Espero a ver qué siento al despertar. Si la decisión se puede posponer, la pospongo.', 'F');

-- Pregunta 7: Conflicto frente a otros
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=7), 1, 'Me incomoda mucho. Busco suavizar la situación, hacer un chiste o cambiar de tema para que no escale.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=7), 2, 'Siento enojo y lo confronto. No me quedo callado si considero que algo es incorrecto.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=7), 3, 'Por fuera me quedo callado, pero por dentro analizo todo. Me afecta más de lo que muestro.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=7), 4, 'Lo dejo pasar. No vale la pena alterarse. Observo y si me preguntan digo algo, si no, no.', 'F');

-- Pregunta 8: Energía durante el día
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=8), 1, 'Tiene picos y valles marcados. Puedo estar muy activo unas horas y luego caer sin explicación.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=8), 2, 'Arranque fuerte por la mañana y sostenida. La presión me activa más. Rindo hasta tarde si es necesario.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=8), 3, 'Moderada y variable. Funciono mejor cuando tengo estructura. El caos me drena.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=8), 4, 'Constante y baja. Arranco lento pero una vez que agarro ritmo soy parejo. No tengo picos extremos.', 'F');

-- Pregunta 9: Qué te drena
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=9), 1, 'Las que exigen estar solo mucho tiempo sin interacción social.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=9), 2, 'Las que requieren esperar sin hacer nada. La inacción me desespera.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=9), 3, 'Las que exigen precisión y detalle bajo presión de tiempo. O la confrontación emocional directa.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=9), 4, 'Las que implican confrontación o cambios abruptos en mi rutina.', 'F');

-- Pregunta 10: Piel y digestión
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=10), 1, 'Piel mixta, cambia con el clima. Digestión irregular, depende de mi estado emocional.', 'S'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=10), 2, 'Piel grasa o con tendencia a enrojecerse. Digestión rápida y fuerte, rara vez tengo problemas.', 'C'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=10), 3, 'Piel seca y sensible. Digestión irregular con tendencia a inflamación, gases o estreñimiento.', 'M'),
((SELECT idPregunta FROM biotipo_preguntas WHERE idFase=1 AND orden=10), 4, 'Piel suave y bien hidratada. Digestión lenta pero estable, me siento pesado después de comer.', 'F');

-- =============================================
-- FASE 2 — DETERMINACIÓN GENERAL (30 preguntas)
-- =============================================

-- BLOQUE A: Emocionalidad (1-8)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(2, 'A', 'Emocionalidad y mundo interno', 1, 'Cuando estás solo y sin obligaciones un domingo, tu estado emocional natural tiende a ser:'),
(2, 'A', 'Emocionalidad y mundo interno', 2, 'La emoción que aparece con más frecuencia en tu vida cotidiana, incluso cuando las cosas van bien, es:'),
(2, 'A', 'Emocionalidad y mundo interno', 3, 'Cuando algo te conmueve (una película, una canción, un recuerdo), ¿cómo lo vives?'),
(2, 'A', 'Emocionalidad y mundo interno', 4, '¿Con qué frecuencia cambias de estado de ánimo en un mismo día?'),
(2, 'A', 'Emocionalidad y mundo interno', 5, 'Cuando te sientes herido emocionalmente, tu primera reacción interna es:'),
(2, 'A', 'Emocionalidad y mundo interno', 6, '¿Qué tan fácil es para ti identificar y nombrar lo que sientes?'),
(2, 'A', 'Emocionalidad y mundo interno', 7, 'En una reunión donde todos están opinando con intensidad sobre algo, tu tendencia natural es:'),
(2, 'A', 'Emocionalidad y mundo interno', 8, '¿Cómo es tu relación con el rencor?');

-- BLOQUE B: Estrés (9-15)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(2, 'B', 'Reacción al estrés y presión', 9, 'Estás en un embotellamiento y vas tarde a algo importante. ¿Qué pasa adentro de ti?'),
(2, 'B', 'Reacción al estrés y presión', 10, 'Te piden que entregues un proyecto en la mitad del tiempo que necesitas. Tu primera reacción es:'),
(2, 'B', 'Reacción al estrés y presión', 11, 'Llevas varios días con presión acumulada. ¿Dónde lo sientes en el cuerpo?'),
(2, 'B', 'Reacción al estrés y presión', 12, 'Cuando sientes que algo se sale de tu control, tu mecanismo natural es:'),
(2, 'B', 'Reacción al estrés y presión', 13, '¿Cómo duermes en periodos de mucho estrés?'),
(2, 'B', 'Reacción al estrés y presión', 14, 'Alguien cercano te critica algo que hiciste con buena intención. Tu reacción interna inmediata es:'),
(2, 'B', 'Reacción al estrés y presión', 15, 'En una crisis real (un accidente, una emergencia), ¿cómo actúas?');

-- BLOQUE C: Morfología (16-21)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(2, 'C', 'Morfología y constitución física', 16, 'Sin ejercicio ni dieta, tu tendencia corporal natural desde la adolescencia ha sido:'),
(2, 'C', 'Morfología y constitución física', 17, 'Tu relación con la temperatura es:'),
(2, 'C', 'Morfología y constitución física', 18, 'Tu piel tiende naturalmente a ser:'),
(2, 'C', 'Morfología y constitución física', 19, 'Tu digestión y metabolismo natural tienden a ser:'),
(2, 'C', 'Morfología y constitución física', 20, 'Tu estructura ósea y tus rasgos faciales tienden a ser:'),
(2, 'C', 'Morfología y constitución física', 21, 'Tu relación con el ejercicio físico es:');

-- BLOQUE D: Acción (22-27)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(2, 'D', 'Toma de acción, decisiones y voluntad', 22, 'Cuando tienes una idea que te entusiasma, ¿qué pasa entre la idea y la acción?'),
(2, 'D', 'Toma de acción, decisiones y voluntad', 23, '¿Cómo manejas los pendientes y las tareas acumuladas?'),
(2, 'D', 'Toma de acción, decisiones y voluntad', 24, '¿Cuánto te cuesta decir "no" a algo que no quieres hacer?'),
(2, 'D', 'Toma de acción, decisiones y voluntad', 25, 'Tienes que tomar una decisión importante y hay información contradictoria. ¿Qué haces?'),
(2, 'D', 'Toma de acción, decisiones y voluntad', 26, '¿Cómo te relacionas con la autoridad y las jerarquías?'),
(2, 'D', 'Toma de acción, decisiones y voluntad', 27, 'Cuando algo sale mal por tu culpa, tu reacción natural es:');

-- BLOQUE E: Miedos (28-30)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(2, 'E', 'Miedos constitucionales y vulnerabilidades', 28, 'Si tuvieras que elegir, ¿cuál de estos escenarios te genera más incomodidad profunda?'),
(2, 'E', 'Miedos constitucionales y vulnerabilidades', 29, '¿Qué tipo de situación te haría perder el sueño durante varias noches?'),
(2, 'E', 'Miedos constitucionales y vulnerabilidades', 30, 'Si pudieras eliminar una sola cosa de tu vida emocional para siempre, elegirías:');

-- =============================================
-- OPCIONES FASE 2 — Se insertan con procedimiento para usar los IDs correctos
-- =============================================

-- Crearemos las opciones usando una variable para cada pregunta por orden en fase 2

-- P1
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=1);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Inquieto, buscas algo que hacer o a alguien con quien hablar; el silencio prolongado te incomoda.', 'S'),
(@pid, 2, 'Tranquilo pero activo mentalmente; aprovechas para planear o resolver algo pendiente.', 'C'),
(@pid, 3, 'Reflexivo, te da por pensar en cosas profundas; a veces aparece una melancolía sin causa aparente.', 'M'),
(@pid, 4, 'En paz total; puedes quedarte horas sin hacer nada productivo y no te genera culpa.', 'F');

-- P2
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=2);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Entusiasmo o ganas de algo nuevo.', 'S'),
(@pid, 2, 'Una urgencia sutil por avanzar, por no quedarte estancado.', 'C'),
(@pid, 3, 'Una preocupación de fondo, como si siempre hubiera algo que resolver o que podría salir mal.', 'M'),
(@pid, 4, 'Satisfacción tranquila; si nada está mal, todo está bien.', 'F');

-- P3
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=3);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Lo sientes intensamente en el momento, pero se te pasa rápido. En 10 minutos ya estás en otra cosa.', 'S'),
(@pid, 2, 'Te toca, pero no te dejas llevar. Lo registras y sigues. No te gusta sentirte vulnerable.', 'C'),
(@pid, 3, 'Se te queda adentro. Puedes seguir pensando en eso horas o días después. Lo sientes profundo.', 'M'),
(@pid, 4, 'Te conmueve suave, como una ola que llega y se va. No te desestabiliza ni te persigue.', 'F');

-- P4
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=4);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Mucho. Puedo estar eufórico en la mañana y apagado en la tarde sin que haya pasado nada importante.', 'S'),
(@pid, 2, 'No tanto. Mi estado depende de si las cosas están avanzando o no. Si avanzan, estoy bien.', 'C'),
(@pid, 3, 'Cambio, pero más hacia abajo que hacia arriba. Me cuesta más salir de un bajón que entrar en uno.', 'M'),
(@pid, 4, 'Casi no cambio. Mi estado emocional es bastante parejo durante todo el día.', 'F');

-- P5
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=5);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Buscar a alguien que te escuche o te distraiga. No te gusta estar solo con el dolor.', 'S'),
(@pid, 2, 'Enojo. Antes de sentir tristeza, sientes rabia o indignación.', 'C'),
(@pid, 3, 'Retirarte hacia adentro. Te cierras y necesitas procesar solo antes de hablar.', 'M'),
(@pid, 4, 'Absorberlo en silencio. No explotas ni buscas a nadie; dejas que el tiempo lo diluya.', 'F');

-- P6
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=6);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Sé lo que siento, pero me cuesta quedarme con eso; prefiero moverme a otra emoción rápido.', 'S'),
(@pid, 2, 'Identifico lo que siento, pero no me interesa explorarlo. Prefiero actuar sobre ello.', 'C'),
(@pid, 3, 'Lo identifico con mucha claridad y profundidad. A veces demasiada — le doy muchas vueltas.', 'M'),
(@pid, 4, 'Me cuesta un poco. A veces no sé si estoy triste, cansado o simplemente tranquilo.', 'F');

-- P7
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=7);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Participar activamente; te enganchas con la energía del grupo y aportas ideas.', 'S'),
(@pid, 2, 'Tomar posición clara y defenderla; si alguien dice algo que consideras incorrecto, lo confrontas.', 'C'),
(@pid, 3, 'Escuchar, analizar internamente y hablar solo si tienes algo bien pensado que decir.', 'M'),
(@pid, 4, 'Observar. Puedes pasar toda la reunión en silencio y no te incomoda. Hablas si te preguntan.', 'F');

-- P8
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=8);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Lo siento en el momento pero se me olvida rápido. No me gusta cargar con eso.', 'S'),
(@pid, 2, 'Si me traicionaron o me faltaron al respeto, no se me olvida. Puedo perdonar, pero no olvido.', 'C'),
(@pid, 3, 'Lo cargo mucho tiempo. Le doy vueltas, analizo qué pasó, qué debí hacer diferente.', 'M'),
(@pid, 4, 'No me engancho fácil. Prefiero soltar y mantener la paz, aunque por dentro sí me afectó.', 'F');

-- P9
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=9);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Ansiedad inquieta. Empiezas a buscar alternativas, llamas a alguien, pones música, te mueves en el asiento.', 'S'),
(@pid, 2, 'Frustración caliente. Te enojas con el tráfico, con la ciudad, con el que no avanza. Buscas la ruta más agresiva para salir.', 'C'),
(@pid, 3, 'Preocupación pesada. Empiezas a imaginar las consecuencias, qué van a pensar, cómo te va a afectar.', 'M'),
(@pid, 4, 'Resignación. "Ya ni modo." Te quedas donde estás, respiras y esperas. No vale la pena alterarse.', 'F');

-- P10
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=10);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Aceptas con entusiasmo pensando que "ya saldrá", sin medir bien si realmente puedes.', 'S'),
(@pid, 2, 'Aceptas el reto. La presión te activa y te enfocas más. Si no puedes solo, delegas lo que estorbe.', 'C'),
(@pid, 3, 'Te angustias. Empiezas a calcular todo lo que podría salir mal y sientes que no va a quedar bien.', 'M'),
(@pid, 4, 'Te paralizas un momento. Necesitas tiempo para asimilar el cambio antes de empezar a moverte.', 'F');

-- P11
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=11);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'En el pecho o la garganta. Sensación de ahogo, taquicardia, necesidad de aire.', 'S'),
(@pid, 2, 'En la cabeza y los hombros. Dolor de cabeza, tensión en trapecios, mandíbula apretada.', 'C'),
(@pid, 3, 'En el estómago. Nudos, gastritis, pérdida de apetito, problemas digestivos.', 'M'),
(@pid, 4, 'En todo el cuerpo como pesadez. Te sientes lento, hinchado, con sueño, sin ganas de nada.', 'F');

-- P12
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=12);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Distraerte. Buscas algo que te saque de ahí: redes sociales, salir, hablar con alguien, comer algo.', 'S'),
(@pid, 2, 'Retomar el control a la fuerza. Si el problema es una persona, la confrontas. Si es una situación, actúas aunque no tengas toda la información.', 'C'),
(@pid, 3, 'Analizar obsesivamente. Necesitas entender por qué pasó, qué falló, encontrar la causa raíz antes de moverte.', 'M'),
(@pid, 4, 'Esperar. Confías en que las cosas se acomoden solas o que alguien más las resuelva. Mientras tanto, te repliegas.', 'F');

-- P13
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=13);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Duermo, pero despierto varias veces. Sueños agitados o muy vívidos. Me cuesta quedarme quieto.', 'S'),
(@pid, 2, 'Duermo poco pero funciono. Mi mente no se apaga fácil. Puedo pasar días con pocas horas y seguir rindiendo.', 'C'),
(@pid, 3, 'Me cuesta mucho dormir. Le doy vueltas a todo en la cama. Si me duermo, despierto temprano con la mente ya activa.', 'M'),
(@pid, 4, 'Duermo de más. El estrés me da sueño. Me refugio en dormir como forma de evadir.', 'F');

-- P14
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=14);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Te duele, pero buscas reconectar rápido. Haces un chiste, cambias de tema, buscas que se pase el momento incómodo.', 'S'),
(@pid, 2, 'Te defiendes. Sientes que es injusto y necesitas que la otra persona entienda tu punto.', 'C'),
(@pid, 3, 'Lo interiorizas. Empiezas a dudar de ti, a revisar si realmente lo hiciste mal, a sentir culpa.', 'M'),
(@pid, 4, 'Lo registras pero no reaccionas. Por fuera estás tranquilo, pero por dentro te quedaste pensando.', 'F');

-- P15
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=15);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Te activas con adrenalina. Reaccionas rápido pero un poco desordenado. Después de que pasa, te da el bajón.', 'S'),
(@pid, 2, 'Tomas el mando inmediatamente. Ordenas, diriges, decides. Es donde mejor funcionas.', 'C'),
(@pid, 3, 'Te congelas un momento. Necesitas unos segundos para procesar antes de poder actuar. Una vez que arrancas, eres metódico.', 'M'),
(@pid, 4, 'Te quedas firme pero sin tomar la iniciativa. Haces lo que te digan, aguantas lo que sea, pero no lideras la respuesta.', 'F');

-- P16
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=16);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Proporcional, ni muy flaco ni muy robusto. Subo de peso fácil si me descuido, pero también lo bajo sin tanto esfuerzo.', 'S'),
(@pid, 2, 'Tendencia atlética o angular. Me marco con poco esfuerzo. Mi cuerpo responde rápido al ejercicio.', 'C'),
(@pid, 3, 'Delgado o ectomorfo. Me cuesta subir de peso y de masa muscular. Se me notan los huesos.', 'M'),
(@pid, 4, 'Robusto o con tendencia a retener. Subo de peso fácil y me cuesta mucho bajarlo. Mi cuerpo es amplio, suave.', 'F');

-- P17
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=17);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Variable. A veces tengo calor, a veces frío. Depende del día. Mis manos y pies cambian de temperatura.', 'S'),
(@pid, 2, 'Caluroso casi siempre. Sudo con facilidad. Prefiero el frío al calor. Me desespera el bochorno.', 'C'),
(@pid, 3, 'Friolento. Mis manos y pies tienden a estar fríos. Necesito cobijas, suéteres, capas. El frío me cala.', 'M'),
(@pid, 4, 'Fresco y estable. No me afecta mucho ni el calor ni el frío. Mi cuerpo mantiene una temperatura pareja.', 'F');

-- P18
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=18);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Mixta. A veces seca, a veces grasa. Cambia con el clima y la temporada. Tono cálido o rosado.', 'S'),
(@pid, 2, 'Grasa o con tendencia al acné, enrojecimiento o irritación. Tono rojizo o cobrizo. Se marca fácil al sol.', 'C'),
(@pid, 3, 'Seca, a veces áspera o con tendencia a grietas. Tono pálido, oliváceo o apagado.', 'M'),
(@pid, 4, 'Suave, gruesa, bien hidratada naturalmente. Tono claro o pálido. Textura lisa.', 'F');

-- P19
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=19);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Irregular. A veces rápida, a veces lenta. Depende de mi estado emocional. Puedo comer mucho un día y nada al siguiente.', 'S'),
(@pid, 2, 'Rápida y fuerte. Tengo buen apetito, digiero rápido, y si no como a tiempo me pongo de muy mal humor.', 'C'),
(@pid, 3, 'Irregular y sensible. Gases, inflamación, estreñimiento o periodos donde el estómago se cierra. Sensible a ciertos alimentos.', 'M'),
(@pid, 4, 'Lenta pero estable. Digiero despacio. Rara vez tengo problemas agudos, pero tiendo a sentirme pesado después de comer.', 'F');

-- P20
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=20);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Proporcionales, ni muy angulares ni muy suaves. Facciones equilibradas, expresivas, gesticulación amplia.', 'S'),
(@pid, 2, 'Angulares o marcados. Mandíbula definida, pómulos marcados, cejas fuertes o prominentes. Mirada intensa.', 'C'),
(@pid, 3, 'Finos o alargados. Rasgos delicados o afilados, dedos largos, estructura estrecha.', 'M'),
(@pid, 4, 'Redondeados o amplios. Facciones suaves, mentón suave, rasgos que no son angulares ni afilados.', 'F');

-- P21
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=21);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Me gusta lo variado. Me aburro haciendo lo mismo. Prefiero deportes en grupo o actividades que combinen socialización con movimiento.', 'S'),
(@pid, 2, 'Me gusta lo intenso y competitivo. Necesito sentir que me exigí. Si no sudo y no me duele, no cuenta.', 'C'),
(@pid, 3, 'Prefiero lo controlado y preciso. Yoga, caminata, artes marciales de técnica. Me incomoda lo explosivo o caótico.', 'M'),
(@pid, 4, 'Me cuesta empezar, pero una vez que agarro ritmo soy constante. Prefiero lo suave y repetitivo: caminar, nadar, bicicleta sin prisa.', 'F');

-- P22
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=22);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Arranco de inmediato con entusiasmo, pero muchas veces no termino. Me emociono con el inicio, no con el proceso.', 'S'),
(@pid, 2, 'Evalúo rápido si es viable y si lo es, ejecuto sin pedir opinión. Si no funciona, ajusto sobre la marcha.', 'C'),
(@pid, 3, 'La analizo a fondo antes de moverme. Necesito tener claro el plan, los riesgos, los pasos. Si hay algo que no cuadra, no arranco.', 'M'),
(@pid, 4, 'Me gusta la idea pero me cuesta dar el primer paso. Necesito un empujón externo o una fecha límite para arrancar.', 'F');

-- P23
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=23);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Hago varias cosas al mismo tiempo, salto de una a otra. Avanzo en muchas pero termino pocas. Necesito variedad.', 'S'),
(@pid, 2, 'Priorizo lo urgente y lo ataco. Si algo no es importante, lo descarto sin culpa. Odio la acumulación.', 'C'),
(@pid, 3, 'Hago listas, ordeno, planeo. Pero a veces la lista misma me paraliza porque veo todo lo que falta.', 'M'),
(@pid, 4, 'Los dejo acumular hasta que ya no puedo más. Entonces hago una sesión larga y resuelvo todo de golpe, o pido ayuda.', 'F');

-- P24
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=24);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Me cuesta. Tiendo a decir que sí para no quedar mal o no generar conflicto, y luego me arrepiento.', 'S'),
(@pid, 2, 'No me cuesta. Si no quiero, digo que no y no me siento culpable. Mi tiempo es mío.', 'C'),
(@pid, 3, 'Me cuesta mucho. Digo que sí aunque no quiera, y después me quedo rumiando el enojo conmigo mismo.', 'M'),
(@pid, 4, 'Digo que sí para evitar problemas, pero después simplemente no lo hago. Pospongo hasta que se olviden.', 'F');

-- P25
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=25);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Le pregunto a varias personas, escucho opiniones, y al final decido con el instinto del momento.', 'S'),
(@pid, 2, 'Elijo la opción que me dé más control del resultado, aunque implique riesgo. Prefiero equivocarme actuando que quedarme parado.', 'C'),
(@pid, 3, 'Busco más información. Investigo, comparo, analizo hasta que sienta que tengo la respuesta "correcta". A veces tardo demasiado.', 'M'),
(@pid, 4, 'Espero. Si la decisión se puede posponer, la pospongo. Confío en que con el tiempo se aclare qué es lo mejor.', 'F');

-- P26
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=26);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Me adapto. Si el jefe es buena onda, todo bien. Si es pesado, busco la vuelta para no chocar.', 'S'),
(@pid, 2, 'Las respeto si las considero competentes. Si alguien con autoridad es incompetente, me cuesta mucho no desafiarlo.', 'C'),
(@pid, 3, 'Las acato aunque no esté de acuerdo. Internamente puedo estar en desacuerdo total, pero rara vez lo digo abiertamente.', 'M'),
(@pid, 4, 'Las sigo sin problema. No me causa conflicto seguir instrucciones, mientras no me pidan cosas que alteren mi ritmo.', 'F');

-- P27
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=27);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Lo acepto rápido, pido disculpas, y quiero pasar a otra cosa. No me gusta quedarme en el error.', 'S'),
(@pid, 2, 'Busco la solución antes de disculparme. Me frustra haber fallado, pero lo que me importa es arreglar, no lamentar.', 'C'),
(@pid, 3, 'Me golpeo internamente. Repaso el error una y otra vez, analizo qué debí hacer diferente. Me cuesta soltar la autoexigencia.', 'M'),
(@pid, 4, 'No reacciono mucho por fuera. Internamente me afecta, pero no hago drama. Espero que las cosas se recompongan solas.', 'F');

-- P28
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=28);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Quedarme completamente solo, sin nadie que me busque o me incluya. La irrelevancia social.', 'S'),
(@pid, 2, 'Que alguien más tenga el control de mi vida o mis decisiones. Depender completamente de otro.', 'C'),
(@pid, 3, 'Que el caos gane y no haya forma de predecir ni controlar lo que viene. El desorden absoluto.', 'M'),
(@pid, 4, 'Que me obliguen a cambiar todo de golpe: trabajo, casa, rutina, relaciones. Empezar de cero sin estabilidad.', 'F');

-- P29
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=29);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'Sentir que un grupo de personas me excluyó o habló mal de mí sin que yo pudiera defenderme.', 'S'),
(@pid, 2, 'Que alguien me haya engañado, manipulado o pasado por encima sin que yo lo detectara a tiempo.', 'C'),
(@pid, 3, 'Haber cometido un error que no puedo deshacer y cuyas consecuencias todavía no conozco por completo.', 'M'),
(@pid, 4, 'Que me hayan puesto en una posición donde tengo que confrontar a alguien y no puedo evitarlo.', 'F');

-- P30
SET @pid = (SELECT idPregunta FROM biotipo_preguntas WHERE idFase=2 AND orden=30);
INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, biotipoCode) VALUES
(@pid, 1, 'La necesidad de aprobación externa. Dejar de importarte lo que piensen los demás.', 'S'),
(@pid, 2, 'La impaciencia y la frustración cuando las cosas no van a tu ritmo.', 'C'),
(@pid, 3, 'La tendencia a pensar de más y anticipar problemas que todavía no existen.', 'M'),
(@pid, 4, 'La inercia que te frena para actuar aunque sabes exactamente qué tienes que hacer.', 'F');

-- =============================================
-- FASES 3-6: CONFIRMACIÓN POR BIOTIPO (escala 0-3)
-- Cada una tiene 30 preguntas tipo afirmación
-- Las opciones son siempre la misma escala
-- =============================================

-- CONFIRMACIÓN SANGUÍNEO (Fase 3, idFase=3)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
-- Emocionalidad sanguínea (1-8)
(3, 'E', 'Emocionalidad sanguínea', 1, 'Cuando llego a un lugar donde no conozco a nadie, me resulta natural iniciar conversación con desconocidos sin sentirme incómodo.'),
(3, 'E', 'Emocionalidad sanguínea', 2, 'Mi entusiasmo por cosas nuevas es intenso pero corto. Me emociono mucho al principio y pierdo interés cuando la novedad se acaba.'),
(3, 'E', 'Emocionalidad sanguínea', 3, 'Me cuesta estar solo mucho tiempo seguido. Después de unas horas sin interacción, empiezo a sentir inquietud o vacío.'),
(3, 'E', 'Emocionalidad sanguínea', 4, 'Tiendo a minimizar los problemas. Mi primera reacción ante algo difícil es pensar "no es para tanto" y buscar el lado positivo.'),
(3, 'E', 'Emocionalidad sanguínea', 5, 'Me han dicho más de una vez que soy "de emociones intensas pero pasajeras". Puedo llorar en una película y estar riendo cinco minutos después.'),
(3, 'E', 'Emocionalidad sanguínea', 6, 'Me aburro con facilidad. Si una actividad, trabajo o incluso una relación se vuelve rutinaria, empiezo a buscar algo que me estimule.'),
(3, 'E', 'Emocionalidad sanguínea', 7, 'Mi forma natural de procesar emociones difíciles es hablar. Necesito contarle a alguien lo que me pasa para poder ordenar lo que siento.'),
(3, 'E', 'Emocionalidad sanguínea', 8, 'Soy más sensible al rechazo social de lo que muestro. Que me excluyan o ignoren me duele más que un insulto directo.'),
-- Estrés sanguíneo (9-14)
(3, 'S', 'Estrés sanguíneo', 9, 'Cuando estoy bajo presión, mi primer impulso es buscar una distracción: comer algo, ver algo, salir, hablar con alguien.'),
(3, 'S', 'Estrés sanguíneo', 10, 'En periodos de estrés, mi cuerpo lo manifiesta en el pecho: taquicardia, sensación de ahogo, suspiros profundos.'),
(3, 'S', 'Estrés sanguíneo', 11, 'Puedo comprometerme con muchas cosas a la vez porque en el momento me siento capaz, pero después me sobrepaso.'),
(3, 'S', 'Estrés sanguíneo', 12, 'Cuando un problema se pone serio, mi tendencia es cambiar de tema, hacer un chiste o desviar la conversación.'),
(3, 'S', 'Estrés sanguíneo', 13, 'Si algo me preocupa pero no puedo resolverlo ahora, mi mente lo suelta relativamente rápido. No soy de los que le dan vueltas toda la noche.'),
(3, 'S', 'Estrés sanguíneo', 14, 'Después de un evento social largo, me siento cargado de energía, no drenado. El bajón me llega después, cuando estoy solo.'),
-- Morfología sanguínea (15-20)
(3, 'M', 'Morfología sanguínea', 15, 'Mi complexión corporal es proporcional. No soy muy delgado ni muy robusto. Subo de peso si me descuido, pero lo bajo con relativa facilidad.'),
(3, 'M', 'Morfología sanguínea', 16, 'Mi temperatura corporal es variable. A veces tengo calor, a veces frío, sin que cambie mucho el clima.'),
(3, 'M', 'Morfología sanguínea', 17, 'Mi piel es mixta: ni completamente grasa ni completamente seca. Cambia con las estaciones o con mi estado emocional.'),
(3, 'M', 'Morfología sanguínea', 18, 'Tengo buena circulación en general. Mi tono de piel tiende a ser cálido, rosado, con color.'),
(3, 'M', 'Morfología sanguínea', 19, 'Mi apetito es irregular. Hay días que como mucho y días que casi no tengo hambre. Mi relación con la comida depende de mi ánimo.'),
(3, 'M', 'Morfología sanguínea', 20, 'Mi energía tiene picos y valles marcados durante el día. Puedo estar muy activo unas horas y luego caer en un bajón sin explicación.'),
-- Acción sanguínea (21-26)
(3, 'A', 'Acción y decisión sanguínea', 21, 'Soy bueno para arrancar proyectos pero malo para terminarlos. Mi historial está lleno de cosas empezadas con entusiasmo y abandonadas a la mitad.'),
(3, 'A', 'Acción y decisión sanguínea', 22, 'Cuando tengo que decidir algo, busco opiniones de varias personas. Me influye bastante lo que me dicen los demás.'),
(3, 'A', 'Acción y decisión sanguínea', 23, 'Multitarea es mi modo natural. Puedo tener muchas ventanas abiertas al mismo tiempo, literalmente y mentalmente.'),
(3, 'A', 'Acción y decisión sanguínea', 24, 'Me cuesta quedarme con una sola cosa mucho tiempo. Necesito variedad: en el trabajo, en la comida, en las actividades.'),
(3, 'A', 'Acción y decisión sanguínea', 25, 'Digo que sí a cosas con facilidad y después me arrepiento. Mi agenda siempre está más llena de lo que debería.'),
(3, 'A', 'Acción y decisión sanguínea', 26, 'Cuando algo sale mal, mi impulso es pasar página rápido. Pido disculpas, lo acomodo como puedo, y quiero que ya no se hable del tema.'),
-- Miedos sanguíneos (27-30)
(3, 'V', 'Miedos y vulnerabilidades sanguíneas', 27, 'La idea de ser irrelevante — que nadie me busque, que no le importe a nadie — me genera una angustia profunda.'),
(3, 'V', 'Miedos y vulnerabilidades sanguíneas', 28, 'Me cuesta estar en silencio con otra persona sin que se sienta incómodo. Siento la necesidad de llenar el espacio con palabras.'),
(3, 'V', 'Miedos y vulnerabilidades sanguíneas', 29, 'A veces siento que la gente me quiere pero no me conoce de verdad, porque siempre muestro la versión ligera de mí.'),
(3, 'V', 'Miedos y vulnerabilidades sanguíneas', 30, 'Mi mayor miedo no dicho es que si dejo de ser divertido, agradable o interesante, la gente se vaya.');

-- CONFIRMACIÓN COLÉRICO (Fase 4, idFase=4)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(4, 'E', 'Emocionalidad colérica', 1, 'Mi emoción predeterminada ante cualquier obstáculo es enojo. Antes de sentir tristeza, frustración o miedo, siento rabia.'),
(4, 'E', 'Emocionalidad colérica', 2, 'Me irrita profundamente la incompetencia ajena. Si alguien no hace las cosas bien, me cuesta disimular mi molestia.'),
(4, 'E', 'Emocionalidad colérica', 3, 'Prefiero tener el control de las situaciones. Cuando alguien más decide por mí sin consultarme, me genera una incomodidad que no puedo ignorar.'),
(4, 'E', 'Emocionalidad colérica', 4, 'No me gusta mostrar vulnerabilidad. Si estoy pasándola mal, muy pocas personas lo saben.'),
(4, 'E', 'Emocionalidad colérica', 5, 'Siento impaciencia como estado constante de fondo. Esperar me incomoda. Las filas, los procesos lentos, la gente que tarda en decidir.'),
(4, 'E', 'Emocionalidad colérica', 6, 'Cuando alguien me traiciona o me falta al respeto, no se me olvida. Esa persona queda marcada para siempre en mi mapa interno.'),
(4, 'E', 'Emocionalidad colérica', 7, 'Me resulta más fácil dar órdenes que pedir ayuda. Pedir ayuda me pone en una posición que no me gusta.'),
(4, 'E', 'Emocionalidad colérica', 8, 'Admiro la fortaleza y desprecio la debilidad. No lo digo abiertamente, pero por dentro siento que cada quien debería poder con lo suyo.'),
(4, 'S', 'Estrés colérico', 9, 'Bajo presión, me vuelvo más eficiente, no menos. La presión me activa como si mi motor funcionara mejor con gasolina de alto octanaje.'),
(4, 'S', 'Estrés colérico', 10, 'Cuando el estrés sube, lo siento en la cabeza y los hombros. Dolor de cabeza, tensión en trapecios, mandíbula apretada.'),
(4, 'S', 'Estrés colérico', 11, 'Puedo funcionar con pocas horas de sueño durante varios días seguidos sin perder rendimiento significativo.'),
(4, 'S', 'Estrés colérico', 12, 'Si una situación se sale de control, mi primer impulso es retomar el control a la fuerza — confrontar, decidir, actuar.'),
(4, 'S', 'Estrés colérico', 13, 'Cuando estoy muy estresado, mi irritabilidad aumenta. Me vuelvo más cortante, más directo, menos tolerante.'),
(4, 'S', 'Estrés colérico', 14, 'En una crisis real, soy el que toma el mando. No lo pienso; sucede automáticamente.'),
(4, 'M', 'Morfología colérica', 15, 'Mi cuerpo tiende naturalmente a lo atlético o angular. Me marco con poco esfuerzo.'),
(4, 'M', 'Morfología colérica', 16, 'Soy caluroso. Sudo con facilidad, me incomoda el calor, y duermo mejor en ambientes frescos.'),
(4, 'M', 'Morfología colérica', 17, 'Mi piel tiende a ser grasa o mixta-grasa. Con tendencia al enrojecimiento o al acné.'),
(4, 'M', 'Morfología colérica', 18, 'Tengo rasgos faciales angulares: mandíbula marcada, pómulos definidos, cejas fuertes. Mi mirada es intensa.'),
(4, 'M', 'Morfología colérica', 19, 'Mi metabolismo es rápido y fuerte. Tengo buen apetito, digiero bien, y el hambre me desregula el carácter.'),
(4, 'M', 'Morfología colérica', 20, 'Me gusta el ejercicio intenso, competitivo, que me exija. Lo suave o lento me desespera.'),
(4, 'A', 'Acción y decisión colérica', 21, 'Decido rápido. Si la información disponible es suficiente para actuar, actúo. No me paralizo ante la incertidumbre.'),
(4, 'A', 'Acción y decisión colérica', 22, 'Prefiero equivocarme haciendo algo que quedarme parado analizando.'),
(4, 'A', 'Acción y decisión colérica', 23, 'Me cuesta delegar porque nadie lo hace al nivel que yo considero aceptable.'),
(4, 'A', 'Acción y decisión colérica', 24, 'Decir "no" no me cuesta. Mi tiempo y mi energía son recursos que administro conscientemente.'),
(4, 'A', 'Acción y decisión colérica', 25, 'Cuando tengo un objetivo claro, todo lo demás se subordina. Puedo ser monomaníaco cuando estoy enfocado.'),
(4, 'A', 'Acción y decisión colérica', 26, 'Si algo sale mal, mi primer impulso no es disculparme sino arreglar. La solución va antes que el sentimiento.'),
(4, 'V', 'Miedos y vulnerabilidades coléricas', 27, 'Mi miedo más profundo es la vulnerabilidad emocional. Que alguien me vea débil, roto, o sin respuesta.'),
(4, 'V', 'Miedos y vulnerabilidades coléricas', 28, 'La idea de depender completamente de alguien me genera una angustia que se siente como asfixia.'),
(4, 'V', 'Miedos y vulnerabilidades coléricas', 29, 'Tengo una dificultad genuina para pedir ayuda, incluso cuando la necesito. Lo vivo como rendirme.'),
(4, 'V', 'Miedos y vulnerabilidades coléricas', 30, 'A veces me doy cuenta de que la gente me tiene más respeto que cariño. Y aunque diga que no me importa, sí me pesa.');

-- CONFIRMACIÓN MELANCÓLICO (Fase 5, idFase=5)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(5, 'E', 'Emocionalidad melancólica', 1, 'Mi mente tiende a anticipar lo que puede salir mal. No es pesimismo — es que naturalmente veo los riesgos, los huecos, lo que otros no ven.'),
(5, 'E', 'Emocionalidad melancólica', 2, 'Soy profundamente sensible, pero lo muestro poco. Proceso las emociones hacia adentro, no hacia afuera.'),
(5, 'E', 'Emocionalidad melancólica', 3, 'Me acompaña una nostalgia de fondo que no siempre tiene un origen claro. A veces la melancolía aparece sin que nada la provoque.'),
(5, 'E', 'Emocionalidad melancólica', 4, 'Necesito entender las cosas antes de sentirme tranquilo con ellas. Lo ambiguo, lo indefinido me incomoda.'),
(5, 'E', 'Emocionalidad melancólica', 5, 'Soy muy observador. En un grupo, noto los gestos, los tonos, los cambios sutiles en el ánimo de la gente.'),
(5, 'E', 'Emocionalidad melancólica', 6, 'Tiendo a sentir culpa con facilidad. Si algo sale mal, mi primer movimiento interno es revisar qué hice yo.'),
(5, 'E', 'Emocionalidad melancólica', 7, 'Me cuesta soltar. Las experiencias dolorosas, los errores — se me quedan adentro y las reviso una y otra vez.'),
(5, 'E', 'Emocionalidad melancólica', 8, 'Valoro profundamente la lealtad y la coherencia. Si alguien que admiro resulta ser incongruente, me afecta más de lo que debería.'),
(5, 'S', 'Estrés melancólico', 9, 'Bajo estrés, mi mente se acelera en espiral: pienso en las consecuencias de las consecuencias.'),
(5, 'S', 'Estrés melancólico', 10, 'El estrés acumulado me pega en el estómago: gastritis, inflamación, pérdida de apetito, nudos.'),
(5, 'S', 'Estrés melancólico', 11, 'Me cuesta mucho dormir cuando tengo algo sin resolver. Mi mente no se apaga.'),
(5, 'S', 'Estrés melancólico', 12, 'Cuando siento que perdí el control, mi mecanismo es analizar: ¿por qué pasó? ¿qué no vi? Necesito la causa raíz.'),
(5, 'S', 'Estrés melancólico', 13, 'La crítica me afecta más de lo que muestro. Una sola observación negativa puede perseguirme días.'),
(5, 'S', 'Estrés melancólico', 14, 'En una crisis, necesito unos segundos para procesar antes de actuar. Mi mente está trabajando a toda velocidad.'),
(5, 'M', 'Morfología melancólica', 15, 'Mi cuerpo tiende a ser delgado o ectomorfo. Me cuesta subir de peso y de masa muscular.'),
(5, 'M', 'Morfología melancólica', 16, 'Soy friolento. Mis manos y pies suelen estar fríos. Necesito capas de ropa, cobijas extras.'),
(5, 'M', 'Morfología melancólica', 17, 'Mi piel tiende a ser seca, a veces áspera. Mi tono es pálido u oliváceo, rara vez rojizo.'),
(5, 'M', 'Morfología melancólica', 18, 'Tengo rasgos faciales finos o alargados. Dedos largos, muñecas delgadas, estructura ósea estrecha.'),
(5, 'M', 'Morfología melancólica', 19, 'Mi digestión es sensible e irregular. Hay alimentos que no tolero. Mi estómago reacciona a mis emociones.'),
(5, 'M', 'Morfología melancólica', 20, 'Para el ejercicio, prefiero lo controlado: yoga, caminata, técnica marcial. Lo explosivo me incomoda.'),
(5, 'A', 'Acción y decisión melancólica', 21, 'Antes de actuar, necesito tener claro el plan. Si hay variables que no entiendo, me cuesta moverme.'),
(5, 'A', 'Acción y decisión melancólica', 22, 'Tiendo al perfeccionismo. Si algo no va a quedar bien, prefiero no hacerlo.'),
(5, 'A', 'Acción y decisión melancólica', 23, 'Hago listas, planes y estructuras para todo. Me dan orden mental.'),
(5, 'A', 'Acción y decisión melancólica', 24, 'Me cuesta decir que no. Digo que sí aunque no quiera, y después me quedo enojado conmigo mismo.'),
(5, 'A', 'Acción y decisión melancólica', 25, 'Soy lento para tomar decisiones importantes porque necesito sentir que analicé todas las posibilidades.'),
(5, 'A', 'Acción y decisión melancólica', 26, 'Cuando algo sale mal por mi culpa, me golpeo internamente. Repaso el error, busco qué debí hacer diferente.'),
(5, 'V', 'Miedos y vulnerabilidades melancólicas', 27, 'Mi miedo más profundo es el desorden: que las cosas se descontrolen de forma impredecible.'),
(5, 'V', 'Miedos y vulnerabilidades melancólicas', 28, 'Tengo miedo a equivocarme de forma irreversible. El error que no tiene vuelta atrás.'),
(5, 'V', 'Miedos y vulnerabilidades melancólicas', 29, 'A veces siento que cargo con un peso que no puedo explicar. Una pesadez existencial que va y viene.'),
(5, 'V', 'Miedos y vulnerabilidades melancólicas', 30, 'Mi capacidad de análisis, que normalmente es mi fortaleza, a veces se convierte en mi prisión: no puedo dejar de pensar.');

-- CONFIRMACIÓN FLEMÁTICO (Fase 6, idFase=6)
INSERT INTO biotipo_preguntas (idFase, bloque, bloqueNombre, orden, textoPregunta) VALUES
(6, 'E', 'Emocionalidad flemática', 1, 'Mi estado emocional de base es la calma. No la calma que se busca — la que simplemente está ahí.'),
(6, 'E', 'Emocionalidad flemática', 2, 'Me cuesta identificar con precisión lo que siento. A veces no sé si estoy triste, cansado, aburrido o simplemente tranquilo.'),
(6, 'E', 'Emocionalidad flemática', 3, 'No soy de reacciones extremas. Mi rango emocional es estrecho. Me alegro moderado, me afecta moderado.'),
(6, 'E', 'Emocionalidad flemática', 4, 'La gente me percibe como estable, confiable, el que "nunca se altera". Por fuera es cierto; por dentro sí siento.'),
(6, 'E', 'Emocionalidad flemática', 5, 'Me cuesta conectar con la urgencia de otros. Mi reacción interna es "¿por qué se altera tanto?".'),
(6, 'E', 'Emocionalidad flemática', 6, 'Puedo estar en silencio mucho tiempo sin sentirme incómodo. El silencio no me pesa; me descansa.'),
(6, 'E', 'Emocionalidad flemática', 7, 'Soy leal de forma silenciosa. No demuestro el cariño con palabras o gestos grandilocuentes, pero estoy ahí, constante.'),
(6, 'E', 'Emocionalidad flemática', 8, 'Me toma tiempo procesar las emociones fuertes. Lo que para otros es un impacto inmediato, para mí llega con retraso.'),
(6, 'S', 'Estrés flemático', 9, 'Cuando estoy bajo estrés, mi cuerpo responde con pesadez: sueño excesivo, sensación de hinchazón, falta de energía.'),
(6, 'S', 'Estrés flemático', 10, 'Mi forma natural de evadir el estrés es dormir, comer o refugiarme en actividades pasivas.'),
(6, 'S', 'Estrés flemático', 11, 'Puedo absorber el estrés de otros sin que me desestabilice. Soy buen contenedor emocional.'),
(6, 'S', 'Estrés flemático', 12, 'En una crisis, no tomo la iniciativa pero tampoco me quiebro. Hago lo que me digan, aguanto lo que sea necesario.'),
(6, 'S', 'Estrés flemático', 13, 'Si algo me estresa pero no puedo resolverlo, mi mecanismo es esperar. Creo que con el tiempo las cosas se acomodan.'),
(6, 'S', 'Estrés flemático', 14, 'El estrés sostenido me produce congestión, retención de líquidos, pesadez en las piernas.'),
(6, 'M', 'Morfología flemática', 15, 'Mi cuerpo tiende naturalmente a ser robusto, amplio, con tendencia a retener peso.'),
(6, 'M', 'Morfología flemática', 16, 'Mi temperatura corporal es estable y fresca. No soy ni muy caluroso ni muy friolento. No sudo con facilidad.'),
(6, 'M', 'Morfología flemática', 17, 'Mi piel es suave, gruesa, bien hidratada de forma natural. Tono claro o pálido, textura lisa.'),
(6, 'M', 'Morfología flemática', 18, 'Mis rasgos faciales son suaves, redondeados. Mentón sin ángulo agresivo, complexión amplia.'),
(6, 'M', 'Morfología flemática', 19, 'Mi digestión es lenta pero estable. No tengo problemas agudos seguido, pero me siento pesado después de comer.'),
(6, 'M', 'Morfología flemática', 20, 'Me cuesta empezar a hacer ejercicio, pero una vez que agarro el ritmo soy muy constante. Prefiero lo suave y repetitivo.'),
(6, 'A', 'Acción y decisión flemática', 21, 'Me cuesta dar el primer paso. No es miedo ni análisis — es inercia. Necesito un empujón externo para arrancar.'),
(6, 'A', 'Acción y decisión flemática', 22, 'Pospongo las cosas con naturalidad. No me genera angustia tener pendientes acumulados — hasta que son demasiados.'),
(6, 'A', 'Acción y decisión flemática', 23, 'Digo que sí para evitar conflicto, pero después no lo hago. Fue más fácil aceptar que negarse en el momento.'),
(6, 'A', 'Acción y decisión flemática', 24, 'Ante una decisión importante, mi impulso es esperar. Confío en que con el tiempo se aclara qué es lo mejor.'),
(6, 'A', 'Acción y decisión flemática', 25, 'Soy constante una vez que arranco. Mi ritmo es lento y sostenido, como agua que erosiona piedra.'),
(6, 'A', 'Acción y decisión flemática', 26, 'Me adapto a las jerarquías sin conflicto. No me cuesta subordinarme mientras no alteren mi ritmo.'),
(6, 'V', 'Miedos y vulnerabilidades flemáticas', 27, 'Mi miedo más profundo es el cambio abrupto. Que me cambien todo de golpe me genera una angustia que pocas cosas igualan.'),
(6, 'V', 'Miedos y vulnerabilidades flemáticas', 28, 'La confrontación directa me drena como pocas cosas. Me cuesta un esfuerzo desproporcionado activar esa energía.'),
(6, 'V', 'Miedos y vulnerabilidades flemáticas', 29, 'A veces me doy cuenta de que dejé pasar oportunidades por no moverme a tiempo.'),
(6, 'V', 'Miedos y vulnerabilidades flemáticas', 30, 'Mi estabilidad, que para todos es mi fortaleza, a veces es mi trampa: me quedo donde estoy demasiado tiempo.');

-- =============================================
-- Opciones para fases de confirmación (escala 0-3)
-- Se generan automáticamente para cada pregunta de fases 3-6
-- =============================================

INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, valorEscala)
SELECT p.idPregunta, 1, 'Totalmente yo. Me identifico sin dudarlo.', 3
FROM biotipo_preguntas p WHERE p.idFase IN (3,4,5,6);

INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, valorEscala)
SELECT p.idPregunta, 2, 'Parcialmente. A veces sí, a veces no, pero la tendencia está ahí.', 2
FROM biotipo_preguntas p WHERE p.idFase IN (3,4,5,6);

INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, valorEscala)
SELECT p.idPregunta, 3, 'Poco. Rara vez me pasa.', 1
FROM biotipo_preguntas p WHERE p.idFase IN (3,4,5,6);

INSERT INTO biotipo_opciones (idPregunta, orden, textoOpcion, valorEscala)
SELECT p.idPregunta, 4, 'No me identifico. Eso no soy yo.', 0
FROM biotipo_preguntas p WHERE p.idFase IN (3,4,5,6);
