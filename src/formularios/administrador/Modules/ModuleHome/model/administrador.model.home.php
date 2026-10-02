<?php

namespace administrador\Modules\ModuleHome\Model;

include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection;

class HomeModel extends Conection
{
    private $uploadDir;
    private $uploadUrl = '/uploads/home/';
    private $allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    private $maxFileSize = 5242880; // 5 MB
    private $allowedThemes = ['corporativo', 'oscuro', 'naturaleza', 'startup', 'tech'];
    private $allowedAnimations = [
        'minimalista', 'particulas', 'ondas', 'burbujas', 'gradiente',
        'pulso', 'diagonales', 'estrellas', 'geometria', 'red',
        'aurora', 'confeti', 'hexagonos', 'concentricas', 'copos',
        'plasma', 'rayos', 'espiral', 'cubos', 'sonido',
    ];
    private $allowedLoaders = [
        'pulso-logo', 'reloj', 'nube', 'puntos', 'espiral',
        'adn', 'escritura', 'latido', 'ola', 'cubo-3d',
        'orbita', 'reloj-arena', 'brujula', 'ondas-agua', 'atomo',
        'engranajes', 'barra-neon', 'metamorfosis', 'respiracion',
    ];

    public function __construct()
    {
        parent::__construct();
        $root = isset($_SERVER['DOCUMENT_ROOT']) && $_SERVER['DOCUMENT_ROOT'] !== ''
            ? $_SERVER['DOCUMENT_ROOT']
            : '/var/www/html';
        $this->uploadDir = $root . '/uploads/home/';
        if (!is_dir($this->uploadDir)) {
            @mkdir($this->uploadDir, 0775, true);
        }
    }

    // ================================================================
    //  UTILIDADES
    // ================================================================

    private function esc(string $value): string
    {
        return mysqli_real_escape_string($this->Connection, $value);
    }

