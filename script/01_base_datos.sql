

CREATE TABLE `cat_estados` (
  `idEstado` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `idPais` int(11) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cat_estados`
--


INSERT INTO `cat_estados` (`idEstado`, `nombre`, `idPais`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 'Jalisco', 1, '2023-11-10 12:23:54', '2023-11-10 12:23:54', ' [ INSERT 2023-11-10 12:23:54 ], [ idUser  ] ', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cat_municipios`
--

CREATE TABLE `cat_municipios` (
  `idMunicipio` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `idPais` int(11) NOT NULL,
  `idEstado` int(11) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cat_municipios`
--

INSERT INTO `cat_municipios` (`idMunicipio`, `nombre`, `idPais`, `idEstado`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 'Guadalajara', 1, 1, '2023-11-10 12:28:53', '2023-11-10 12:28:53', ' [ INSERT 2023-11-10 12:28:53 ], [ idUser  ] ', 1),
(2, 'Zapopan', 1, 1, '2023-11-10 01:02:15', '2023-11-10 01:02:15', ' [ INSERT 2023-11-10 01:02:15 ], [ idUser  ] ', 1),
(3, 'Tlaquepaque', 1, 1, '2023-11-10 01:03:19', '2023-11-10 01:03:19', ' [ INSERT 2023-11-10 01:03:19 ], [ idUser  ] ', 1),
(4, 'Tonala', 1, 1, '2023-11-10 01:03:09', '2023-11-10 01:03:09', ' [ INSERT 2023-11-10 01:03:09 ], [ idUser  ] ', 1),
(5, 'El Salto', 1, 1, '2023-11-10 01:08:06', '2023-11-10 01:08:06', ' [ INSERT 2023-11-10 01:08:06 ], [ idUser  ] ', 1),
(6, 'Tlajomulco de Zuñiga', 1, 1, '2023-11-10 01:08:30', '2023-11-10 01:08:30', ' [ INSERT 2023-11-10 01:08:30 ], [ idUser  ] ', 1),
(7, 'Puerto Vallarta', 1, 1, '2023-11-10 01:02:57', '2023-11-10 01:02:57', ' [ INSERT 2023-11-10 01:02:57 ], [ idUser  ] ', 1),
(8, 'Lagos de Moreno', 1, 1, '2023-11-10 01:05:09', '2023-11-10 01:05:09', ' [ INSERT 2023-11-10 01:05:09 ], [ idUser  ] ', 1),
(9, 'Tepatitlan de Morelos', 1, 1, '2023-11-10 01:04:54', '2023-11-10 01:04:54', ' [ INSERT 2023-11-10 01:04:54 ], [ idUser  ] ', 1),
(10, 'Chapala', 1, 1, '2023-11-10 01:11:31', '2023-11-10 01:11:31', ' [ INSERT 2023-11-10 01:11:31 ], [ idUser  ] ', 1);


CREATE TABLE `cat_paises` (
  `idPais` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `cat_paises` (`idPais`, `nombre`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 'Mexico', '2023-11-10 11:58:17', '2023-11-10 11:59:51', ' [ INSERT 2023-11-10 11:59:51 ], [ idUser  ] ', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cat_planes`
--

CREATE TABLE `cat_planes` (
  `idPlan` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `vigencia` int(11) NOT NULL,
  `unidad` varchar(10) NOT NULL,
  `costo` decimal(18,2) NOT NULL,
  `vinculaciones` int(11) NOT NULL DEFAULT 1,
  `agentes` int(11) NOT NULL DEFAULT 1,
  `area` int(11) NOT NULL DEFAULT 0,
  `bot` int(11) NOT NULL DEFAULT 1,
  `menu` int(11) NOT NULL DEFAULT 10,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `cat_planes` (`idPlan`, `nombre`, `descripcion`, `vigencia`, `unidad`, `costo`, `vinculaciones`, `agentes`, `area`, `bot`, `menu`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 'Básico', 'Plan básico con funciones esenciales', 1, 'MES', 99.00, 1, 2, 0, 1, 5, '2025-01-01 00:00:00', '2025-01-01 00:00:00', ' [ INSERT ] ', 1),
(2, 'Pro', 'Plan profesional con más capacidad', 1, 'MES', 199.00, 3, 5, 1, 1, 10, '2025-01-01 00:00:00', '2025-01-01 00:00:00', ' [ INSERT ] ', 1),
(3, 'Premium', 'Plan premium con todas las funciones', 1, 'MES', 299.00, 5, 10, 1, 1, 20, '2025-01-01 00:00:00', '2025-01-01 00:00:00', ' [ INSERT ] ', 1);


CREATE TABLE `codigo` (
  `idCodigo` int(11) NOT NULL,
  `idMembresia` int(11) NOT NULL,
  `idPlan` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `concepto` varchar(200) NOT NULL,
  `referencia` varchar(25) NOT NULL,
  `costo` decimal(18,2) NOT NULL,
  `fechaVencimiento` datetime NOT NULL,
  `estatus` varchar(10) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `codigo`
--

INSERT INTO `codigo` (`idCodigo`, `idMembresia`, `idPlan`, `fecha`, `concepto`, `referencia`, `costo`, `fechaVencimiento`, `estatus`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 6, 1, '2024-05-03 06:18:59', 'Plus', '0305202406185721', 100.00, '2024-05-03 06:18:58', 'ACTIVO', '2024-05-03 06:18:59', '2024-05-03 06:18:59', ' [ INSERT 2024-05-03 06:18:59 ], [ idUser 1194 IP:  ] ', 1),
(2, 11, 1, '2024-05-06 06:48:25', 'Plus', '0605202406482360', 100.00, '2024-05-06 06:48:25', 'CANCELADA', '2024-05-06 06:48:25', '2024-05-06 12:58:18', ' [ DELETE 2024-05-06 12:58:18 ], [ idUser  ] ', 1),
(3, 11, 1, '2024-05-06 06:58:29', 'Plus', '0605202406582701', 100.00, '2024-05-06 06:58:29', 'CANCELADA', '2024-05-06 06:58:29', '2024-05-06 13:00:00', ' [ DELETE 2024-05-06 13:00:00 ], [ idUser  ] ', 1),
(4, 11, 1, '2024-05-06 07:00:47', 'Plus', '0605202407004670', 100.00, '2024-05-06 07:00:47', 'CANCELADA', '2024-05-06 07:00:47', '2024-05-06 13:12:12', ' [ DELETE 2024-05-06 13:12:12 ], [ idUser  ] ', 1),
(5, 11, 1, '2024-05-06 07:12:21', 'Plus', '0605202407122081', 100.00, '2024-05-06 07:12:21', 'CANCELADA', '2024-05-06 07:12:21', '2024-05-06 18:12:52', ' [ DELETE 2024-05-06 18:12:52 ], [ idUser  ] ', 1),
(6, 24, 1, '2024-06-06 09:19:16', 'Plus', '0606202409191691', 100.00, '2024-06-06 09:19:16', 'ACTIVO', '2024-06-06 09:19:16', '2024-06-06 09:19:16', ' [ INSERT 2024-06-06 09:19:16 ], [ idUser 1225 IP:  ] ', 1),
(7, 12, 1, '2024-07-29 05:13:46', 'Plus', '2907202405134669', 100.00, '2024-07-29 05:13:46', 'ACTIVO', '2024-07-29 05:13:46', '2024-07-29 05:13:46', ' [ INSERT 2024-07-29 05:13:46 ], [ idUser 1218 IP:  ] ', 1);


CREATE TABLE `datosgenerales` (
  `idDgenerales` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `calle` varchar(200) NOT NULL,
  `noExterior` varchar(20) NOT NULL,
  `noInterior` varchar(20) NOT NULL,
  `codigoPostal` varchar(10) NOT NULL,
  `colonia` varchar(200) NOT NULL,
  `idMunicipio` int(11) NOT NULL,
  `idEstado` int(11) NOT NULL,
  `idPais` int(11) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `datosgenerales`
--

INSERT INTO `datosgenerales` (`idDgenerales`, `idUsuario`, `calle`, `noExterior`, `noInterior`, `codigoPostal`, `colonia`, `idMunicipio`, `idEstado`, `idPais`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 1218, 'asads', '234', '', '234', '234', 50, 19, 19, '2024-07-29 09:50:10', '2024-07-29 09:50:16', ' [ UPFATE 2024-07-29 09:50:16 ], [ idUser 46 IP:  172.27.0.1] ', 1),
(2, 1227, 'Medrano', '12', '12', '2222', 'Medrano', 1, 2, 1, '2024-07-29 11:35:40', '2024-07-29 11:35:40', ' [ INSERT  Fecha: 2024-07-29 11:35:40 ], [ idUser 1227 IP:  ] ', 1),
(3, 1227, 'asd', '324', '234', '234', '342', 51, 19, 19, '2024-07-29 11:40:48', '2024-07-29 11:40:48', ' [ INSERT  Fecha: 2024-07-29 11:40:48 ], [ idUser 1227 IP:  ] ', 1),
(4, 1227, '23434', '234234', '2344', '34232', '342', 52, 19, 20, '2024-07-29 11:42:41', '2024-07-29 11:42:41', ' [ INSERT  Fecha: 2024-07-29 11:42:41 ], [ idUser 1227 IP:  ] ', 1),
(5, 1227, 'as4534', '453453', '4533', '54', '453', 51, 19, 19, '2024-07-29 11:43:16', '2024-07-29 11:43:16', ' [ INSERT  Fecha: 2024-07-29 11:43:16 ], [ idUser 1227 IP:  ] ', 1),
(6, 1228, '8 de julio', '12', '', '2333', 'Medrano', 50, 10, 17, '2024-08-08 10:09:19', '2024-08-08 10:10:25', ' [ UPFATE 2024-08-08 10:10:25 ], [ idUser 1228 IP:  2806:2f0:53e1:8f2b:ad93:9504:b1a4:9f9c] ', 1),
(7, 1229, 'Avenida Prolongación Tepeyac', '910', '', '45069', 'Paraisos del Colli', 2, 2, 1, '2024-08-13 12:25:06', '2024-08-13 12:25:06', ' [ INSERT  Fecha: 2024-08-13 12:25:06 ], [ idUser 1229 IP:  ] ', 1),
(8, 1230, '8 de julio', '12', '', '22222', '8 de julio', 51, 19, 19, '2024-08-28 01:23:35', '2024-08-28 01:23:35', ' [ INSERT  Fecha: 2024-08-28 01:23:35 ], [ idUser 1230 IP:  ] ', 1),
(9, 1231, 'Medrano', '788', '', '44400', 'Paraisos del Colli', 50, 2, 1, '2024-09-12 10:33:43', '2024-09-12 10:33:43', ' [ INSERT  Fecha: 2024-09-12 10:33:43 ], [ idUser 1231 IP:  ] ', 1),
(10, 1232, 'Avenida Prolongación Tepeyac', '910', '', '45069', 'Paraisos del Colli', 2, 2, 1, '2024-11-27 12:44:35', '2024-11-27 12:44:35', ' [ INSERT  Fecha: 2024-11-27 12:44:35 ], [ idUser 1232 IP:  ] ', 1),
(11, 1233, 'Avenida Prolongación Tepeyac', '910', '', '45069', 'Paraisos del Colli', 2, 2, 1, '2024-11-27 01:34:01', '2024-11-27 01:34:01', ' [ INSERT  Fecha: 2024-11-27 01:34:01 ], [ idUser 1233 IP:  ] ', 1),
(12, 1235, 'Medrano', '788', '', '44400', 'Paraisos del Colli', 51, 2, 1, '2024-12-04 06:38:25', '2024-12-04 06:46:15', ' [ UPFATE 2024-12-04 06:46:15 ], [ idUser 1235 IP:  10.1.17.132] ', 1),
(13, 1234, 'Avenida Prolongación Tepeyac', '910', '', '45069', 'Paraisos del Colli', 51, 2, 1, '2024-12-27 01:05:11', '2024-12-27 01:05:11', ' [ INSERT  Fecha: 2024-12-27 01:05:11 ], [ idUser 46 IP:  ] ', 1),
(14, 1253, 'Medrano', '788', '', '44400', 'Paraisos del Colli', 51, 2, 1, '2025-01-08 11:17:08', '2025-01-08 11:17:08', ' [ INSERT  Fecha: 2025-01-08 11:17:08 ], [ idUser 1253 IP:  ] ', 1),
(15, 1256, '8 de julio', '56', '', '34567', '8 de julio', 43, 3, 1, '2025-02-24 08:30:27', '2025-02-24 08:30:27', ' [ INSERT  Fecha: 2025-02-24 08:30:27 ], [ idUser 1256 IP:  ] ', 1),
(16, 1257, 'Medrano', '788', '', '44400', 'Paraisos del Colli', 51, 2, 1, '2025-03-10 11:36:58', '2025-03-10 11:36:58', ' [ INSERT  Fecha: 2025-03-10 11:36:58 ], [ idUser 1257 IP:  ] ', 1),
(17, 1259, 'Paraiso del colli', '12', '', '34345', 'Paraiso del colli', 50, 19, 6, '2025-03-25 05:06:56', '2025-03-25 05:06:56', ' [ INSERT  Fecha: 2025-03-25 05:06:56 ], [ idUser 1259 IP:  ] ', 1),
(18, 1260, '8 de Julio ', '788', '', '44444', 'Paraiso del Colli', 1, 2, 1, '2025-03-25 05:47:27', '2025-03-25 05:47:27', ' [ INSERT  Fecha: 2025-03-25 05:47:27 ], [ idUser 1260 IP:  ] ', 1),
(19, 1262, '4 Rios', '67', '10', '45200', 'JARDINES DE LAS FUENTES', 2, 2, 1, '2025-04-01 02:17:59', '2025-04-01 02:17:59', ' [ INSERT  Fecha: 2025-04-01 02:17:59 ], [ idUser 1262 IP:  ] ', 1),
(20, 1263, 'Del Viento Poniente', '455', '', '45200', 'Tesistán', 2, 2, 1, '2025-04-01 02:24:26', '2025-04-01 02:24:26', ' [ INSERT  Fecha: 2025-04-01 02:24:26 ], [ idUser 1263 IP:  ] ', 1),
(21, 1261, 'CALLE X ', 'X', 'X1', '45116', 'X2', 2, 2, 1, '2025-04-01 02:41:17', '2025-04-01 02:41:17', ' [ INSERT  Fecha: 2025-04-01 02:41:17 ], [ idUser 1261 IP:  ] ', 1),
(22, 1264, 'Av. Patria ', '391', '', '45110', 'Jardines de la Patria', 2, 2, 1, '2025-04-01 02:41:26', '2025-04-01 02:41:26', ' [ INSERT  Fecha: 2025-04-01 02:41:26 ], [ idUser 1264 IP:  ] ', 1),
(23, 1265, 'Av Patria ', '391', '', '45110', 'Jardines de La Patria ', 2, 2, 1, '2025-04-08 03:58:40', '2025-04-08 03:58:40', ' [ INSERT  Fecha: 2025-04-08 03:58:40 ], [ idUser 1265 IP:  ] ', 1),
(24, 1268, '8 de Julio', '23', '', '34324234', 'Colli', 52, 11, 19, '2025-04-24 06:15:09', '2025-04-25 12:01:12', ' [ UPFATE 2025-04-25 12:01:12 ], [ idUser 1268 IP:  200.68.167.33] ', 1),
(25, 1276, 'Avenida Prolongación Tepeyac', '910', '', '234234', 'Paraisos del Colli', 52, 2, 1, '2025-12-05 09:12:35', '2025-12-05 09:12:35', ' [ INSERT  Fecha: 2025-12-05 09:12:35 ], [ idUser 1276 IP:  ] ', 1);


CREATE TABLE `facturacion` (
  `idFacturacion` int(11) NOT NULL,
  `idMembresia` int(11) NOT NULL,
  `folio` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `concepto` varchar(200) NOT NULL,
  `vigencia` int(11) NOT NULL,
  `unidad` varchar(25) NOT NULL,
  `costo` decimal(18,2) NOT NULL,
  `estatus` varchar(30) NOT NULL,
  `fechaCorte` datetime NOT NULL,
  `fechaPago` datetime NOT NULL,
  `formaPago` varchar(30) NOT NULL,
  `numeroTarjetas` varchar(25) NOT NULL,
  `confirmacion` text NOT NULL,
  `idCancelacion` int(11) NOT NULL,
  `fechaCancelacion` datetime NOT NULL,
  `motivo` text NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facturacion`
--

INSERT INTO `facturacion` (`idFacturacion`, `idMembresia`, `folio`, `fecha`, `concepto`, `vigencia`, `unidad`, `costo`, `estatus`, `fechaCorte`, `fechaPago`, `formaPago`, `numeroTarjetas`, `confirmacion`, `idCancelacion`, `fechaCancelacion`, `motivo`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(55, 41, 1, '2025-03-25 05:08:16', 'BÁSICO MENSUAL', 1, 'AÑO', 90.00, 'PAGADO', '2026-03-25 00:00:00', '2025-03-25 17:08:30', 'MERCADO PAGO', '0000-0000-0000-0000', '', 0, '1989-01-01 00:00:00', '', '2025-03-25 05:08:16', '2025-03-25 17:08:30', ' [ INSERT 2025-03-25 05:08:16 ], [ idUser 1259 IP:  ] ', 1),
(56, 42, 2, '2025-03-25 05:48:02', 'PRO MENSUAL', 1, 'AÑO', 200.00, 'PAGADO', '2026-03-25 00:00:00', '2025-03-25 17:48:13', 'MERCADO PAGO', '0000-0000-0000-0000', '', 0, '1989-01-01 00:00:00', '', '2025-03-25 05:48:02', '2025-03-25 17:48:13', ' [ INSERT 2025-03-25 05:48:02 ], [ idUser 1260 IP:  ] ', 1),
(57, 43, 3, '2025-04-01 02:44:00', 'PLUS MENSUAL ', 1, 'AÑO', 135.00, 'PENDIENTE', '2026-04-01 00:00:00', '1989-01-01 00:00:00', '', '', '', 0, '1989-01-01 00:00:00', '', '2025-04-01 02:44:00', '2025-04-01 02:44:00', ' [ INSERT 2025-04-01 02:44:00 ], [ idUser 1263 IP:  ] ', 1),
(58, 44, 4, '2025-04-01 02:46:46', 'BÁSICO MENSUAL', 1, 'AÑO', 90.00, 'CANCELADA', '2026-04-01 00:00:00', '1989-01-01 00:00:00', '', '', '', 0, '1989-01-01 00:00:00', '', '2025-04-01 02:46:46', '2025-04-01 02:47:35', ' [ UDATE 2025-04-01 02:47:35 ], [ idUser   IP  ] ', 1),
(59, 44, 5, '2025-04-01 02:48:03', 'PLUS MENSUAL ', 1, 'AÑO', 135.00, 'PAGADO', '2026-04-01 00:00:00', '2025-04-01 14:48:21', 'MERCADO PAGO', '0000-0000-0000-0000', '', 0, '1989-01-01 00:00:00', '', '2025-04-01 02:48:03', '2025-04-01 14:48:21', ' [ INSERT 2025-04-01 02:48:03 ], [ idUser 1261 IP:  ] ', 1),
(60, 45, 6, '2025-04-02 01:30:50', 'PLUS MENSUAL ', 1, 'AÑO', 135.00, 'PAGADO', '2026-04-02 00:00:00', '2025-04-02 13:38:22', 'MERCADO PAGO', '0000-0000-0000-0000', '', 0, '1989-01-01 00:00:00', '', '2025-04-02 01:30:50', '2025-04-02 13:38:22', ' [ INSERT 2025-04-02 01:30:50 ], [ idUser 1262 IP:  ] ', 1),
(61, 46, 7, '2025-04-15 07:53:36', 'PLUS MENSUAL ', 1, 'AÑO', 135.00, 'PAGADO', '2026-04-15 00:00:00', '2025-04-15 19:54:03', 'MERCADO PAGO', '0000-0000-0000-0000', '', 0, '1989-01-01 00:00:00', '', '2025-04-15 07:53:36', '2025-04-15 19:54:03', ' [ INSERT 2025-04-15 07:53:36 ], [ idUser 1265 IP:  ] ', 1),
(62, 46, 8, '2025-04-16 12:04:37', 'PRO MENSUAL', 1, 'AÑO', 200.00, 'PENDIENTE', '2026-04-16 00:00:00', '1989-01-01 00:00:00', '', '', '', 0, '1989-01-01 00:00:00', '', '2025-04-16 12:04:37', '2025-04-16 12:04:37', ' [ INSERT 2025-04-16 12:04:37 ], [ idUser 1265 IP:  ] ', 1),
(63, 47, 9, '2025-04-25 12:01:48', 'SUPER PRO', 1, 'AÑO', 270.00, 'PAGADO', '2026-04-25 00:00:00', '2025-04-25 00:02:51', 'MERCADO PAGO', '0000-0000-0000-0000', '', 0, '1989-01-01 00:00:00', '', '2025-04-25 12:01:48', '2025-04-25 00:02:51', ' [ INSERT 2025-04-25 12:01:48 ], [ idUser 1268 IP:  ] ', 1),
(64, 48, 10, '2025-05-08 04:56:52', 'SUPER PRO', 1, 'AÑO', 270.00, 'CANCELADA', '2026-05-08 00:00:00', '1989-01-01 00:00:00', '', '', '', 0, '1989-01-01 00:00:00', '', '2025-05-08 04:56:52', '2025-06-23 06:47:31', ' [ UDATE 2025-06-23 06:47:31 ], [ idUser   IP  ] ', 1),
(65, 48, 11, '2025-06-23 06:47:35', 'PRO MENSUAL', 1, 'AÑO', 200.00, 'PENDIENTE', '2026-06-23 00:00:00', '1989-01-01 00:00:00', '', '', '', 0, '1989-01-01 00:00:00', '', '2025-06-23 06:47:35', '2025-06-23 06:47:35', ' [ INSERT 2025-06-23 06:47:35 ], [ idUser 1269 IP:  ] ', 1),
(66, 49, 12, '2025-12-05 09:12:41', 'PRO MENSUAL', 1, 'AÑO', 200.00, 'PAGADO', '2026-12-05 00:00:00', '2025-12-05 09:12:45', 'MERCADO PAGO', '0000-0000-0000-0000', '', 0, '1989-01-01 00:00:00', '', '2025-12-05 09:12:41', '2025-12-05 09:12:45', ' [ INSERT 2025-12-05 09:12:41 ], [ idUser 1276 IP:  ] ', 1);



CREATE TABLE `formasPago` (
  `idFormasPago` int(11) NOT NULL,
  `idUsuarios` int(11) NOT NULL,
  `formaPago` varchar(30) NOT NULL,
  `numeroTarjetas` varchar(30) NOT NULL,
  `fechaVencimiento` varchar(100) NOT NULL,
  `cvv` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `pricipal` tinyint(1) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `membresia` (
  `idMembresia` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idPlan` int(11) NOT NULL,
  `folio` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `membresia`
--

INSERT INTO `membresia` (`idMembresia`, `idUsuario`, `idPlan`, `folio`, `fecha`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(41, 1259, 7, 1, '2025-03-25 05:08:16', '2025-03-25 05:08:16', '2025-03-25 05:08:16', ' [ INSERT 2025-03-25 05:08:16 ], [ idUser 1259 IP:  ] ', 1),
(42, 1260, 9, 2, '2025-03-25 05:48:02', '2025-03-25 05:48:02', '2025-03-25 05:48:02', ' [ INSERT 2025-03-25 05:48:02 ], [ idUser 1260 IP:  ] ', 1),
(43, 1263, 8, 3, '2025-04-01 02:44:00', '2025-04-01 02:44:00', '2025-04-01 02:44:00', ' [ INSERT 2025-04-01 02:44:00 ], [ idUser 1263 IP:  ] ', 1),
(44, 1261, 8, 4, '2025-04-01 02:46:46', '2025-04-01 02:46:46', '2025-04-01 02:48:03', ' [ UPFATE 2025-04-01 02:48:03 ], [ idUser 1261  IP 170.80.30.1 ] ', 1),
(45, 1262, 8, 5, '2025-04-02 01:30:50', '2025-04-02 01:30:50', '2025-04-02 01:30:50', ' [ INSERT 2025-04-02 01:30:50 ], [ idUser 1262 IP:  ] ', 1),
(46, 1265, 9, 6, '2025-04-15 07:53:36', '2025-04-15 07:53:36', '2025-04-16 12:04:37', ' [ UPFATE 2025-04-16 12:04:37 ], [ idUser 1265  IP 10.1.17.182 ] ', 1),
(47, 1268, 10, 7, '2025-04-25 12:01:48', '2025-04-25 12:01:48', '2025-04-25 12:01:48', ' [ INSERT 2025-04-25 12:01:48 ], [ idUser 1268 IP:  ] ', 1),
(48, 1269, 9, 8, '2025-05-08 04:56:52', '2025-05-08 04:56:52', '2025-06-23 06:47:35', ' [ UPFATE 2025-06-23 06:47:35 ], [ idUser 1269  IP 10.1.17.121 ] ', 1),
(49, 1276, 9, 9, '2025-12-05 09:12:41', '2025-12-05 09:12:41', '2025-12-05 09:12:41', ' [ INSERT 2025-12-05 09:12:41 ], [ idUser 1276 IP:  ] ', 1);


CREATE TABLE `mercadoPago` (
  `idMPago` int(11) NOT NULL,
  `tocken` varchar(190) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mercadoPago`
--

INSERT INTO `mercadoPago` (`idMPago`, `tocken`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 'APP_USR-3725076563098810-120206-dbb50b28db0daf98a269a148a66f9387-2126893812', '2024-09-11 12:04:57', '2025-04-25 12:43:33', ' [ UPFATE 2025-04-25 12:43:33 ], [ idUser 46 IP: 10.1.17.169 ]', 1);



CREATE TABLE `metodoPago` (
  `idMetodoPago` int(11) NOT NULL,
  `idMembresia` int(11) NOT NULL,
  `formaPago` varchar(10) NOT NULL,
  `numeroTarjetas` varchar(25) NOT NULL,
  `fechaVencimiento` varchar(30) NOT NULL,
  `cvv` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `principal` tinyint(1) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodoPago`
--

INSERT INTO `metodoPago` (`idMetodoPago`, `idMembresia`, `formaPago`, `numeroTarjetas`, `fechaVencimiento`, `cvv`, `nombre`, `apellidos`, `principal`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 1, 'MEMBRESIA', '2125242600000122', '2024-07-18 23:59:59', '', '', '', 1, '2024-04-30 08:14:04', '2024-04-30 08:14:04', ' [ INSERT 2024-04-30 08:14:04 ], [ idUser 1198  IP: 172.20.0.1] ', 1),
(2, 1, 'CREDITO', '2323223423423423', '2024-04', '234', 'Andres', 'Renato', 0, '2024-04-30 08:18:03', '2024-04-30 08:18:03', ' [ INSERT 2024-04-30 08:18:03 ], [ idUser 1198  IP: 172.20.0.1] ', 1),
(3, 6, 'MEMBRESIA', '2109115200000001', '2024-05-04 23:59:59', '', '', '', 0, '2024-05-03 12:40:37', '2024-05-03 12:40:37', ' [ INSERT 2024-05-03 12:40:37 ], [ idUser 1194  IP: 172.20.0.1] ', 1),
(4, 11, 'CREDITO', '3445567656454435', '2024-09', '233', 'Carlos Andres', 'Gonzalez Gomez', 1, '2024-05-06 12:46:06', '2024-05-06 06:12:21', ' [ DELETE 2024-05-06 06:12:21 ], [ idUser 1198 ] ', 0),
(5, 11, 'CREDITO', '2334345252345345', '2027-06', '123', 'Carlos Andres', 'Gonzalez Gomez', 0, '2024-05-06 04:51:09', '2024-05-06 06:12:27', ' [ DELETE 2024-05-06 06:12:27 ], [ idUser 1198 ] ', 0),
(6, 11, 'CREDITO', '4356456456435645', '2024-05', '456', 'RaulSalcedo', 'Gonzalez Gomez', 1, '2024-05-06 04:52:06', '2024-05-06 04:52:06', ' [ INSERT 2024-05-06 04:52:06 ], [ idUser 1198  IP: 172.20.0.1] ', 1),
(7, 11, 'MEMBRESIA', '2140382500000099', '2024-10-29 23:59:59', '', '', '', 0, '2024-05-06 04:58:39', '2024-05-06 04:58:39', ' [ INSERT 2024-05-06 04:58:39 ], [ idUser 1198  IP: 172.20.0.1] ', 1),
(8, 11, 'MEMBRESIA', '2140382500000099', '2024-10-29 23:59:59', '', '', '', 1, '2024-05-06 05:00:28', '2024-05-06 06:14:02', ' [ DELETE 2024-05-06 06:14:02 ], [ idUser 1198 ] ', 0),
(9, 12, 'MEMBRESIA', '2140382500000099', '2024-10-29 23:59:59', '', '', '', 1, '2024-05-13 06:55:28', '2024-05-13 06:55:28', ' [ INSERT 2024-05-13 06:55:28 ], [ idUser 1218  IP: 2806:2f0:53e1:8f2b:c9e4:9a3d:9873:96ca] ', 1),
(10, 13, 'CREDITO', '2131232321312321', '2024-05', '123', 'Alejandor', 'Ramieres', 1, '2024-05-13 07:37:24', '2024-05-13 07:37:24', ' [ INSERT 2024-05-13 07:37:24 ], [ idUser 1219  IP: 2806:2f0:53e1:8f2b:c9e4:9a3d:9873:96ca] ', 1),
(11, 23, 'MEMBRESIA', '2140382500000099', '2024-10-29 23:59:59', '', '', '', 1, '2024-05-14 01:01:20', '2024-05-14 01:01:20', ' [ INSERT 2024-05-14 01:01:20 ], [ idUser 1220  IP: 172.20.0.1] ', 1),
(12, 24, 'MEMBRESIA', '2140382500000099', '2024-10-29 23:59:59', '', '', '', 1, '2024-06-06 03:17:29', '2024-06-06 03:20:13', ' [ DELETE 2024-06-06 03:20:13 ], [ idUser 1225 ] ', 0),
(13, 24, 'CREDITO', '4564565465465464', '2024-06', '454', 'Carlos Andres', 'Ramires Curz', 0, '2024-06-06 03:21:44', '2024-06-06 03:21:44', ' [ INSERT 2024-06-06 03:21:44 ], [ idUser 1225  IP: 2806:2f0:53e1:8f2b:9df5:dc17:cf8d:a75e] ', 1),
(14, 25, 'CREDITO', '3453245345324534', '2024-08', '123', 'Ernesto ', 'Valverde', 1, '2024-08-12 11:42:24', '2024-08-12 11:42:24', ' [ INSERT 2024-08-12 11:42:24 ], [ idUser 1218  IP: 2806:2f0:53e1:8f2b:9c8:bad2:70a8:61cb] ', 1),
(15, 26, 'MEMBRESIA', '2095157600000001', '2024-09-30 00:00:00', '', '', '', 1, '2024-08-12 11:55:40', '2024-08-12 11:55:40', ' [ INSERT 2024-08-12 11:55:40 ], [ idUser 1219  IP: 2806:2f0:53e1:8f2b:9c8:bad2:70a8:61cb] ', 1),
(16, 27, 'CREDITO', '4565464536435645', '2024-08', '123', 'Roberto Carlos ', 'Renatp', 1, '2024-08-13 12:26:34', '2024-08-13 12:26:34', ' [ INSERT 2024-08-13 12:26:34 ], [ idUser 1229  IP: 2806:2f0:53e1:8f2b:e560:a441:74e2:9088] ', 1),
(17, 28, 'CREDITO', '6444444444444444', '2024-08', '234', 'Carlos Andres', 'Ramirez', 1, '2024-08-14 12:23:52', '2024-08-14 12:23:52', ' [ INSERT 2024-08-14 12:23:52 ], [ idUser 1220  IP: 2806:2f0:53e1:8f2b:a9bd:a6b4:1b0f:c1e] ', 1),
(18, 29, 'CREDITO', '3523453453253453', '2024-08', '234', 'RaulSalcedo', 'Ramires Curz', 1, '2024-08-14 12:25:19', '2024-08-14 12:25:19', ' [ INSERT 2024-08-14 12:25:19 ], [ idUser 1225  IP: 2806:2f0:53e1:8f2b:a9bd:a6b4:1b0f:c1e] ', 1),
(19, 31, 'CREDITO', '5645645363456456', '2024-08', '234', 'RaulSalcedo ', 'Vargas', 1, '2024-08-14 12:27:29', '2024-08-14 12:27:29', ' [ INSERT 2024-08-14 12:27:29 ], [ idUser 1228  IP: 2806:2f0:53e1:8f2b:a9bd:a6b4:1b0f:c1e] ', 1),
(20, 32, 'CREDITO', '3234214243234214', '2024-08', '233', 'Delgao', 'Suarez', 1, '2024-08-28 01:26:08', '2024-08-28 01:26:08', ' [ INSERT 2024-08-28 01:26:08 ], [ idUser 1230  IP: 10.1.17.158] ', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `miembros`
--

CREATE TABLE `miembros` (
  `idMiembro` int(11) NOT NULL,
  `idGrupo` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `miembros`
--

INSERT INTO `miembros` (`idMiembro`, `idGrupo`, `idUsuario`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(100, 19, 46, '2024-05-28 08:07:18', '2024-05-28 08:07:18', ' [ INSERT 2024-05-28 08:07:18 ], [ idUser 46 IP: 2806:2f0:53e1:8f2b:bde1:293b:b912:7298 ] ', 1),
(101, 19, 1224, '2024-05-28 08:07:18', '2024-05-28 08:07:18', ' [ INSERT 2024-05-28 08:07:18 ], [ idUser 46 IP: 2806:2f0:53e1:8f2b:bde1:293b:b912:7298 ] ', 1);

CREATE TABLE `parametros` (
  `idParametro` int(11) NOT NULL,
  `contrato` text NOT NULL,
  `dominio` text NOT NULL,
  `modo` varchar(20) DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `parametros`
--

INSERT INTO `parametros` (`idParametro`, `contrato`, `dominio`, `modo`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, '/upload/20250108110503Terminos-y-Condiciones-de-Venta.pdf', 'http://sms.coeficiente.mx/', 'DEMOSTRACION', '2024-01-09 10:25:19', '2025-04-01 04:13:36', ' [ UPFATE 2025-04-01 04:13:36 ], [ idUser 46 IP: 187.191.8.166 ]', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expiracion` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------



CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `id_sesion` int(11) NOT NULL,
  `token` text NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_expiracion` datetime NOT NULL,
  `revocado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `id_sesion`, `token`, `fecha_creacion`, `fecha_expiracion`, `revocado`) VALUES
(1, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2MzUxNTY4NywiZXhwIjoxNzY0MTIwNDg3LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiMSIsInRva2VuSWQiOiJkNTJjZWVkOGFjNGNjZmM5YTZkOGU5YTMzMzJjODc0ZCJ9fQ.3kNxEI6we10YlL2S3D_TyUlqdNtD_uozBzKc-h2_7e4', '2025-11-19 01:28:07', '2025-11-26 01:28:07', 0),
(2, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2MzUxNTczMiwiZXhwIjoxNzY0MTIwNTMyLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiMiIsInRva2VuSWQiOiI4YzUxN2JiMjIwM2VhYWY3ZGU1YThmNGI4ZWRlNjg1YyJ9fQ.Kuzd0n9IQ_eRd2QHREFXLr_eqM7npoSJ3e6QmFwWRZc', '2025-11-19 01:28:52', '2025-11-26 01:28:52', 0),
(3, 3, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2MzUxNTgwOSwiZXhwIjoxNzY0MTIwNjA5LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiMyIsInRva2VuSWQiOiIwMDVlNGIxMjM5Y2ZjOGUwYTU5OWRjNGVhYmIwZDBlMCJ9fQ.CWkGzHVIPINq4xMw_Wdlvr2o1zFxHL_11qD4tcry5C8', '2025-11-19 01:30:09', '2025-11-26 01:30:09', 0),
(4, 4, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDAwNjk2OCwiZXhwIjoxNzY0NjExNzY4LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiNCIsInRva2VuSWQiOiI1MTQ4MzU4N2UzNTRmZmUyY2MyNzFjMjUzYWVhNzc5NCJ9fQ.hJSMIf-i_V_pRvQDlQRd-gwhrKombEYAUyN81oaayIc', '2025-11-24 17:56:08', '2025-12-01 17:56:08', 0),
(5, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDAwNzE4OSwiZXhwIjoxNzY0NjExOTg5LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiNSIsInRva2VuSWQiOiIzNmEyMDVkZmUxMTJiMDRkOTkwZWZjOWRiMTBlYjAxNSJ9fQ.kUEh5NhlHOjszCuCALsErashmTgj-WP0d4Xi5ZhBd-M', '2025-11-24 17:59:49', '2025-12-01 17:59:49', 0),
(6, 6, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDAzNjUzNSwiZXhwIjoxNzY0NjQxMzM1LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiNiIsInRva2VuSWQiOiJhZjE0NDI1OGU0ZWVkZjU4ZDFkOWI3OWMzMjNlMDk4ZCJ9fQ.szBWolYLkn6mReqGX5BTRl3ZTU7Rnz7TGgJ9otItgb0', '2025-11-25 02:08:55', '2025-12-02 02:08:55', 0),
(7, 7, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDAzNjcxMiwiZXhwIjoxNzY0NjQxNTEyLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiNyIsInRva2VuSWQiOiJkMjczNzE1OTE0YTgwYzlkZmI4Y2UyOTQ5NzYyNjZkZSJ9fQ.KFf0rruaYK2ufb8JcdQq4ZIGlGL-lkP_Zw7CS4toIs8', '2025-11-25 02:11:52', '2025-12-02 02:11:52', 0),
(8, 8, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDAzNjc4NSwiZXhwIjoxNzY0NjQxNTg1LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiOCIsInRva2VuSWQiOiJjZTQzOWJlZWMwNWUzM2ZlMDU1Y2U1MjhkZGI5ZWI3YiJ9fQ.L8eSiQc4ZLAin4u78VyQd5V452OGLwI5JQE3LIG1yts', '2025-11-25 02:13:05', '2025-12-02 02:13:05', 0),
(9, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDA3Mzc4MSwiZXhwIjoxNzY0Njc4NTgxLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiOSIsInRva2VuSWQiOiJmYzljNjZhYjY3N2RlMGQ2Yjg4OGE2YWViNmU2ZDAzZiJ9fQ.h9cCCAlDNj-X_OL3xtZNA7K9U6GHOFZtHZyrcMfpXSY', '2025-11-25 12:29:41', '2025-12-02 12:29:41', 0),
(10, 10, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDM2MzgwMywiZXhwIjoxNzY0OTY4NjAzLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiMTAiLCJ0b2tlbklkIjoiNWVjOGZhNWMxMTIwNGVhNzBkYTJjM2M5Njk1MTdkNzcifX0.B_ZgcIPeGrJOtWrXZW8VxxGAFGRhPrm7QOq6EyA_c8Y', '2025-11-28 21:03:23', '2025-12-05 21:03:23', 0),
(11, 11, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDkyNTcxMywiZXhwIjoxNzY1NTMwNTEzLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NSIsImlkU2VzaW9uIjoiMTEiLCJ0b2tlbklkIjoiMzU5ZTRhN2MzNmJkYTlkNGFmNDVkMWE2MmFlM2U0MDkifX0.14CqiFxqERdh_XTPvOYd3-X7dukubXGlXq--qo6NwCY', '2025-12-05 09:08:33', '2025-12-12 09:08:33', 0),
(12, 12, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDkyNTc3MiwiZXhwIjoxNzY1NTMwNTcyLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiNDYiLCJpZFNlc2lvbiI6IjEyIiwidG9rZW5JZCI6ImFkOWYxZGMzNTYxZGZkMjFiOTVmZWVjM2UzMzg0OGY2In19.AciiwI_ZoyhH3sjsMPxr-WAyV19CZuP5q-PvpZrLVbE', '2025-12-05 09:09:32', '2025-12-12 09:09:32', 0),
(13, 13, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDkyNTgwOCwiZXhwIjoxNzY1NTMwNjA4LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiNDYiLCJpZFNlc2lvbiI6IjEzIiwidG9rZW5JZCI6IjU2NzQ5ZmNlYmY0MzFlMTI1NjI3MzEzZjMyYTBlM2Q0In19.iu1V-L_ULHtZp2AjS1c6Rm5XhTXQKK39ak2mpW-91k4', '2025-12-05 09:10:08', '2025-12-12 09:10:08', 0),
(14, 14, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDkyNTk0MCwiZXhwIjoxNzY1NTMwNzQwLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiMTI3NiIsImlkU2VzaW9uIjoiMTQiLCJ0b2tlbklkIjoiODQwZDliZTg1MWIzOGIyNDIyNTc2MzFlNzJkYWU3NmEifX0.lm9j2zLUC1eFsRAcMIY2rzvJn_dZ6i9nrOBpH4XXC-w', '2025-12-05 09:12:20', '2025-12-12 09:12:20', 0),
(15, 15, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDkyNjE0MiwiZXhwIjoxNzY1NTMwOTQyLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiNDYiLCJpZFNlc2lvbiI6IjE1IiwidG9rZW5JZCI6IjJlOGMzYTkyYmNhZDM4YWQwOGU2NmI0ZjEyNGU2OTk1In19.hGTnrxECvUnDq7P9Cm8AuYBDe_iSB04mn8qE3Ks9FdE', '2025-12-05 09:15:42', '2025-12-12 09:15:42', 0),
(16, 16, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDkyODUxMiwiZXhwIjoxNzY1NTMzMzEyLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiNDYiLCJpZFNlc2lvbiI6IjE2IiwidG9rZW5JZCI6IjdkM2MyNTY4YWZlNGNlZGMyZjhmMDQwYjVkYmFjMzEyIn19._2gw4NXWYS5ZXmFFNQnnrsYqP9UQaR61V2AvWP9onfU', '2025-12-05 09:55:12', '2025-12-12 09:55:12', 0),
(17, 17, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NDk5NDc4NywiZXhwIjoxNzY1NTk5NTg3LCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiNDYiLCJpZFNlc2lvbiI6IjE3IiwidG9rZW5JZCI6ImNhMDg3YWU4NmRkZWU2NjI0ZGZlYTE5MzhjMTAzNGY0In19.V5Rnn_jYoXJu4AR6Jd9aWcnX7L5ycgZhjxU4iOgbU_8', '2025-12-06 04:19:47', '2025-12-13 04:19:47', 0),
(18, 18, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0dV9kb21pbmlvLmNvbSIsImlhdCI6MTc2NTA2NDA3MiwiZXhwIjoxNzY1NjY4ODcyLCJ0eXBlIjoicmVmcmVzaCIsImRhdGEiOnsiaWRVc3VhcmlvIjoiNDYiLCJpZFNlc2lvbiI6IjE4IiwidG9rZW5JZCI6IjliNDc2ODUyMzAzMDYwYmQwNWEyZWY5OTFlZDg2NzgxIn19.xeSzeSICtkXkA4SyKjls8Vq6ImN_vC08qFxFyXdz-nA', '2025-12-06 23:34:32', '2025-12-13 23:34:32', 0);


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servidorCorreo`
--

CREATE TABLE `servidorCorreo` (
  `idSCorreo` int(11) NOT NULL,
  `servidor` text NOT NULL,
  `puerto` text NOT NULL,
  `usuario` text NOT NULL,
  `contrasena` text NOT NULL,
  `tocken` text NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servidorCorreo`
--

INSERT INTO `servidorCorreo` (`idSCorreo`, `servidor`, `puerto`, `usuario`, `contrasena`, `tocken`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(1, 'smtp.gmail.com', '587', 'carlos.andres.g.g.desarrollo@gmail.com', 'flgi kido axex yjag', '.', '2023-12-19 18:06:20', '2023-12-19 18:06:20', '.', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion`
--

CREATE TABLE `sesion` (
  `idSesion` int(11) NOT NULL,
  `sesion` varchar(500) NOT NULL,
  `navegador` text NOT NULL,
  `guid` text NOT NULL,
  `token` text NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `sesiones` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `navegador` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_cierre` datetime DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesiones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarjetas`
--

CREATE TABLE `tarjetas` (
  `idTarjeta` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `numeroTarjeta` varchar(25) NOT NULL,
  `descripcion` text NOT NULL,
  `fechaVencimiento` datetime NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `valor` decimal(18,2) NOT NULL,
  `estatus` varchar(10) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tarjetas`
--

INSERT INTO `tarjetas` (`idTarjeta`, `fecha`, `numeroTarjeta`, `descripcion`, `fechaVencimiento`, `tipo`, `valor`, `estatus`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(466, '2025-11-24 06:00:25', '2103182200000003', '', '2026-09-24 23:59:59', 'NORMAL', 1000.00, 'ACTIVA', '2025-11-24 06:00:25', '2025-11-24 06:00:25', ' [ INSERT 2025-11-24 06:00:25 ], [ idUser   IP: 10.1.17.41] ', 1),
(467, '2025-11-24 06:00:25', '2103116700000003', '', '2026-09-24 23:59:59', 'NORMAL', 1000.00, 'ACTIVA', '2025-11-24 06:00:25', '2025-11-24 06:00:25', ' [ INSERT 2025-11-24 06:00:25 ], [ idUser   IP: 10.1.17.41] ', 1),
(468, '2025-11-24 06:00:25', '2103194400000003', '', '2026-09-24 23:59:59', 'NORMAL', 1000.00, 'ACTIVA', '2025-11-24 06:00:25', '2025-11-24 06:00:25', ' [ INSERT 2025-11-24 06:00:25 ], [ idUser   IP: 10.1.17.41] ', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(200) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `apellidos` varchar(200) NOT NULL,
  `email` varchar(500) NOT NULL,
  `tipoUsuario` varchar(50) DEFAULT NULL,
  `imagen` text NOT NULL,
  `estatus` varchar(10) NOT NULL,
  `contraro` varchar(2) NOT NULL,
  `token` text NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuario`, `usuario`, `contrasena`, `nombre`, `apellidos`, `email`, `tipoUsuario`, `imagen`, `estatus`, `contraro`, `token`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(46, 'administrador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Andres', 'Gonzalez ', 'cgonzalez@coeficiente.com', 'ADMINISTRADOR', '/upload/202408201159141249628.jpg', 'ACTIVO', '0', 'administrador2023-12-29 03:28:58administrador', '2023-12-29 03:28:58', '2025-04-25 12:43:56', ' [ UPFATE 2025-04-25 12:43:56 ], [ idUser  IP:  10.1.17.169] ', 1),
(1275, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Sistema', 'admin@test.com', 'admin', '', 'activo', '1', '1', '2025-11-19 00:04:40', '2025-11-19 00:04:40', '1', 1),
(1276, 'andruxxx78@gmail.com', '$2y$10$FhyXdTTVUnVYQeMWT1AiYeW1GxRe5LtAOPaXwNmdkS8duqGFjHISC', 'Carlos Andres', 'Gonzalez Gomez', 'andruxxx78@gmail.com', 'CLIENTE', '/administrador/Modules/ModulesImage/cliente.png', 'ACTIVO', '0', '52ff940ef579cd5e6136b462229fde9e021826a99995d6ed6bfbe9fc5e31cff2', '2025-12-05 09:10:59', '2025-12-05 09:12:35', ' [ UPFATE 2025-12-05 09:12:35 ], [ idUser 1276 IP:  187.188.64.96] ', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_comentarios`
--

CREATE TABLE `usuarios_comentarios` (
  `idUsuario_comentario` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idAuditor` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `comentario` text NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaModificacion` datetime NOT NULL,
  `observacion` text NOT NULL,
  `bstate` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_comentarios`
--

INSERT INTO `usuarios_comentarios` (`idUsuario_comentario`, `idUsuario`, `idAuditor`, `fecha`, `comentario`, `fechaCreacion`, `fechaModificacion`, `observacion`, `bstate`) VALUES
(15, 1201, 1, '2024-05-11 04:28:35', 'Este rechazo es de prueba, por lo tanto, no es  válido  ', '2024-05-11 04:28:35', '2024-05-11 04:28:35', '[ INSERT  Fecha: 2024-05-11 04:28:35 ], [ idUser 46 IP:  ] ', 1),
(16, 1224, 1, '2024-05-20 11:57:50', 'Se va a rechazar ', '2024-05-20 11:57:50', '2024-05-20 11:57:50', '[ INSERT  Fecha: 2024-05-20 11:57:50 ], [ idUser 46 IP:  ] ', 1),
(17, 1225, 1, '2024-06-06 03:04:03', 'MiguelAngel', '2024-06-06 03:04:03', '2024-06-06 03:04:03', '[ INSERT  Fecha: 2024-06-06 03:04:03 ], [ idUser 46 IP:  ] ', 1),
(18, 1226, 1, '2024-06-06 03:47:16', 'Advanced Micro Devices, Inc. es una compañía estadounidense de semiconductores con sede en Santa Clara, California, que desarrolla procesadores de computación y productos tecnológicos similares de consumo.', '2024-06-06 03:47:16', '2024-06-06 03:47:16', '[ INSERT  Fecha: 2024-06-06 03:47:16 ], [ idUser 46 IP:  ] ', 1),
(19, 1220, 1, '2024-07-29 09:50:35', 'asdasd', '2024-07-29 09:50:35', '2024-07-29 09:50:35', '[ INSERT  Fecha: 2024-07-29 09:50:35 ], [ idUser 46 IP:  ] ', 1),
(20, 1228, 1, '2024-08-08 10:10:04', 'Test', '2024-08-08 10:10:04', '2024-08-08 10:10:04', '[ INSERT  Fecha: 2024-08-08 10:10:04 ], [ idUser 46 IP:  ] ', 1);





CREATE VIEW `datosgenerales_view`  AS SELECT `d`.`idDgenerales` AS `idDgenerales`, `d`.`idUsuario` AS `idUsuario`, ifnull(`u`.`usuario`,'') AS `usuario`, ifnull(`u`.`nombre`,'') AS `nombre`, ifnull(`u`.`apellidos`,'') AS `apellidos`, ifnull(`u`.`tipoUsuario`,'') AS `tipoUsuarios`, `d`.`calle` AS `calle`, `d`.`noExterior` AS `noExterior`, `d`.`noInterior` AS `noInterior`, `d`.`codigoPostal` AS `codigoPostal`, `d`.`colonia` AS `colonia`, `d`.`idMunicipio` AS `idMunicipio`, `d`.`idEstado` AS `idEstado`, `d`.`idPais` AS `idPais`, `d`.`fechaCreacion` AS `fechaCreacion`, `d`.`fechaModificacion` AS `fechaModificacion`, `d`.`observacion` AS `observacion`, `d`.`bstate` AS `bstate` FROM (`datosgenerales` `d` left join `usuarios` `u` on(`u`.`idUsuario` = `d`.`idUsuario`)) WHERE `d`.`bstate` = 1 ORDER BY `d`.`idDgenerales` ASC ;

CREATE VIEW `estados_view`  AS SELECT `e`.`idEstado` AS `idEstado`, `e`.`nombre` AS `nombre`, `e`.`idPais` AS `idPais`, ifnull(`p`.`nombre`,'') AS `Pais`, `e`.`fechaCreacion` AS `fechaCreacion`, `e`.`fechaModificacion` AS `fechaModificacion`, `e`.`observacion` AS `observacion`, `e`.`bstate` AS `bstate` FROM (`cat_estados` `e` left join `cat_paises` `p` on(`p`.`idPais` = `e`.`idPais` and `p`.`bstate` = 1)) WHERE `e`.`bstate` = 1 ORDER BY `e`.`nombre` ASC ;

CREATE VIEW `facturacion_view`  AS SELECT `f`.`idFacturacion` AS `idFacturacion`, `f`.`idMembresia` AS `idMembresia`, `uc`.`idUsuario` AS `idUsuarioCliente`, `uc`.`nombre` AS `NombreCliente`, `uc`.`apellidos` AS `ApellidoCliente`, `uc`.`usuario` AS `UsuarioCliente`, `f`.`folio` AS `folio`, `f`.`fecha` AS `fecha`, `f`.`concepto` AS `concepto`, `f`.`vigencia` AS `vigencia`, `f`.`unidad` AS `unidad`, `f`.`costo` AS `costo`, `f`.`estatus` AS `estatus`, `f`.`fechaCorte` AS `fechaCorte`, `f`.`fechaPago` AS `fechaPago`, `f`.`formaPago` AS `formaPago`, `f`.`numeroTarjetas` AS `numeroTarjetas`, `f`.`confirmacion` AS `confirmacion`, `f`.`idCancelacion` AS `idCancelacion`, `ucan`.`nombre` AS `nombreCancelacion`, `ucan`.`apellidos` AS `apellidosCancelacion`, `ucan`.`usuario` AS `usuarioCancelacion`, `f`.`fechaCancelacion` AS `fechaCancelacion`, `f`.`motivo` AS `motivo`, `f`.`fechaCreacion` AS `fechaCreacion`, `f`.`fechaModificacion` AS `fechaModificacion`, `f`.`observacion` AS `observacion`, `f`.`bstate` AS `bstate` FROM (((`facturacion` `f` left join `membresia` `m` on(`m`.`idMembresia` = `f`.`idMembresia`)) left join `usuarios` `uc` on(`uc`.`idUsuario` = `m`.`idUsuario`)) left join `usuarios` `ucan` on(`ucan`.`idUsuario` = `f`.`idCancelacion`)) WHERE `f`.`bstate` = 1 ORDER BY `f`.`idFacturacion` ASC ;

CREATE VIEW `membresia_view`  AS SELECT `m`.`idMembresia` AS `idMembresia`, `m`.`idUsuario` AS `idUsuario`, `u`.`nombre` AS `nombreUsuario`, `u`.`apellidos` AS `apellidoUsuario`, `u`.`usuario` AS `Usuario`, `m`.`idPlan` AS `idPlan`, `p`.`nombre` AS `NombrePlan`, `p`.`descripcion` AS `descripcion`, `p`.`vigencia` AS `vigencia`, `p`.`unidad` AS `unidad`, `p`.`costo` AS `costo`, `p`.`vinculaciones` AS `vinculaciones`, `p`.`agentes` AS `agentes`, `p`.`area` AS `area`, `p`.`bot` AS `bot`, `p`.`menu` AS `menu`, `m`.`folio` AS `folio`, `m`.`fecha` AS `fecha`, `m`.`fechaCreacion` AS `fechaCreacion`, `m`.`fechaModificacion` AS `fechaModificacion`, `m`.`observacion` AS `observacion`, `m`.`bstate` AS `bstate` FROM ((`membresia` `m` left join `usuarios` `u` on(`u`.`idUsuario` = `m`.`idUsuario`)) left join `cat_planes` `p` on(`p`.`idPlan` = `m`.`idPlan`)) WHERE `m`.`bstate` = 1 ORDER BY `m`.`idMembresia` ASC ;

CREATE VIEW `municipios_view`  AS SELECT `m`.`idMunicipio` AS `idMunicipio`, `m`.`nombre` AS `nombre`, `m`.`idEstado` AS `idEstado`, ifnull(`e`.`nombre`,'') AS `estado`, `m`.`idPais` AS `idPais`, ifnull(`p`.`nombre`,'') AS `pais`, `m`.`fechaCreacion` AS `fechaCreacion`, `m`.`fechaModificacion` AS `fechaModificacion`, `m`.`observacion` AS `observacion`, `m`.`bstate` AS `bstate` FROM ((`cat_municipios` `m` left join `cat_estados` `e` on(`e`.`idEstado` = `m`.`idEstado` and `e`.`idPais` = `m`.`idPais` and `e`.`bstate` = 1)) left join `cat_paises` `p` on(`p`.`idPais` = `m`.`idPais` and `p`.`bstate` = 1)) WHERE `m`.`bstate` = 1 ORDER BY `m`.`nombre` ASC ;

CREATE VIEW `usuarios_comentarios_view`  AS SELECT `uc`.`idUsuario_comentario` AS `idUsuario_comentario`, `uc`.`idUsuario` AS `idUsuario`, ifnull(`u`.`usuario`,'') AS `usuario`, ifnull(`u`.`nombre`,'') AS `nombre`, ifnull(`u`.`apellidos`,'') AS `apellidos`, ifnull(`u`.`email`,'') AS `email`, ifnull(`u`.`tipoUsuario`,'') AS `tipoUsuario`, ifnull(`u`.`estatus`,'') AS `estatus`, ifnull(`u`.`token`,'') AS `usuario_token`, `uc`.`idAuditor` AS `idAuditor`, ifnull(`a`.`usuario`,'') AS `auditor_usuario`, ifnull(`a`.`nombre`,'') AS `auditor_nombre`, ifnull(`a`.`apellidos`,'') AS `auditor_apellidos`, ifnull(`a`.`email`,'') AS `auditor_email`, ifnull(`a`.`tipoUsuario`,'') AS `auditor_tipoUsuario`, `uc`.`fecha` AS `fecha`, `uc`.`comentario` AS `comentario`, `uc`.`fechaCreacion` AS `fechaCreacion`, `uc`.`fechaModificacion` AS `fechaModificacion`, `uc`.`observacion` AS `observacion`, `uc`.`bstate` AS `bstate` FROM ((`usuarios_comentarios` `uc` left join `usuarios` `u` on(`u`.`idUsuario` = `uc`.`idUsuario`)) left join `usuarios` `a` on(`a`.`idUsuario` = `uc`.`idAuditor`)) WHERE `uc`.`bstate` = 1 ORDER BY `uc`.`idUsuario_comentario` ASC ;

--
-- Indices de la tabla `cat_estados`
--
ALTER TABLE `cat_estados`
  ADD PRIMARY KEY (`idEstado`);

--
-- Indices de la tabla `cat_municipios`
--
ALTER TABLE `cat_municipios`
  ADD PRIMARY KEY (`idMunicipio`);

--
-- Indices de la tabla `cat_paises`
--
ALTER TABLE `cat_paises`
  ADD PRIMARY KEY (`idPais`);

--
-- Indices de la tabla `cat_planes`
--
ALTER TABLE `cat_planes`
  ADD PRIMARY KEY (`idPlan`);


ALTER TABLE `codigo`
  ADD PRIMARY KEY (`idCodigo`);

--
-- Indices de la tabla `datosgenerales`
--
ALTER TABLE `datosgenerales`
  ADD PRIMARY KEY (`idDgenerales`);

--
-- Indices de la tabla `facturacion`
--
ALTER TABLE `facturacion`
  ADD PRIMARY KEY (`idFacturacion`);


ALTER TABLE `formasPago`
  ADD PRIMARY KEY (`idFormasPago`);

--
-- Indices de la tabla `membresia`
--
ALTER TABLE `membresia`
  ADD PRIMARY KEY (`idMembresia`);


--
-- Indices de la tabla `mercadoPago`
--
ALTER TABLE `mercadoPago`
  ADD PRIMARY KEY (`idMPago`);

--
-- Indices de la tabla `metodoPago`
--
ALTER TABLE `metodoPago`
  ADD PRIMARY KEY (`idMetodoPago`);

--
-- Indices de la tabla `miembros`
--
ALTER TABLE `miembros`
  ADD PRIMARY KEY (`idMiembro`);

--
-- Indices de la tabla `parametros`
--
ALTER TABLE `parametros`
  ADD PRIMARY KEY (`idParametro`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_expiracion` (`expiracion`);

--
-- Indices de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sesion_revocado` (`id_sesion`,`revocado`),
  ADD KEY `idx_expiracion` (`fecha_expiracion`);


--
-- Indices de la tabla `servidorCorreo`
--
ALTER TABLE `servidorCorreo`
  ADD PRIMARY KEY (`idSCorreo`);

--
-- Indices de la tabla `sesion`
--
ALTER TABLE `sesion`
  ADD PRIMARY KEY (`idSesion`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_activa` (`id_usuario`,`activa`);

--
-- Indices de la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
  ADD PRIMARY KEY (`idTarjeta`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`);

--
-- Indices de la tabla `usuarios_comentarios`
--
ALTER TABLE `usuarios_comentarios`
  ADD PRIMARY KEY (`idUsuario_comentario`);



ALTER TABLE `cat_estados`
  MODIFY `idEstado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `cat_municipios`
--
ALTER TABLE `cat_municipios`
  MODIFY `idMunicipio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `cat_paises`
--
ALTER TABLE `cat_paises`
  MODIFY `idPais` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


--
-- AUTO_INCREMENT de la tabla `cat_planes`
--
ALTER TABLE `cat_planes`
  MODIFY `idPlan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;


ALTER TABLE `codigo`
  MODIFY `idCodigo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;


-- AUTO_INCREMENT de la tabla `datosgenerales`
--
ALTER TABLE `datosgenerales`
  MODIFY `idDgenerales` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `facturacion`
--
ALTER TABLE `facturacion`
  MODIFY `idFacturacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;


--
-- AUTO_INCREMENT de la tabla `formasPago`
--
ALTER TABLE `formasPago`
  MODIFY `idFormasPago` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `membresia`
  MODIFY `idMembresia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;


ALTER TABLE `mercadoPago`
  MODIFY `idMPago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `metodoPago`
--
ALTER TABLE `metodoPago`
  MODIFY `idMetodoPago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `miembros`
--
ALTER TABLE `miembros`
  MODIFY `idMiembro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT de la tabla `parametros`
--
ALTER TABLE `parametros`
  MODIFY `idParametro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `servidorCorreo`
--
ALTER TABLE `servidorCorreo`
  MODIFY `idSCorreo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `sesion`
--
ALTER TABLE `sesion`
  MODIFY `idSesion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5959;

--
-- AUTO_INCREMENT de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
  MODIFY `idTarjeta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=469;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1277;

--
-- AUTO_INCREMENT de la tabla `usuarios_comentarios`
--
ALTER TABLE `usuarios_comentarios`
  MODIFY `idUsuario_comentario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

-- ========================================
-- TABLAS DEL MÓDULO JIRA
-- ========================================

--
-- Estructura de tabla para `jira_proyectos`
--
CREATE TABLE `jira_proyectos` (
  `idProyecto` int(11) NOT NULL AUTO_INCREMENT,
  `folio` int(11) NOT NULL DEFAULT 1,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `color` varchar(20) DEFAULT '#1976D2',
  `icono` varchar(100) DEFAULT 'solar:folder-bold',
  `idUsuario` int(11) DEFAULT NULL COMMENT 'Cliente asignado',
  `estatus` varchar(50) DEFAULT 'ACTIVO',
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `observacion` text DEFAULT NULL,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idProyecto`),
  KEY `idx_usuario` (`idUsuario`),
  KEY `idx_bstate` (`bstate`),
  KEY `idx_folio` (`folio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para `jira_fases`
--
CREATE TABLE `jira_fases` (
  `idFase` int(11) NOT NULL AUTO_INCREMENT,
  `idProyecto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `color` varchar(20) DEFAULT '#1976D2',
  `orden` int(11) DEFAULT 1,
  `esInicial` tinyint(1) DEFAULT 0,
  `esFinal` tinyint(1) DEFAULT 0,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idFase`),
  KEY `idx_proyecto` (`idProyecto`),
  KEY `idx_orden` (`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para `jira_tareas`
--
CREATE TABLE `jira_tareas` (
  `idTarea` int(11) NOT NULL AUTO_INCREMENT,
  `folio` int(11) NOT NULL,
  `idProyecto` int(11) NOT NULL,
  `idFase` int(11) NOT NULL,
  `titulo` varchar(300) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','URGENTE') DEFAULT 'MEDIA',
  `fechaInicio` date DEFAULT NULL,
  `fechaVencimiento` date DEFAULT NULL,
  `orden` int(11) DEFAULT 1,
  `idUsuarioAsignado` int(11) DEFAULT NULL,
  `idUsuarioCreador` int(11) DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `observacion` text DEFAULT NULL,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idTarea`),
  KEY `idx_proyecto` (`idProyecto`),
  KEY `idx_fase` (`idFase`),
  KEY `idx_usuario_asignado` (`idUsuarioAsignado`),
  KEY `idx_bstate` (`bstate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para `jira_comentarios`
--
CREATE TABLE `jira_comentarios` (
  `idComentario` int(11) NOT NULL AUTO_INCREMENT,
  `idTarea` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `tipo` enum('COMENTARIO','CAMBIO_FASE','ARCHIVO','SISTEMA') DEFAULT 'COMENTARIO',
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idComentario`),
  KEY `idx_tarea` (`idTarea`),
  KEY `idx_usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para `jira_archivos`
--
CREATE TABLE `jira_archivos` (
  `idArchivo` int(11) NOT NULL AUTO_INCREMENT,
  `idTarea` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `nombreOriginal` varchar(300) NOT NULL,
  `nombreArchivo` varchar(300) NOT NULL,
  `extension` varchar(20) DEFAULT NULL,
  `tamano` int(11) DEFAULT 0,
  `mimeType` varchar(100) DEFAULT NULL,
  `ruta` varchar(500) NOT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idArchivo`),
  KEY `idx_tarea` (`idTarea`),
  KEY `idx_usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para `jira_historial`
--
CREATE TABLE `jira_historial` (
  `idHistorial` int(11) NOT NULL AUTO_INCREMENT,
  `idTarea` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `valorAnterior` text DEFAULT NULL,
  `valorNuevo` text DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idHistorial`),
  KEY `idx_tarea` (`idTarea`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para `jira_notas_calendario`
--
CREATE TABLE `jira_notas_calendario` (
  `idNota` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `contenido` text DEFAULT NULL,
  `color` varchar(20) DEFAULT '#FFC107',
  `icono` varchar(100) DEFAULT 'mdi:note-outline',
  `idUsuarioCreador` int(11) DEFAULT NULL,
  `recordatorio` tinyint(1) DEFAULT 0,
  `horaRecordatorio` time DEFAULT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bstate` int(11) DEFAULT 1,
  PRIMARY KEY (`idNota`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_usuario` (`idUsuarioCreador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- VISTAS DEL MÓDULO JIRA
-- ========================================

--
-- Vista para tareas con información relacionada
--
CREATE VIEW `jira_tareas_view` AS
SELECT
  t.idTarea, t.folio, t.idProyecto, t.idFase, t.titulo, t.descripcion,
  t.prioridad, t.fechaInicio, t.fechaVencimiento, t.orden,
  t.idUsuarioAsignado, t.idUsuarioCreador, t.fechaCreacion, t.fechaModificacion, t.bstate,
  p.nombre AS nombreProyecto, p.color AS colorProyecto,
  f.nombre AS nombreFase, f.color AS colorFase, f.orden AS ordenFase,
  IFNULL(ua.nombre, '') AS nombreAsignado, IFNULL(ua.apellidos, '') AS apellidosAsignado,
  IFNULL(uc.nombre, '') AS nombreCreador, IFNULL(uc.apellidos, '') AS apellidosCreador,
  (SELECT COUNT(*) FROM jira_comentarios c WHERE c.idTarea = t.idTarea AND c.bstate = 1) AS totalComentarios,
  (SELECT COUNT(*) FROM jira_archivos a WHERE a.idTarea = t.idTarea AND a.bstate = 1) AS totalArchivos
FROM jira_tareas t
LEFT JOIN jira_proyectos p ON t.idProyecto = p.idProyecto
LEFT JOIN jira_fases f ON t.idFase = f.idFase
LEFT JOIN usuarios ua ON t.idUsuarioAsignado = ua.idUsuario
LEFT JOIN usuarios uc ON t.idUsuarioCreador = uc.idUsuario
WHERE t.bstate = 1;

--
-- Vista para comentarios con información de usuario
--
CREATE VIEW `jira_comentarios_view` AS
SELECT
  c.idComentario, c.idTarea, c.idUsuario, c.comentario, c.tipo,
  c.fechaCreacion, c.fechaModificacion, c.bstate,
  IFNULL(u.nombre, 'Sistema') AS nombreUsuario, IFNULL(u.apellidos, '') AS apellidosUsuario
FROM jira_comentarios c
LEFT JOIN usuarios u ON c.idUsuario = u.idUsuario
WHERE c.bstate = 1;

--
-- Vista para archivos con información de usuario
--
CREATE VIEW `jira_archivos_view` AS
SELECT
  a.idArchivo, a.idTarea, a.idUsuario, a.nombreOriginal, a.nombreArchivo,
  a.extension, a.tamano, a.mimeType, a.ruta,
  a.fechaCreacion, a.fechaModificacion, a.bstate,
  IFNULL(u.nombre, '') AS nombreUsuario, IFNULL(u.apellidos, '') AS apellidosUsuario
FROM jira_archivos a
LEFT JOIN usuarios u ON a.idUsuario = u.idUsuario
WHERE a.bstate = 1;

--
-- Vista para notas del calendario
--
CREATE VIEW `jira_notas_calendario_view` AS
SELECT
  n.idNota, n.fecha, n.titulo, n.contenido, n.color, n.icono,
  n.idUsuarioCreador, n.recordatorio, n.horaRecordatorio,
  n.fechaCreacion, n.fechaModificacion, n.bstate,
  IFNULL(u.nombre, '') AS nombreCreador, IFNULL(u.apellidos, '') AS apellidosCreador
FROM jira_notas_calendario n
LEFT JOIN usuarios u ON n.idUsuarioCreador = u.idUsuario
WHERE n.bstate = 1;