    /**
     * Sube una imagen validando extension, MIME y tamano.
     * @return array ['success'=>bool, 'path'=>string|null, 'error'=>string|null]
     */
    public function uploadImage(array $file): array
    {
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'path' => null, 'error' => 'Error al recibir el archivo (code ' . ($file['error'] ?? '?') . ')'];
        }

        if ($file['size'] > $this->maxFileSize) {
            return ['success' => false, 'path' => null, 'error' => 'El archivo excede el limite de 5 MB'];
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $this->allowedImageExts, true)) {
            return ['success' => false, 'path' => null, 'error' => 'Extension no permitida. Usa: ' . implode(', ', $this->allowedImageExts)];
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!in_array($mime, $allowedMimes, true)) {
            return ['success' => false, 'path' => null, 'error' => 'Tipo MIME no valido: ' . $mime];
        }

        $nombreArchivo = 'home_' . date('YmdHis') . '_' . mt_rand(1000, 9999) . '.' . $ext;
        $destino = $this->uploadDir . $nombreArchivo;

        if (!move_uploaded_file($file['tmp_name'], $destino)) {
            return ['success' => false, 'path' => null, 'error' => 'No se pudo guardar el archivo en el servidor'];
        }

        return ['success' => true, 'path' => $this->uploadUrl . $nombreArchivo, 'error' => null];
    }

    // ================================================================
    //  AUDIT LOG
    // ================================================================

    public function logAction(int $idUsuario, string $accion, string $entidad, ?int $idEntidad = null, ?string $detalle = null): void
    {
        $this->open();
        $accion   = $this->esc($accion);
        $entidad  = $this->esc($entidad);
        $idEnt    = $idEntidad !== null ? intval($idEntidad) : 'NULL';
        $det      = $detalle !== null ? "'" . $this->esc($detalle) . "'" : 'NULL';

        $q = "INSERT INTO home_audit_log (idUsuario, accion, entidad, idEntidad, detalle)
              VALUES ($idUsuario, '$accion', '$entidad', $idEnt, $det)";
        mysqli_query($this->Connection, $q);
        $this->closet();
    }

    public function getAuditLogs(int $limit = 100, int $offset = 0): array
    {
        $result = ['logs' => [], 'total' => 0, 'message' => ''];
        $this->open();

        $qCount = "SELECT COUNT(*) AS total FROM home_audit_log";
        $r = mysqli_query($this->Connection, $qCount);
        if ($r) {
            $result['total'] = (int) $r->fetch_assoc()['total'];
        }

        $limit  = intval($limit);
        $offset = intval($offset);
        $q = "SELECT l.*, IFNULL(u.nombre, 'Sistema') AS nombreUsuario
              FROM home_audit_log l
              LEFT JOIN usuarios u ON u.idUsuario = l.idUsuario
              ORDER BY l.fecha DESC
              LIMIT $limit OFFSET $offset";
        $r = mysqli_query($this->Connection, $q);
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $result['logs'][] = $row;
            }
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    // ================================================================
    //  CONFIG
    // ================================================================

    public function getConfig(): array
    {
        $result = ['config' => null, 'message' => ''];
        $this->open();
        $r = mysqli_query($this->Connection, "SELECT * FROM home_config WHERE idConfig = 1");
        if ($r && $r->num_rows > 0) {
            $result['config'] = $r->fetch_assoc();
            $result['message'] = 'Good';
        } else {
            mysqli_query($this->Connection, "INSERT INTO home_config (idConfig) VALUES (1)");
            $r2 = mysqli_query($this->Connection, "SELECT * FROM home_config WHERE idConfig = 1");
            $result['config'] = $r2 ? $r2->fetch_assoc() : null;
            $result['message'] = 'Good';
        }
        $this->closet();
        return $result;
    }

    public function updateConfig(string $titulo, string $subtitulo, ?string $imagenFondo = null, ?string $tema = null, ?string $animacionFondo = null, ?string $animacionCarga = null, ?int $animacionDuracion = null, ?string $animacionColor = null, ?string $nombreSitio = null): array
    {
        $result = ['message' => ''];
        $this->open();
        $titulo   = $this->esc($titulo);
        $subtitulo = $this->esc($subtitulo);

        $setCols = "tituloPrincipal = '$titulo', subtitulo = '$subtitulo'";
        if ($imagenFondo !== null) {
            $imagenFondo = $this->esc($imagenFondo);
            $setCols .= ", imagenFondo = '$imagenFondo'";
        }
        if ($tema !== null && in_array($tema, $this->allowedThemes, true)) {
            $setCols .= ", tema = '" . $this->esc($tema) . "'";
        }
        if ($animacionFondo !== null && in_array($animacionFondo, $this->allowedAnimations, true)) {
            $setCols .= ", animacionFondo = '" . $this->esc($animacionFondo) . "'";
        }
        if ($animacionCarga !== null && in_array($animacionCarga, $this->allowedLoaders, true)) {
            $setCols .= ", animacionCarga = '" . $this->esc($animacionCarga) . "'";
        }
        if ($animacionDuracion !== null) {
            $dur = max(1, min(10, intval($animacionDuracion)));
            $setCols .= ", animacionDuracion = $dur";
        }
        if ($animacionColor !== null) {
            $setCols .= ", animacionColor = '" . $this->esc($animacionColor) . "'";
        }
        if ($nombreSitio !== null) {
            $setCols .= ", nombreSitio = '" . $this->esc($nombreSitio) . "'";
        }

        $q = "UPDATE home_config SET $setCols WHERE idConfig = 1";
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function toggleRegistro(): array
    {
        $result = ['message' => ''];
        $this->open();
        $q = "UPDATE home_config SET registroActivo = IF(registroActivo = 1, 0, 1) WHERE idConfig = 1";
        if (mysqli_query($this->Connection, $q)) {
            $r = mysqli_query($this->Connection, "SELECT registroActivo FROM home_config WHERE idConfig = 1");
            $row = $r ? $r->fetch_assoc() : null;
            $result['registroActivo'] = $row ? (int) $row['registroActivo'] : 0;
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function updateLogo(?string $logoPath): array
    {
        $result = ['message' => ''];
        $this->open();
        if ($logoPath === null) {
            $q = "UPDATE home_config SET logo = NULL WHERE idConfig = 1";
        } else {
            $logoPath = $this->esc($logoPath);
            $q = "UPDATE home_config SET logo = '$logoPath' WHERE idConfig = 1";
        }
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    // ================================================================
    //  NAV
    // ================================================================

    public function getNavItems(): array
    {
        $result = ['items' => [], 'message' => ''];
        $this->open();
        $r = mysqli_query($this->Connection, "SELECT * FROM home_nav WHERE bstate = 1 ORDER BY orden ASC");
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $result['items'][] = $row;
            }
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function createNavItem(string $texto, string $link, int $orden): array
    {
        $result = ['message' => '', 'idNav' => 0];
        $this->open();
        $texto = $this->esc($texto);
        $link  = $this->esc($link);
        $orden = intval($orden);

        $q = "INSERT INTO home_nav (texto, link, orden) VALUES ('$texto', '$link', $orden)";
        if (mysqli_query($this->Connection, $q)) {
            $result['idNav'] = (int) mysqli_insert_id($this->Connection);
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function updateNavItem(int $id, string $texto, string $link, int $orden): array
    {
        $result = ['message' => ''];
        $this->open();
        $id    = intval($id);
        $texto = $this->esc($texto);
        $link  = $this->esc($link);
        $orden = intval($orden);

        $q = "UPDATE home_nav SET texto = '$texto', link = '$link', orden = $orden WHERE idNav = $id AND bstate = 1";
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function deleteNavItem(int $id): array
    {
        $result = ['message' => ''];
        $this->open();
        $id = intval($id);
        $q = "UPDATE home_nav SET bstate = 0 WHERE idNav = $id";
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function reorderNav(array $ids): array
    {
        $result = ['message' => ''];
        $this->open();
        foreach ($ids as $orden => $id) {
            $id = intval($id);
            $o  = intval($orden) + 1;
            mysqli_query($this->Connection, "UPDATE home_nav SET orden = $o WHERE idNav = $id");
        }
        $result['message'] = 'Good';
        $this->closet();
        return $result;
    }

    // ================================================================
    //  CARRUSELES
    // ================================================================

    public function getCarruseles(): array
    {
        $result = ['carruseles' => [], 'message' => ''];
        $this->open();
        $r = mysqli_query($this->Connection, "SELECT * FROM home_carruseles WHERE bstate = 1 ORDER BY orden ASC");
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $row['items'] = [];
                $result['carruseles'][] = $row;
            }
            foreach ($result['carruseles'] as &$car) {
                $idC = intval($car['idCarrusel']);
                $rItems = mysqli_query($this->Connection,
                    "SELECT * FROM home_carrusel_items WHERE idCarrusel = $idC AND bstate = 1 ORDER BY orden ASC");
                if ($rItems) {
                    while ($item = $rItems->fetch_assoc()) {
                        $car['items'][] = $item;
                    }
                }
            }
            unset($car);
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function updateCarruselVelocidad(int $id, int $velocidad): array
    {
        $result = ['message' => ''];
        $this->open();
        $id = intval($id);
        $velocidad = max(0, min(10, intval($velocidad)));
        $q = "UPDATE home_carruseles SET velocidad = $velocidad WHERE idCarrusel = $id AND bstate = 1";
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function updateCarrusel(int $id, string $nombre): array
    {
        $result = ['message' => ''];
        $this->open();
        $id     = intval($id);
        $nombre = $this->esc($nombre);
        $q = "UPDATE home_carruseles SET nombre = '$nombre' WHERE idCarrusel = $id AND bstate = 1";
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function createCarruselItem(int $idCarrusel, string $titulo, ?string $descripcion, ?string $link, ?string $imagen, ?string $icono, int $orden): array
    {
        $result = ['message' => '', 'idItem' => 0];
        $this->open();
        $idCarrusel  = intval($idCarrusel);
        $titulo      = $this->esc($titulo);
        $descripcion = $descripcion !== null ? "'" . $this->esc($descripcion) . "'" : 'NULL';
        $link        = $link !== null ? "'" . $this->esc($link) . "'" : 'NULL';
        $imagen      = $imagen !== null ? "'" . $this->esc($imagen) . "'" : 'NULL';
        $icono       = $icono !== null ? "'" . $this->esc($icono) . "'" : 'NULL';
        $orden       = intval($orden);

        $q = "INSERT INTO home_carrusel_items (idCarrusel, titulo, descripcion, link, imagen, icono, orden)
              VALUES ($idCarrusel, '$titulo', $descripcion, $link, $imagen, $icono, $orden)";
        if (mysqli_query($this->Connection, $q)) {
            $result['idItem'] = (int) mysqli_insert_id($this->Connection);
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function updateCarruselItem(int $id, string $titulo, ?string $descripcion, ?string $link, ?string $imagen, ?string $icono, int $orden, int $activo): array
    {
        $result = ['message' => ''];
        $this->open();
        $id     = intval($id);
        $titulo = $this->esc($titulo);
        $orden  = intval($orden);
        $activo = $activo ? 1 : 0;

        $setCols = "titulo = '$titulo', orden = $orden, activo = $activo";
        $setCols .= ", descripcion = " . ($descripcion !== null ? "'" . $this->esc($descripcion) . "'" : 'NULL');
        $setCols .= ", link = " . ($link !== null ? "'" . $this->esc($link) . "'" : 'NULL');
        if ($imagen !== null) {
            $setCols .= ", imagen = '" . $this->esc($imagen) . "'";
        }
        if ($icono !== null) {
            $setCols .= ", icono = '" . $this->esc($icono) . "'";
        }

        $q = "UPDATE home_carrusel_items SET $setCols WHERE idItem = $id AND bstate = 1";
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function deleteCarruselItem(int $id): array
    {
        $result = ['message' => ''];
        $this->open();
        $q = "UPDATE home_carrusel_items SET bstate = 0 WHERE idItem = " . intval($id);
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function toggleCarruselItem(int $id): array
    {
        $result = ['message' => ''];
        $this->open();
        $id = intval($id);
        $q = "UPDATE home_carrusel_items SET activo = IF(activo = 1, 0, 1) WHERE idItem = $id AND bstate = 1";
        if (mysqli_query($this->Connection, $q)) {
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function reorderCarruselItems(array $ids): array
    {
        $result = ['message' => ''];
        $this->open();
        foreach ($ids as $orden => $id) {
            $id = intval($id);
            $o  = intval($orden) + 1;
            mysqli_query($this->Connection, "UPDATE home_carrusel_items SET orden = $o WHERE idItem = $id");
        }
        $result['message'] = 'Good';
        $this->closet();
        return $result;
    }

    // ================================================================
    //  PLANES (solo lectura de cat_planes)
    // ================================================================

    public function getPlanes(): array
    {
        $result = ['planes' => [], 'message' => ''];
        $this->open();
        $r = mysqli_query($this->Connection, "SELECT * FROM cat_planes WHERE bstate = 1 ORDER BY precio ASC");
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $result['planes'][] = $row;
            }
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    // ================================================================
    //  REDES SOCIALES
    // ================================================================

    public function getRedesSociales(): array
    {
        $result = ['redes' => [], 'message' => ''];
        $this->open();
        $r = mysqli_query($this->Connection, "SELECT idRed, nombre, icono, url, orden, activo FROM home_redes_sociales WHERE bstate = 1 ORDER BY orden ASC");
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $result['redes'][] = $row;
            }
            $result['message'] = 'Good';
        } else {
            $result['message'] = 'Bad';
            $result['error'] = mysqli_error($this->Connection);
        }
        $this->closet();
        return $result;
    }

    public function createRedSocial(string $nombre, string $icono, string $url, int $orden): array
    {
        $this->open();
        $nombre = mysqli_real_escape_string($this->Connection, $nombre);
        $icono  = mysqli_real_escape_string($this->Connection, $icono);
        $url    = mysqli_real_escape_string($this->Connection, $url);
        $r = mysqli_query($this->Connection, "INSERT INTO home_redes_sociales (nombre, icono, url, orden) VALUES ('$nombre', '$icono', '$url', $orden)");
        $id = $r ? mysqli_insert_id($this->Connection) : 0;
        $this->closet();
        return $r ? ['message' => 'Good', 'idRed' => $id] : ['message' => 'Bad', 'error' => 'Error al crear'];
    }

    public function updateRedSocial(int $id, string $nombre, string $icono, string $url): array
    {
        $this->open();
        $nombre = mysqli_real_escape_string($this->Connection, $nombre);
        $icono  = mysqli_real_escape_string($this->Connection, $icono);
        $url    = mysqli_real_escape_string($this->Connection, $url);
        $r = mysqli_query($this->Connection, "UPDATE home_redes_sociales SET nombre='$nombre', icono='$icono', url='$url' WHERE idRed=$id");
        $this->closet();
        return $r ? ['message' => 'Good'] : ['message' => 'Bad'];
    }

    public function toggleRedSocial(int $id): array
    {
        $this->open();
        $r = mysqli_query($this->Connection, "UPDATE home_redes_sociales SET activo = IF(activo=1,0,1) WHERE idRed=$id");
        $this->closet();
        return $r ? ['message' => 'Good'] : ['message' => 'Bad'];
    }

    public function deleteRedSocial(int $id): array
    {
        $this->open();
        $r = mysqli_query($this->Connection, "UPDATE home_redes_sociales SET bstate=0 WHERE idRed=$id");
        $this->closet();
        return $r ? ['message' => 'Good'] : ['message' => 'Bad'];
    }

    public function reorderRedesSociales(array $ids): void
    {
        $this->open();
        foreach ($ids as $orden => $id) {
            $id = intval($id);
            $o  = $orden + 1;
            mysqli_query($this->Connection, "UPDATE home_redes_sociales SET orden=$o WHERE idRed=$id");
        }
        $this->closet();
    }

    // ================================================================
    //  MODAL DE BIENVENIDA
    // ================================================================

    public function getModalConfig(): array
    {
        $result = ['config' => null, 'contactos' => [], 'message' => ''];
        $this->open();
        $r = mysqli_query($this->Connection, "SELECT * FROM home_modal_bienvenida WHERE idConfig = 1");
        $result['config'] = $r && $r->num_rows > 0 ? $r->fetch_assoc() : null;

        $r = mysqli_query($this->Connection, "SELECT * FROM home_modal_contactos WHERE bstate = 1 ORDER BY tipo, orden ASC");
        if ($r) { while ($row = $r->fetch_assoc()) $result['contactos'][] = $row; }
        $result['message'] = 'Good';
        $this->closet();
        return $result;
    }

    public function updateModalConfig(int $activo, ?string $textoAgradecimiento, ?string $textoTerapeutas, ?string $textoColaboradores, ?string $textoCursos): array
    {
        $this->open();
        $ta = $textoAgradecimiento !== null ? "'" . mysqli_real_escape_string($this->Connection, $textoAgradecimiento) . "'" : 'NULL';
        $tt = $textoTerapeutas !== null ? "'" . mysqli_real_escape_string($this->Connection, $textoTerapeutas) . "'" : 'NULL';
        $tc = $textoColaboradores !== null ? "'" . mysqli_real_escape_string($this->Connection, $textoColaboradores) . "'" : 'NULL';
        $tu = $textoCursos !== null ? "'" . mysqli_real_escape_string($this->Connection, $textoCursos) . "'" : 'NULL';
        $r = mysqli_query($this->Connection,
            "INSERT INTO home_modal_bienvenida (idConfig, activo, textoAgradecimiento, textoTerapeutas, textoColaboradores, textoCursos)
             VALUES (1, $activo, $ta, $tt, $tc, $tu)
             ON DUPLICATE KEY UPDATE activo=$activo, textoAgradecimiento=$ta, textoTerapeutas=$tt, textoColaboradores=$tc, textoCursos=$tu");
        $this->closet();
        return $r ? ['message' => 'Good'] : ['message' => 'Bad'];
    }

    public function createModalContacto(string $tipo, string $nombre, ?string $descripcion, ?string $telefono, ?string $email, ?string $enlace, ?string $enlaceTexto, int $orden): array
    {
        $this->open();
        $tipo = mysqli_real_escape_string($this->Connection, $tipo);
        $nombre = mysqli_real_escape_string($this->Connection, $nombre);
        $desc = $descripcion ? "'" . mysqli_real_escape_string($this->Connection, $descripcion) . "'" : 'NULL';
        $tel = $telefono ? "'" . mysqli_real_escape_string($this->Connection, $telefono) . "'" : 'NULL';
        $em = $email ? "'" . mysqli_real_escape_string($this->Connection, $email) . "'" : 'NULL';
        $enl = $enlace ? "'" . mysqli_real_escape_string($this->Connection, $enlace) . "'" : 'NULL';
        $enlT = $enlaceTexto ? "'" . mysqli_real_escape_string($this->Connection, $enlaceTexto) . "'" : 'NULL';
        $r = mysqli_query($this->Connection,
            "INSERT INTO home_modal_contactos (tipo, nombre, descripcion, telefono, email, enlace, enlaceTexto, orden)
             VALUES ('$tipo', '$nombre', $desc, $tel, $em, $enl, $enlT, $orden)");
        $id = $r ? mysqli_insert_id($this->Connection) : 0;
        $this->closet();
        return $r ? ['message' => 'Good', 'idContacto' => $id] : ['message' => 'Bad'];
    }

    public function updateModalContacto(int $id, string $nombre, ?string $descripcion, ?string $telefono, ?string $email, ?string $enlace, ?string $enlaceTexto): array
    {
        $this->open();
        $nombre = mysqli_real_escape_string($this->Connection, $nombre);
        $desc = $descripcion ? "'" . mysqli_real_escape_string($this->Connection, $descripcion) . "'" : 'NULL';
        $tel = $telefono ? "'" . mysqli_real_escape_string($this->Connection, $telefono) . "'" : 'NULL';
        $em = $email ? "'" . mysqli_real_escape_string($this->Connection, $email) . "'" : 'NULL';
        $enl = $enlace ? "'" . mysqli_real_escape_string($this->Connection, $enlace) . "'" : 'NULL';
        $enlT = $enlaceTexto ? "'" . mysqli_real_escape_string($this->Connection, $enlaceTexto) . "'" : 'NULL';
        $r = mysqli_query($this->Connection,
            "UPDATE home_modal_contactos SET nombre='$nombre', descripcion=$desc, telefono=$tel, email=$em, enlace=$enl, enlaceTexto=$enlT WHERE idContacto=$id");
        $this->closet();
        return $r ? ['message' => 'Good'] : ['message' => 'Bad'];
    }

    public function toggleModalContacto(int $id): array
    {
        $this->open();
        $r = mysqli_query($this->Connection, "UPDATE home_modal_contactos SET activo = IF(activo=1,0,1) WHERE idContacto=$id");
        $this->closet();
        return $r ? ['message' => 'Good'] : ['message' => 'Bad'];
    }

    public function deleteModalContacto(int $id): array
    {
        $this->open();
        $r = mysqli_query($this->Connection, "UPDATE home_modal_contactos SET bstate=0 WHERE idContacto=$id");
        $this->closet();
        return $r ? ['message' => 'Good'] : ['message' => 'Bad'];
    }

    public function reorderModalContactos(array $ids): void
    {
        $this->open();
        foreach ($ids as $orden => $id) {
            $id = intval($id);
            $o = $orden + 1;
            mysqli_query($this->Connection, "UPDATE home_modal_contactos SET orden=$o WHERE idContacto=$id");
        }
        $this->closet();
    }

    // ================================================================
    //  ENDPOINT PUBLICO: todo el contenido en un solo JSON
    // ================================================================

    public function getPublicData(): array
    {
        $result = ['success' => true];

        $this->open();

        // Config
        $r = mysqli_query($this->Connection, "SELECT tituloPrincipal, subtitulo, imagenFondo, tema, logo, animacionFondo, animacionCarga, animacionDuracion, animacionColor, registroActivo, nombreSitio FROM home_config WHERE idConfig = 1");
        $result['config'] = $r && $r->num_rows > 0 ? $r->fetch_assoc() : ['tituloPrincipal' => '', 'subtitulo' => '', 'imagenFondo' => '', 'tema' => 'corporativo', 'logo' => null, 'animacionFondo' => 'minimalista', 'animacionCarga' => 'pulso-logo', 'animacionDuracion' => 2, 'animacionColor' => null, 'registroActivo' => '1', 'nombreSitio' => 'Formularios Web'];

        // Nav
        $result['nav'] = [];
        $r = mysqli_query($this->Connection, "SELECT texto, link FROM home_nav WHERE bstate = 1 ORDER BY orden ASC");
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $result['nav'][] = $row;
            }
        }

        // Carruseles con items activos
        $result['carruseles'] = [];
        $r = mysqli_query($this->Connection, "SELECT idCarrusel, nombre, velocidad FROM home_carruseles WHERE bstate = 1 ORDER BY orden ASC");
        if ($r) {
            while ($car = $r->fetch_assoc()) {
                $car['items'] = [];
                $idC = intval($car['idCarrusel']);
                $rItems = mysqli_query($this->Connection,
                    "SELECT imagen, icono, titulo, descripcion, link
                     FROM home_carrusel_items
                     WHERE idCarrusel = $idC AND activo = 1 AND bstate = 1
                     ORDER BY orden ASC");
                if ($rItems) {
                    while ($item = $rItems->fetch_assoc()) {
                        $car['items'][] = $item;
                    }
                }
                $result['carruseles'][] = $car;
            }
        }

        // Planes
        $result['planes'] = [];
        $r = mysqli_query($this->Connection, "SELECT nombre, precio, mensajes, descripcion FROM cat_planes WHERE bstate = 1 ORDER BY precio ASC");
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $result['planes'][] = $row;
            }
        }

        // Redes sociales
        $result['redes'] = [];
        $r = mysqli_query($this->Connection, "SELECT nombre, icono, url FROM home_redes_sociales WHERE activo = 1 AND bstate = 1 ORDER BY orden ASC");
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $result['redes'][] = $row;
            }
        }

        // Modal de bienvenida (solo si activo)
        $result['modalBienvenida'] = null;
        $r = mysqli_query($this->Connection, "SELECT activo, textoAgradecimiento, textoTerapeutas, textoColaboradores, textoCursos FROM home_modal_bienvenida WHERE idConfig = 1 AND activo = 1");
        if ($r && $r->num_rows > 0) {
            $modal = $r->fetch_assoc();
            $modal['terapeutas'] = [];
            $modal['colaboradores'] = [];
            $modal['cursos'] = [];
            $rt = mysqli_query($this->Connection, "SELECT nombre, descripcion, telefono, email, enlace, enlaceTexto FROM home_modal_contactos WHERE tipo='terapeuta' AND activo=1 AND bstate=1 ORDER BY orden ASC");
            if ($rt) { while ($row = $rt->fetch_assoc()) $modal['terapeutas'][] = $row; }
            $rc = mysqli_query($this->Connection, "SELECT nombre, descripcion, telefono, email, enlace, enlaceTexto FROM home_modal_contactos WHERE tipo='colaborador' AND activo=1 AND bstate=1 ORDER BY orden ASC");
            if ($rc) { while ($row = $rc->fetch_assoc()) $modal['colaboradores'][] = $row; }
            $ru = mysqli_query($this->Connection, "SELECT nombre, descripcion, telefono, email, enlace, enlaceTexto FROM home_modal_contactos WHERE tipo='curso' AND activo=1 AND bstate=1 ORDER BY orden ASC");
            if ($ru) { while ($row = $ru->fetch_assoc()) $modal['cursos'][] = $row; }
            $result['modalBienvenida'] = $modal;
        }

        $this->closet();
        return $result;
    }
}
