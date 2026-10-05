<?php

namespace administrador\Modules\ModuleFormularios\Model;

include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection;

class FormulariosModel extends Conection
{
    // ================================================================
    //  USER AGENT PARSING
    // ================================================================

    private function parseUserAgent(string $ua): array
    {
        $navegador = 'Otro';
        $dispositivo = 'Escritorio';
        $so = 'Desconocido';

        if (preg_match('/Edg\//i', $ua)) $navegador = 'Edge';
        elseif (preg_match('/OPR|Opera/i', $ua)) $navegador = 'Opera';
        elseif (preg_match('/Chrome/i', $ua)) $navegador = 'Chrome';
        elseif (preg_match('/Firefox/i', $ua)) $navegador = 'Firefox';
        elseif (preg_match('/Safari/i', $ua)) $navegador = 'Safari';
        elseif (preg_match('/MSIE|Trident/i', $ua)) $navegador = 'IE';

        if (preg_match('/Mobile|Android.*Mobile|iPhone|iPod/i', $ua)) $dispositivo = 'Movil';
        elseif (preg_match('/Tablet|iPad|Android(?!.*Mobile)/i', $ua)) $dispositivo = 'Tablet';

        if (preg_match('/Windows NT 10/i', $ua)) $so = 'Windows 10/11';
        elseif (preg_match('/Windows/i', $ua)) $so = 'Windows';
        elseif (preg_match('/Mac OS X/i', $ua)) $so = 'macOS';
        elseif (preg_match('/Android/i', $ua)) $so = 'Android';
        elseif (preg_match('/iPhone|iPad/i', $ua)) $so = 'iOS';
        elseif (preg_match('/Linux/i', $ua)) $so = 'Linux';

        return ['navegador' => $navegador, 'dispositivo' => $dispositivo, 'so' => $so];
    }

    private function generarToken(): string
    {
        return bin2hex(random_bytes(16));
    }

    private function generarSlug(string $titulo): string
    {
        $slug = mb_strtolower($titulo, 'UTF-8');
        $slug = str_replace(
            ['á','é','í','ó','ú','ñ','ü'],
            ['a','e','i','o','u','n','u'],
            $slug
        );
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        return trim($slug, '-');
    }

    // ================================================================
    //  FILE UPLOADS
    // ================================================================

    private $formUploadDir;
    private $formUploadUrl = '/uploads/formularios/';
    private $allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    private $allowedAudioExts = ['mp3', 'ogg', 'wav'];
    private $maxImageSize = 5242880;  // 5 MB
    private $maxAudioSize = 15728640; // 15 MB

    private function initUploadDir(): void
    {
        if ($this->formUploadDir) return;
        $root = isset($_SERVER['DOCUMENT_ROOT']) && $_SERVER['DOCUMENT_ROOT'] !== ''
            ? $_SERVER['DOCUMENT_ROOT']
            : '/var/www/html';
        $this->formUploadDir = $root . '/uploads/formularios/';
        if (!is_dir($this->formUploadDir)) {
            @mkdir($this->formUploadDir, 0775, true);
        }
    }

    public function uploadFormFile(array $file, string $tipo): array
    {
        $this->initUploadDir();

        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'Error al recibir el archivo'];
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if ($tipo === 'imagen') {
            if ($file['size'] > $this->maxImageSize) {
                return ['success' => false, 'error' => 'La imagen excede 5 MB'];
            }
            if (!in_array($ext, $this->allowedImageExts, true)) {
                return ['success' => false, 'error' => 'Extension no permitida. Usa: ' . implode(', ', $this->allowedImageExts)];
            }
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!in_array($mime, $allowedMimes, true)) {
                return ['success' => false, 'error' => 'Tipo MIME no valido: ' . $mime];
            }
        } elseif ($tipo === 'audio') {
            if ($file['size'] > $this->maxAudioSize) {
                return ['success' => false, 'error' => 'El audio excede 15 MB'];
            }
            if (!in_array($ext, $this->allowedAudioExts, true)) {
                return ['success' => false, 'error' => 'Extension no permitida. Usa: ' . implode(', ', $this->allowedAudioExts)];
            }
            $allowedMimes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp3', 'application/octet-stream'];
            if (!in_array($mime, $allowedMimes, true)) {
                return ['success' => false, 'error' => 'Tipo MIME no valido: ' . $mime];
            }
        } else {
            return ['success' => false, 'error' => 'Tipo de archivo no soportado'];
        }

        $nombreArchivo = 'form_' . $tipo . '_' . date('YmdHis') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
        $destino = $this->formUploadDir . $nombreArchivo;

        if (!move_uploaded_file($file['tmp_name'], $destino)) {
            return ['success' => false, 'error' => 'No se pudo guardar el archivo'];
        }

        return ['success' => true, 'path' => $this->formUploadUrl . $nombreArchivo, 'type' => $tipo];
    }

    // ================================================================
    //  PERSONALIZATION
    // ================================================================

    public function actualizarPersonalizacion(int $id, array $campos, int $idUsuario): bool
    {
        $this->open();
        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario FROM cuestionarios WHERE idCuestionario=$id AND creadoPor=$idUsuario");
        if (!$r || $r->num_rows === 0) { $this->closet(); return false; }

        $sets = [];
        $allowed = ['tema', 'colorPrimario', 'colorFondo', 'imagenFondo', 'musicaUrl', 'musicaTipo', 'opacidadFondo'];
        foreach ($allowed as $col) {
            if (!array_key_exists($col, $campos)) continue;
            $val = $campos[$col];
            if ($val === null || $val === '') {
                $sets[] = "$col = NULL";
            } elseif ($col === 'opacidadFondo') {
                $sets[] = "$col = " . max(0, min(100, intval($val)));
            } elseif (!$this->valorPersonalizacionValido($col, $val)) {
                continue;
            } else {
                $sets[] = "$col = '" . mysqli_real_escape_string($this->Connection, $val) . "'";
            }
        }
        if (empty($sets)) { $this->closet(); return true; }

        mysqli_query($this->Connection,
            "UPDATE cuestionarios SET " . implode(', ', $sets) . " WHERE idCuestionario=$id AND creadoPor=$idUsuario");
        $this->closet();
        return true;
    }

    /** Solo se aceptan colores hex, temas alfanumericos y URLs http(s) o archivos propios de /uploads/formularios/. */
    private function valorPersonalizacionValido(string $col, $val): bool
    {
        if (!is_string($val)) return false;
        switch ($col) {
            case 'tema':
                return (bool) preg_match('/^[a-z0-9_-]{1,20}$/i', $val);
            case 'colorPrimario':
            case 'colorFondo':
                return (bool) preg_match('/^#[0-9a-f]{6}$/i', $val);
            case 'musicaTipo':
                return in_array($val, ['archivo', 'youtube', 'url'], true);
            case 'imagenFondo':
            case 'musicaUrl':
                if (strlen($val) > 500) return false;
                if (preg_match('#^/uploads/formularios/[A-Za-z0-9._-]+$#', $val)) return true;
                return filter_var($val, FILTER_VALIDATE_URL) !== false && preg_match('#^https?://#i', $val) === 1;
        }
        return false;
    }

    // ================================================================
    //  FORMULARIOS CRUD (scoped by owner)
    // ================================================================

    public function getMisFormularios(int $idUsuario): array
    {
        $this->open();
        $result = [];
        $r = mysqli_query($this->Connection,
            "SELECT c.idCuestionario, c.titulo, c.descripcion, c.estado, c.compartirToken, c.slug,
                    c.tema, c.colorPrimario, c.colorFondo, c.imagenFondo, c.musicaUrl, c.musicaTipo, c.opacidadFondo,
                    c.crearParticipante, c.fechaCreacion,
                    (SELECT COUNT(*) FROM cuestionario_preguntas WHERE idCuestionario = c.idCuestionario) as totalPreguntas,
                    (SELECT COUNT(*) FROM cuestionario_respuestas_sesion WHERE idCuestionario = c.idCuestionario) as totalRespuestas,
                    (SELECT COUNT(*) FROM formulario_visitas WHERE idCuestionario = c.idCuestionario) as totalVisitas
             FROM cuestionarios c
             WHERE c.creadoPor = $idUsuario
             ORDER BY c.fechaCreacion DESC");
        if ($r) { while ($row = $r->fetch_assoc()) $result[] = $row; }
        $this->closet();
        return $result;
    }

    public function crearFormulario(string $titulo, string $descripcion, int $idUsuario): array
    {
        $this->open();
        $tituloEsc = mysqli_real_escape_string($this->Connection, $titulo);
        $descripcion = mysqli_real_escape_string($this->Connection, $descripcion);
        $token = $this->generarToken();
        $slug = mysqli_real_escape_string($this->Connection, $this->generarSlug($titulo));

        $r = mysqli_query($this->Connection,
            "INSERT INTO cuestionarios (titulo, descripcion, estado, compartirToken, slug, creadoPor)
             VALUES ('$tituloEsc', '$descripcion', 'borrador', '$token', '$slug', $idUsuario)");
        $id = $r ? mysqli_insert_id($this->Connection) : 0;
        $this->closet();
        return ['idCuestionario' => $id, 'compartirToken' => $token, 'slug' => $slug];
    }

    public function crearFormularioCompleto(array $form, int $idUsuario): array
    {
        $this->open();
        $tituloTxt = is_string($form['titulo'] ?? null) ? mb_substr($form['titulo'], 0, 255) : 'Sin titulo';
        $descTxt   = is_string($form['descripcion'] ?? null) ? $form['descripcion'] : '';
        $titulo = mysqli_real_escape_string($this->Connection, $tituloTxt);
        $desc   = mysqli_real_escape_string($this->Connection, $descTxt);
        $token  = $this->generarToken();
        $slug   = mysqli_real_escape_string($this->Connection, $this->generarSlug($tituloTxt));

        $r = mysqli_query($this->Connection,
            "INSERT INTO cuestionarios (titulo, descripcion, estado, compartirToken, slug, creadoPor)
             VALUES ('$titulo', '$desc', 'borrador', '$token', '$slug', $idUsuario)");
        $idCuestionario = $r ? mysqli_insert_id($this->Connection) : 0;

        if ($idCuestionario <= 0) {
            $this->closet();
            return ['success' => false, 'error' => 'No se pudo crear el formulario'];
        }

        $preguntas = is_array($form['preguntas'] ?? null) ? array_slice(array_values($form['preguntas']), 0, 100) : [];
        foreach ($preguntas as $i => $preg) {
            if (!is_array($preg) || !is_string($preg['textoPregunta'] ?? null)) continue;
            $textoPregunta = mysqli_real_escape_string($this->Connection, $preg['textoPregunta']);
            $orden = $i + 1;
            mysqli_query($this->Connection,
                "INSERT INTO cuestionario_preguntas (idCuestionario, textoPregunta, orden)
                 VALUES ($idCuestionario, '$textoPregunta', $orden)");
            $idPregunta = mysqli_insert_id($this->Connection);

            $opciones = is_array($preg['opciones'] ?? null) ? array_slice(array_values($preg['opciones']), 0, 50) : [];
            foreach ($opciones as $j => $opc) {
                if (!is_array($opc) || !is_scalar($opc['texto'] ?? null)) continue;
                $textoOpc  = mysqli_real_escape_string($this->Connection, (string) $opc['texto']);
                $correcta  = !empty($opc['esCorrecta']) ? 1 : 0;
                mysqli_query($this->Connection,
                    "INSERT INTO cuestionario_opciones (idPregunta, textoOpcion, esCorrecta, orden)
                     VALUES ($idPregunta, '$textoOpc', $correcta, $j)");
            }
        }

        $sets = [];
        if (!empty($form['tema']) && $this->valorPersonalizacionValido('tema', $form['tema'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['tema']);
            $sets[] = "tema='$v'";
        }
        if (!empty($form['colorPrimario']) && $this->valorPersonalizacionValido('colorPrimario', $form['colorPrimario'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['colorPrimario']);
            $sets[] = "colorPrimario='$v'";
        }
        if (!empty($form['colorFondo']) && $this->valorPersonalizacionValido('colorFondo', $form['colorFondo'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['colorFondo']);
            $sets[] = "colorFondo='$v'";
        }
        if (!empty($form['imagenFondo']) && $this->valorPersonalizacionValido('imagenFondo', $form['imagenFondo'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['imagenFondo']);
            $sets[] = "imagenFondo='$v'";
        }
        if (!empty($form['musicaUrl']) && $this->valorPersonalizacionValido('musicaUrl', $form['musicaUrl'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['musicaUrl']);
            $sets[] = "musicaUrl='$v'";
        }
        if (!empty($form['musicaTipo']) && $this->valorPersonalizacionValido('musicaTipo', $form['musicaTipo'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['musicaTipo']);
            $sets[] = "musicaTipo='$v'";
        }
        if (isset($form['opacidadFondo'])) {
            $v = max(0, min(100, intval($form['opacidadFondo'])));
            $sets[] = "opacidadFondo=$v";
        }

        if (!empty($sets)) {
            $setStr = implode(', ', $sets);
            mysqli_query($this->Connection,
                "UPDATE cuestionarios SET $setStr WHERE idCuestionario=$idCuestionario");
        }

        $this->closet();
        return [
            'success' => true,
            'idCuestionario' => $idCuestionario,
            'compartirToken' => $token,
            'slug' => $slug,
        ];
    }

    public function getFormulario(int $id, int $idUsuario): ?array
    {
        $this->open();
        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario, titulo, descripcion, estado, compartirToken, slug,
                    tema, colorPrimario, colorFondo, imagenFondo, musicaUrl, musicaTipo, opacidadFondo,
                    crearParticipante, fechaCreacion
             FROM cuestionarios WHERE idCuestionario = $id AND creadoPor = $idUsuario");
        if (!$r || $r->num_rows === 0) { $this->closet(); return null; }
        $form = $r->fetch_assoc();

        $r = mysqli_query($this->Connection,
            "SELECT p.idPregunta, p.textoPregunta, p.orden
             FROM cuestionario_preguntas p
             WHERE p.idCuestionario = $id ORDER BY p.orden ASC");
        $form['preguntas'] = [];
        if ($r) {
            while ($pregunta = $r->fetch_assoc()) {
                $idP = intval($pregunta['idPregunta']);
                $rOpc = mysqli_query($this->Connection,
                    "SELECT idOpcion, textoOpcion, esCorrecta, orden
                     FROM cuestionario_opciones WHERE idPregunta = $idP ORDER BY orden ASC");
                $pregunta['opciones'] = [];
                if ($rOpc) { while ($opc = $rOpc->fetch_assoc()) $pregunta['opciones'][] = $opc; }
                $form['preguntas'][] = $pregunta;
            }
        }
        $this->closet();
        return $form;
    }

    public function actualizarFormulario(int $id, string $titulo, string $descripcion, string $estado, int $idUsuario): bool
    {
        $this->open();
        $tituloEsc = mysqli_real_escape_string($this->Connection, $titulo);
        $descripcion = mysqli_real_escape_string($this->Connection, $descripcion);
        $estado = mysqli_real_escape_string($this->Connection, $estado);
        $slug = mysqli_real_escape_string($this->Connection, $this->generarSlug($titulo));
        $r = mysqli_query($this->Connection,
            "UPDATE cuestionarios SET titulo='$tituloEsc', descripcion='$descripcion', estado='$estado', slug='$slug'
             WHERE idCuestionario=$id AND creadoPor=$idUsuario");
        $affected = mysqli_affected_rows($this->Connection);
        $this->closet();
        return $affected >= 0;
    }

    public function eliminarFormulario(int $id, int $idUsuario): bool
    {
        $this->open();
        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario FROM cuestionarios WHERE idCuestionario=$id AND creadoPor=$idUsuario");
        if (!$r || $r->num_rows === 0) { $this->closet(); return false; }
        mysqli_query($this->Connection, "DELETE FROM cuestionarios WHERE idCuestionario=$id AND creadoPor=$idUsuario");
        $this->closet();
        return true;
    }

    // ================================================================
    //  PREGUNTAS CRUD
    // ================================================================

    public function verificarPropietario(int $idCuestionario, int $idUsuario): bool
    {
        $this->open();
        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario FROM cuestionarios WHERE idCuestionario=$idCuestionario AND creadoPor=$idUsuario");
        $ok = $r && $r->num_rows > 0;
        $this->closet();
        return $ok;
    }

    public function verificarPropietarioPregunta(int $idPregunta, int $idUsuario): bool
    {
        $this->open();
        $r = mysqli_query($this->Connection,
            "SELECT p.idPregunta FROM cuestionario_preguntas p
               JOIN cuestionarios c ON c.idCuestionario = p.idCuestionario
              WHERE p.idPregunta=$idPregunta AND c.creadoPor=$idUsuario");
        $ok = $r && $r->num_rows > 0;
        $this->closet();
        return $ok;
    }

    public function agregarPregunta(int $idCuestionario, string $texto, int $orden, array $opciones): int
    {
        $this->open();
        $texto = mysqli_real_escape_string($this->Connection, $texto);
        mysqli_query($this->Connection,
            "INSERT INTO cuestionario_preguntas (idCuestionario, textoPregunta, orden) VALUES ($idCuestionario, '$texto', $orden)");
        $idPregunta = mysqli_insert_id($this->Connection);

        foreach ($opciones as $i => $opc) {
            $textoOpc = mysqli_real_escape_string($this->Connection, $opc['texto']);
            $correcta = !empty($opc['esCorrecta']) ? 1 : 0;
            mysqli_query($this->Connection,
                "INSERT INTO cuestionario_opciones (idPregunta, textoOpcion, esCorrecta, orden) VALUES ($idPregunta, '$textoOpc', $correcta, $i)");
        }
        $this->closet();
        return $idPregunta;
    }

    public function actualizarPregunta(int $idPregunta, string $texto, array $opciones): bool
    {
        $this->open();
        $texto = mysqli_real_escape_string($this->Connection, $texto);
        mysqli_query($this->Connection, "UPDATE cuestionario_preguntas SET textoPregunta='$texto' WHERE idPregunta=$idPregunta");
        mysqli_query($this->Connection, "DELETE FROM cuestionario_opciones WHERE idPregunta=$idPregunta");
        foreach ($opciones as $i => $opc) {
            $textoOpc = mysqli_real_escape_string($this->Connection, $opc['texto']);
            $correcta = !empty($opc['esCorrecta']) ? 1 : 0;
            mysqli_query($this->Connection,
                "INSERT INTO cuestionario_opciones (idPregunta, textoOpcion, esCorrecta, orden) VALUES ($idPregunta, '$textoOpc', $correcta, $i)");
        }
        $this->closet();
        return true;
    }

    public function eliminarPregunta(int $idPregunta): bool
    {
        $this->open();
        mysqli_query($this->Connection, "DELETE FROM cuestionario_preguntas WHERE idPregunta=$idPregunta");
        $this->closet();
        return true;
    }

    // ================================================================
    //  PUBLIC FORM ACCESS (by token)
    // ================================================================

    public function getFormularioByToken(string $token): ?array
    {
        $this->open();
        $token = mysqli_real_escape_string($this->Connection, $token);
        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario, titulo, descripcion, estado, compartirToken, slug,
                    tema, colorPrimario, colorFondo, imagenFondo, musicaUrl, musicaTipo, opacidadFondo
             FROM cuestionarios WHERE compartirToken='$token' AND estado='publicado'");
        if (!$r || $r->num_rows === 0) { $this->closet(); return null; }
        $form = $r->fetch_assoc();
        $id = intval($form['idCuestionario']);

        $r = mysqli_query($this->Connection,
            "SELECT p.idPregunta, p.textoPregunta, p.orden
             FROM cuestionario_preguntas p WHERE p.idCuestionario=$id ORDER BY p.orden ASC");
        $form['preguntas'] = [];
        if ($r) {
            while ($pregunta = $r->fetch_assoc()) {
                $idP = intval($pregunta['idPregunta']);
                $rOpc = mysqli_query($this->Connection,
                    "SELECT idOpcion, textoOpcion, orden
                     FROM cuestionario_opciones WHERE idPregunta=$idP ORDER BY orden ASC");
                $pregunta['opciones'] = [];
                if ($rOpc) { while ($opc = $rOpc->fetch_assoc()) $pregunta['opciones'][] = $opc; }
                $form['preguntas'][] = $pregunta;
            }
        }
        $this->closet();
        return $form;
    }

    /**
     * Guarda un envio del formulario publico. Solo acepta formularios publicados y respuestas
     * cuyas preguntas y opciones pertenezcan a ese formulario (una por pregunta).
     */
    public function guardarRespuestas(int $idCuestionario, ?string $nombre, ?string $email, array $respuestas, array $demograficos = []): ?array
    {
        $this->open();

        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario FROM cuestionarios WHERE idCuestionario=$idCuestionario AND estado='publicado'");
        if (!$r || $r->num_rows === 0) { $this->closet(); return null; }

        // Opciones validas del formulario: idOpcion => [idPregunta, esCorrecta]
        $opcionesValidas = [];
        $r = mysqli_query($this->Connection,
            "SELECT o.idOpcion, o.idPregunta, o.esCorrecta
               FROM cuestionario_opciones o
               JOIN cuestionario_preguntas p ON p.idPregunta = o.idPregunta
              WHERE p.idCuestionario=$idCuestionario");
        if ($r) { while ($row = $r->fetch_assoc()) $opcionesValidas[intval($row['idOpcion'])] = $row; }

        $aceptadas = [];
        foreach ($respuestas as $idPregunta => $idOpcion) {
            $idPregunta = intval($idPregunta);
            $idOpcion = is_scalar($idOpcion) ? intval($idOpcion) : 0;
            if (isset($opcionesValidas[$idOpcion]) && intval($opcionesValidas[$idOpcion]['idPregunta']) === $idPregunta) {
                $aceptadas[$idPregunta] = $idOpcion;
            }
        }
        if (empty($aceptadas)) { $this->closet(); return null; }

        $nombre = $nombre !== null ? mb_substr(trim($nombre), 0, 100) : '';
        $email = $email !== null ? trim($email) : '';
        if ($email !== '' && (strlen($email) > 255 || !filter_var($email, FILTER_VALIDATE_EMAIL))) $email = '';
        $sexoIn = $demograficos['sexo'] ?? null;
        $sexo = in_array($sexoIn, ['Masculino', 'Femenino', 'Otro'], true) ? "'$sexoIn'" : 'NULL';
        $edadIn = is_scalar($demograficos['edad'] ?? null) ? intval($demograficos['edad']) : 0;
        $edad = ($edadIn >= 1 && $edadIn <= 120) ? $edadIn : 'NULL';

        $nom = $nombre !== '' ? "'" . mysqli_real_escape_string($this->Connection, $nombre) . "'" : 'NULL';
        $ema = $email !== '' ? "'" . mysqli_real_escape_string($this->Connection, $email) . "'" : 'NULL';
        $ids = [];
        foreach (['idPais', 'idEstado', 'idMunicipio'] as $campo) {
            $valor = $demograficos[$campo] ?? null;
            $ids[$campo] = (is_scalar($valor) && intval($valor) > 0) ? intval($valor) : 'NULL';
        }

        mysqli_query($this->Connection,
            "INSERT INTO cuestionario_respuestas_sesion (idCuestionario, nombreParticipante, emailParticipante, sexo, edad, idPais, idEstado, idMunicipio, fechaFin)
             VALUES ($idCuestionario, $nom, $ema, $sexo, $edad, {$ids['idPais']}, {$ids['idEstado']}, {$ids['idMunicipio']}, NOW())");
        $idSesion = mysqli_insert_id($this->Connection);
        if ($idSesion <= 0) { $this->closet(); return null; }

        $correctas = 0;
        foreach ($aceptadas as $idPregunta => $idOpcion) {
            mysqli_query($this->Connection,
                "INSERT INTO cuestionario_respuestas (idSesion, idPregunta, idOpcion) VALUES ($idSesion, $idPregunta, $idOpcion)");
            if (intval($opcionesValidas[$idOpcion]['esCorrecta']) === 1) $correctas++;
        }

        $this->crearParticipanteSiAplica($idCuestionario, $idSesion, $nombre, $email);

        $this->closet();
        return ['idSesion' => $idSesion, 'correctas' => $correctas, 'total' => count($aceptadas)];
    }

    private function crearParticipanteSiAplica(int $idCuestionario, int $idSesion, ?string $nombre, ?string $email): void
    {
        if (!$email) return;

        $r = mysqli_query($this->Connection,
            "SELECT crearParticipante, creadoPor FROM cuestionarios WHERE idCuestionario=$idCuestionario");
        if (!$r) return;
        $form = $r->fetch_assoc();
        if (!$form || intval($form['crearParticipante']) !== 1) return;

        $idCliente = intval($form['creadoPor']);
        $emailEsc = mysqli_real_escape_string($this->Connection, $email);

        $exists = mysqli_query($this->Connection,
            "SELECT idUsuario FROM usuarios WHERE email='$emailEsc' AND tipoUsuario='PARTICIPANTE' AND creadoPorCliente=$idCliente AND bstate=1");
        if ($exists && $exists->num_rows > 0) {
            $row = $exists->fetch_assoc();
            $idUsuario = intval($row['idUsuario']);
        } else {
            // Si ese correo o nombre de usuario ya pertenece a otra cuenta, no se crea una segunda.
            $usuarioEsc = mysqli_real_escape_string($this->Connection, substr($email, 0, 50));
            $ocupado = mysqli_query($this->Connection,
                "SELECT idUsuario FROM usuarios WHERE bstate=1 AND (email='$emailEsc' OR usuario='$usuarioEsc') LIMIT 1");
            if (!$ocupado || $ocupado->num_rows > 0) return;

            $nomEsc = mysqli_real_escape_string($this->Connection, $nombre ?? '');
            $usuario = mysqli_real_escape_string($this->Connection, substr($email, 0, 50));
            $hash = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
            $date = date('Y-m-d H:i:s');

            mysqli_query($this->Connection,
                "INSERT INTO usuarios (usuario, nombre, apellidos, contrasena, email, profesion, tipoUsuario, imagen, estatus, contraro, token, fechaCreacion, fechaModificacion, observacion, bstate, creadoPorCliente)
                 VALUES ('$usuario', '$nomEsc', '', '$hash', '$emailEsc', '', 'PARTICIPANTE', '/administrador/Modules/ModulesImage/usuarios.png', 'ACTIVO', '', '', '$date', '$date', 'Creado al responder formulario $idCuestionario', 1, $idCliente)");
            $idUsuario = mysqli_insert_id($this->Connection);
        }

        if ($idUsuario > 0) {
            mysqli_query($this->Connection,
                "UPDATE cuestionario_respuestas_sesion SET idUsuarioParticipante=$idUsuario WHERE idSesion=$idSesion");
        }
    }

    // ================================================================
    //  FORM VISIT TRACKING
    // ================================================================

    public function registrarVisitaFormulario(int $idCuestionario): int
    {
        $ip = \authClientIp();
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $parsed = $this->parseUserAgent($ua);

        $this->open();
        $ipEsc = mysqli_real_escape_string($this->Connection, $ip);
        $uaEsc = mysqli_real_escape_string($this->Connection, substr($ua, 0, 1000));
        $nav = mysqli_real_escape_string($this->Connection, $parsed['navegador']);
        $disp = mysqli_real_escape_string($this->Connection, $parsed['dispositivo']);
        $so = mysqli_real_escape_string($this->Connection, $parsed['so']);
        $ref = !empty($_SERVER['HTTP_REFERER']) ? "'" . mysqli_real_escape_string($this->Connection, substr($_SERVER['HTTP_REFERER'], 0, 500)) . "'" : 'NULL';

        $r = mysqli_query($this->Connection,
            "INSERT INTO formulario_visitas (idCuestionario, ip, userAgent, navegador, dispositivo, sistemaOperativo, referrer)
             VALUES ($idCuestionario, '$ipEsc', '$uaEsc', '$nav', '$disp', '$so', $ref)");
        $id = $r ? mysqli_insert_id($this->Connection) : 0;
        $this->closet();
        return $id;
    }

    public function actualizarVisitaFormulario(int $idVisita, int $duracion, int $scrollMax): void
    {
        $duracion = max(0, min(86400, $duracion));
        $scrollMax = max(0, min(100, $scrollMax));
        $this->open();
        mysqli_query($this->Connection,
            "UPDATE formulario_visitas SET duracionSegundos=$duracion, scrollMaxPorcentaje=$scrollMax
              WHERE idVisita=$idVisita AND fechaVisita >= DATE_SUB(NOW(), INTERVAL 1 DAY)");
        $this->closet();
    }

    // ================================================================
    //  DASHBOARD / STATISTICS
    // ================================================================

    public function getDashboard(int $idUsuario): array
    {
        $this->open();
        $result = [];

        // Total forms
        $r = mysqli_query($this->Connection, "SELECT COUNT(*) as total FROM cuestionarios WHERE creadoPor=$idUsuario");
        $result['totalFormularios'] = $r ? intval($r->fetch_assoc()['total']) : 0;

        // Total visits across all forms
        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total, COUNT(DISTINCT fv.ip) as unicos
             FROM formulario_visitas fv
             JOIN cuestionarios c ON fv.idCuestionario = c.idCuestionario
             WHERE c.creadoPor = $idUsuario");
        $row = $r ? $r->fetch_assoc() : ['total' => 0, 'unicos' => 0];
        $result['totalVisitas'] = intval($row['total']);
        $result['visitantesUnicos'] = intval($row['unicos']);

        // Total responses
        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total
             FROM cuestionario_respuestas_sesion rs
             JOIN cuestionarios c ON rs.idCuestionario = c.idCuestionario
             WHERE c.creadoPor = $idUsuario");
        $result['totalRespuestas'] = $r ? intval($r->fetch_assoc()['total']) : 0;

        // Visits per day (last 30 days)
        $r = mysqli_query($this->Connection,
            "SELECT DATE(fv.fechaVisita) as fecha, COUNT(*) as visitas
             FROM formulario_visitas fv
             JOIN cuestionarios c ON fv.idCuestionario = c.idCuestionario
             WHERE c.creadoPor = $idUsuario AND fv.fechaVisita >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(fv.fechaVisita) ORDER BY fecha ASC");
        $result['visitasPorDia'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['visitasPorDia'][] = $row; }

        // Per-form stats
        $r = mysqli_query($this->Connection,
            "SELECT c.idCuestionario, c.titulo, c.estado, c.compartirToken, c.slug,
                    (SELECT COUNT(*) FROM formulario_visitas WHERE idCuestionario = c.idCuestionario) as visitas,
                    (SELECT COUNT(DISTINCT ip) FROM formulario_visitas WHERE idCuestionario = c.idCuestionario) as visitasUnicas,
                    (SELECT COUNT(*) FROM cuestionario_respuestas_sesion WHERE idCuestionario = c.idCuestionario) as respuestas
             FROM cuestionarios c WHERE c.creadoPor = $idUsuario ORDER BY visitas DESC");
        $result['formularios'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['formularios'][] = $row; }

        // Browsers
        $r = mysqli_query($this->Connection,
            "SELECT fv.navegador, COUNT(*) as total
             FROM formulario_visitas fv
             JOIN cuestionarios c ON fv.idCuestionario = c.idCuestionario
             WHERE c.creadoPor = $idUsuario
             GROUP BY fv.navegador ORDER BY total DESC");
        $result['navegadores'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['navegadores'][] = $row; }

        // Devices
        $r = mysqli_query($this->Connection,
            "SELECT fv.dispositivo, COUNT(*) as total
             FROM formulario_visitas fv
             JOIN cuestionarios c ON fv.idCuestionario = c.idCuestionario
             WHERE c.creadoPor = $idUsuario
             GROUP BY fv.dispositivo ORDER BY total DESC");
        $result['dispositivos'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['dispositivos'][] = $row; }

        $this->closet();
        return $result;
    }

    public function getEstadisticasFormulario(int $idCuestionario, int $idUsuario): ?array
    {
        $this->open();

        // Verify ownership
        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario, titulo, descripcion, estado, compartirToken, slug
             FROM cuestionarios WHERE idCuestionario=$idCuestionario AND creadoPor=$idUsuario");
        if (!$r || $r->num_rows === 0) { $this->closet(); return null; }
        $form = $r->fetch_assoc();

        // Visit stats
        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total, COUNT(DISTINCT ip) as unicos, AVG(duracionSegundos) as promDuracion
             FROM formulario_visitas WHERE idCuestionario=$idCuestionario");
        $form['visitaStats'] = $r ? $r->fetch_assoc() : [];

        // Recent visitors
        $r = mysqli_query($this->Connection,
            "SELECT ip, navegador, dispositivo, sistemaOperativo, duracionSegundos, scrollMaxPorcentaje, fechaVisita
             FROM formulario_visitas WHERE idCuestionario=$idCuestionario ORDER BY fechaVisita DESC LIMIT 50");
        $form['visitasRecientes'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['visitasRecientes'][] = $row; }

        // Response stats
        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total FROM cuestionario_respuestas_sesion WHERE idCuestionario=$idCuestionario");
        $form['totalRespuestas'] = $r ? intval($r->fetch_assoc()['total']) : 0;

        // Per-question stats
        $r = mysqli_query($this->Connection,
            "SELECT idPregunta, textoPregunta, orden FROM cuestionario_preguntas WHERE idCuestionario=$idCuestionario ORDER BY orden");
        $form['preguntas'] = [];
        if ($r) {
            while ($p = $r->fetch_assoc()) {
                $idP = intval($p['idPregunta']);
                $rOpc = mysqli_query($this->Connection,
                    "SELECT o.idOpcion, o.textoOpcion, o.esCorrecta,
                            (SELECT COUNT(*) FROM cuestionario_respuestas WHERE idOpcion = o.idOpcion) as selecciones
                     FROM cuestionario_opciones o WHERE o.idPregunta=$idP ORDER BY o.orden");
                $p['opciones'] = [];
                if ($rOpc) { while ($opc = $rOpc->fetch_assoc()) $p['opciones'][] = $opc; }
                $form['preguntas'][] = $p;
            }
        }

        $this->closet();
        return $form;
    }

    // ================================================================
    //  INDIVIDUAL RESPONSES (for reports)
    // ================================================================

    public function getRespuestasIndividuales(int $idCuestionario, int $idUsuario): array
    {
        $this->open();
        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario FROM cuestionarios WHERE idCuestionario=$idCuestionario AND creadoPor=$idUsuario");
        if (!$r || $r->num_rows === 0) { $this->closet(); return []; }

        $r = mysqli_query($this->Connection,
            "SELECT s.idSesion, s.nombreParticipante, s.emailParticipante, s.fechaInicio, s.fechaFin,
                    s.sexo, s.edad, s.idPais, s.idEstado, s.idMunicipio,
                    cp.nombre as paisNombre, ce.nombre as estadoNombre, cm.nombre as municipioNombre,
                    p.idPregunta, p.textoPregunta, p.orden,
                    o.textoOpcion, o.esCorrecta
             FROM cuestionario_respuestas_sesion s
             JOIN cuestionario_respuestas r ON r.idSesion = s.idSesion
             JOIN cuestionario_preguntas p ON p.idPregunta = r.idPregunta
             LEFT JOIN cuestionario_opciones o ON o.idOpcion = r.idOpcion
             LEFT JOIN cat_paises cp ON cp.idPais = s.idPais
             LEFT JOIN cat_estados ce ON ce.idEstado = s.idEstado
             LEFT JOIN cat_municipios cm ON cm.idMunicipio = s.idMunicipio
             WHERE s.idCuestionario = $idCuestionario
             ORDER BY s.idSesion DESC, p.orden ASC");

        $sesiones = [];
        if ($r) {
            while ($row = $r->fetch_assoc()) {
                $sid = intval($row['idSesion']);
                if (!isset($sesiones[$sid])) {
                    $sesiones[$sid] = [
                        'idSesion' => $sid,
                        'nombreParticipante' => $row['nombreParticipante'],
                        'emailParticipante' => $row['emailParticipante'],
                        'sexo' => $row['sexo'],
                        'edad' => $row['edad'] ? intval($row['edad']) : null,
                        'pais' => $row['paisNombre'],
                        'estado' => $row['estadoNombre'],
                        'municipio' => $row['municipioNombre'],
                        'fechaInicio' => $row['fechaInicio'],
                        'fechaFin' => $row['fechaFin'],
                        'respuestas' => [],
                    ];
                }
                $sesiones[$sid]['respuestas'][] = [
                    'idPregunta' => intval($row['idPregunta']),
                    'textoPregunta' => $row['textoPregunta'],
                    'orden' => intval($row['orden']),
                    'textoOpcion' => $row['textoOpcion'],
                    'esCorrecta' => $row['esCorrecta'],
                ];
            }
        }
        $this->closet();
        return array_values($sesiones);
    }

    // ================================================================
    //  ADMIN — ALL FORMS FROM ALL CLIENTS
    // ================================================================

    public function getTodosFormularios(): array
    {
        $this->open();
        $result = [];
        $r = mysqli_query($this->Connection,
            "SELECT c.idCuestionario, c.titulo, c.descripcion, c.estado, c.compartirToken, c.slug, c.fechaCreacion,
                    u.nombre as clienteNombre, u.apellidos as clienteApellidos, u.email as clienteEmail, u.idUsuario as idCliente,
                    (SELECT COUNT(*) FROM cuestionario_preguntas WHERE idCuestionario = c.idCuestionario) as totalPreguntas,
                    (SELECT COUNT(*) FROM cuestionario_respuestas_sesion WHERE idCuestionario = c.idCuestionario) as totalRespuestas,
                    (SELECT COUNT(*) FROM formulario_visitas WHERE idCuestionario = c.idCuestionario) as totalVisitas
             FROM cuestionarios c
             LEFT JOIN usuarios u ON c.creadoPor = u.idUsuario
             ORDER BY c.fechaCreacion DESC");
        if ($r) { while ($row = $r->fetch_assoc()) $result[] = $row; }
        $this->closet();
        return $result;
    }

    public function getEstadisticasFormularioAdmin(int $idCuestionario): ?array
    {
        $this->open();
        $r = mysqli_query($this->Connection,
            "SELECT c.idCuestionario, c.titulo, c.descripcion, c.estado, c.compartirToken, c.slug,
                    u.nombre as clienteNombre, u.apellidos as clienteApellidos
             FROM cuestionarios c
             LEFT JOIN usuarios u ON c.creadoPor = u.idUsuario
             WHERE c.idCuestionario=$idCuestionario");
        if (!$r || $r->num_rows === 0) { $this->closet(); return null; }
        $form = $r->fetch_assoc();

        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total, COUNT(DISTINCT ip) as unicos, AVG(duracionSegundos) as promDuracion
             FROM formulario_visitas WHERE idCuestionario=$idCuestionario");
        $form['visitaStats'] = $r ? $r->fetch_assoc() : [];

        $r = mysqli_query($this->Connection,
            "SELECT ip, navegador, dispositivo, sistemaOperativo, duracionSegundos, scrollMaxPorcentaje, fechaVisita
             FROM formulario_visitas WHERE idCuestionario=$idCuestionario ORDER BY fechaVisita DESC LIMIT 50");
        $form['visitasRecientes'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['visitasRecientes'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total FROM cuestionario_respuestas_sesion WHERE idCuestionario=$idCuestionario");
        $form['totalRespuestas'] = $r ? intval($r->fetch_assoc()['total']) : 0;

        $r = mysqli_query($this->Connection,
            "SELECT idPregunta, textoPregunta, orden FROM cuestionario_preguntas WHERE idCuestionario=$idCuestionario ORDER BY orden");
        $form['preguntas'] = [];
        if ($r) {
            while ($p = $r->fetch_assoc()) {
                $idP = intval($p['idPregunta']);
                $rOpc = mysqli_query($this->Connection,
                    "SELECT o.idOpcion, o.textoOpcion, o.esCorrecta,
                            (SELECT COUNT(*) FROM cuestionario_respuestas WHERE idOpcion = o.idOpcion) as selecciones
                     FROM cuestionario_opciones o WHERE o.idPregunta=$idP ORDER BY o.orden");
                $p['opciones'] = [];
                if ($rOpc) { while ($opc = $rOpc->fetch_assoc()) $p['opciones'][] = $opc; }
                $form['preguntas'][] = $p;
            }
        }

        $this->closet();
        return $form;
    }

    // ================================================================
    //  ANALYTICS — full data for charts
    // ================================================================

    public function getAnaliticaFormulario(int $idCuestionario, int $idUsuario): ?array
    {
        $this->open();

        $r = mysqli_query($this->Connection,
            "SELECT idCuestionario, titulo, descripcion, estado, compartirToken, slug, fechaCreacion
             FROM cuestionarios WHERE idCuestionario=$idCuestionario AND creadoPor=$idUsuario");
        if (!$r || $r->num_rows === 0) { $this->closet(); return null; }
        $form = $r->fetch_assoc();

        // 1. Per-question option distribution (pie/bar)
        $r = mysqli_query($this->Connection,
            "SELECT idPregunta, textoPregunta, orden FROM cuestionario_preguntas WHERE idCuestionario=$idCuestionario ORDER BY orden");
        $form['preguntas'] = [];
        if ($r) {
            while ($p = $r->fetch_assoc()) {
                $idP = intval($p['idPregunta']);
                $rOpc = mysqli_query($this->Connection,
                    "SELECT o.idOpcion, o.textoOpcion, o.esCorrecta,
                            (SELECT COUNT(*) FROM cuestionario_respuestas WHERE idOpcion = o.idOpcion) as selecciones
                     FROM cuestionario_opciones o WHERE o.idPregunta=$idP ORDER BY o.orden");
                $p['opciones'] = [];
                if ($rOpc) { while ($opc = $rOpc->fetch_assoc()) $p['opciones'][] = $opc; }
                $form['preguntas'][] = $p;
            }
        }

        // 2. Total responses
        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total FROM cuestionario_respuestas_sesion WHERE idCuestionario=$idCuestionario");
        $form['totalRespuestas'] = $r ? intval($r->fetch_assoc()['total']) : 0;

        // 3. Demographics — sexo
        $r = mysqli_query($this->Connection,
            "SELECT IFNULL(sexo,'Sin especificar') as sexo, COUNT(*) as total
             FROM cuestionario_respuestas_sesion WHERE idCuestionario=$idCuestionario GROUP BY sexo ORDER BY total DESC");
        $form['demografiaSexo'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['demografiaSexo'][] = $row; }

        // 4. Demographics — edad ranges
        $r = mysqli_query($this->Connection,
            "SELECT
                CASE
                    WHEN edad IS NULL THEN 'Sin especificar'
                    WHEN edad < 18 THEN 'Menor de 18'
                    WHEN edad BETWEEN 18 AND 24 THEN '18-24'
                    WHEN edad BETWEEN 25 AND 34 THEN '25-34'
                    WHEN edad BETWEEN 35 AND 44 THEN '35-44'
                    WHEN edad BETWEEN 45 AND 54 THEN '45-54'
                    ELSE '55+'
                END as rango, COUNT(*) as total
             FROM cuestionario_respuestas_sesion WHERE idCuestionario=$idCuestionario GROUP BY rango ORDER BY
                CASE rango
                    WHEN 'Menor de 18' THEN 1 WHEN '18-24' THEN 2 WHEN '25-34' THEN 3
                    WHEN '35-44' THEN 4 WHEN '45-54' THEN 5 WHEN '55+' THEN 6 ELSE 7
                END");
        $form['demografiaEdad'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['demografiaEdad'][] = $row; }

        // 5. Demographics — geography (top states)
        $r = mysqli_query($this->Connection,
            "SELECT IFNULL(ce.nombre,'Sin especificar') as estado, COUNT(*) as total
             FROM cuestionario_respuestas_sesion s
             LEFT JOIN cat_estados ce ON ce.idEstado = s.idEstado
             WHERE s.idCuestionario=$idCuestionario GROUP BY estado ORDER BY total DESC LIMIT 10");
        $form['demografiaGeografia'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['demografiaGeografia'][] = $row; }

        // 6. Temporal — responses per day (last 90 days)
        $r = mysqli_query($this->Connection,
            "SELECT DATE(fechaInicio) as fecha, COUNT(*) as total
             FROM cuestionario_respuestas_sesion
             WHERE idCuestionario=$idCuestionario AND fechaInicio >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
             GROUP BY DATE(fechaInicio) ORDER BY fecha");
        $form['temporalRespuestas'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['temporalRespuestas'][] = $row; }

        // 7. Temporal — visits per day (last 90 days)
        $r = mysqli_query($this->Connection,
            "SELECT DATE(fechaVisita) as fecha, COUNT(*) as total
             FROM formulario_visitas
             WHERE idCuestionario=$idCuestionario AND fechaVisita >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
             GROUP BY DATE(fechaVisita) ORDER BY fecha");
        $form['temporalVisitas'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['temporalVisitas'][] = $row; }

        // 8. Device breakdown
        $r = mysqli_query($this->Connection,
            "SELECT dispositivo, COUNT(*) as total FROM formulario_visitas WHERE idCuestionario=$idCuestionario GROUP BY dispositivo ORDER BY total DESC");
        $form['dispositivos'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['dispositivos'][] = $row; }

        // 9. Browser breakdown
        $r = mysqli_query($this->Connection,
            "SELECT navegador, COUNT(*) as total FROM formulario_visitas WHERE idCuestionario=$idCuestionario GROUP BY navegador ORDER BY total DESC");
        $form['navegadores'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['navegadores'][] = $row; }

        // 10. OS breakdown
        $r = mysqli_query($this->Connection,
            "SELECT sistemaOperativo, COUNT(*) as total FROM formulario_visitas WHERE idCuestionario=$idCuestionario GROUP BY sistemaOperativo ORDER BY total DESC");
        $form['sistemasOperativos'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['sistemasOperativos'][] = $row; }

        // 11. Funnel: total visits, unique visitors, total responses
        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as totalVisitas, COUNT(DISTINCT ip) as visitasUnicas, AVG(duracionSegundos) as promDuracion, AVG(scrollMaxPorcentaje) as promScroll
             FROM formulario_visitas WHERE idCuestionario=$idCuestionario");
        $form['funnel'] = $r ? $r->fetch_assoc() : [];
        $form['funnel']['totalRespuestas'] = $form['totalRespuestas'];

        // 12. Average completion time (seconds)
        $r = mysqli_query($this->Connection,
            "SELECT AVG(TIMESTAMPDIFF(SECOND, fechaInicio, fechaFin)) as promTiempo,
                    MIN(TIMESTAMPDIFF(SECOND, fechaInicio, fechaFin)) as minTiempo,
                    MAX(TIMESTAMPDIFF(SECOND, fechaInicio, fechaFin)) as maxTiempo
             FROM cuestionario_respuestas_sesion
             WHERE idCuestionario=$idCuestionario AND fechaFin IS NOT NULL AND fechaInicio IS NOT NULL");
        $form['tiempoCompletado'] = $r ? $r->fetch_assoc() : [];

        // 13. Responses per weekday
        $r = mysqli_query($this->Connection,
            "SELECT DAYOFWEEK(fechaInicio) as dia, COUNT(*) as total
             FROM cuestionario_respuestas_sesion WHERE idCuestionario=$idCuestionario
             GROUP BY DAYOFWEEK(fechaInicio) ORDER BY dia");
        $form['respuestasPorDia'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['respuestasPorDia'][] = $row; }

        // 14. Responses per hour
        $r = mysqli_query($this->Connection,
            "SELECT HOUR(fechaInicio) as hora, COUNT(*) as total
             FROM cuestionario_respuestas_sesion WHERE idCuestionario=$idCuestionario
             GROUP BY HOUR(fechaInicio) ORDER BY hora");
        $form['respuestasPorHora'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $form['respuestasPorHora'][] = $row; }

        $this->closet();
        return $form;
    }

    // ================================================================
    //  CATALOGS (public)
    // ================================================================

    public function getPaises(): array
    {
        $this->open();
        $result = [];
        $r = mysqli_query($this->Connection, "SELECT idPais, nombre FROM cat_paises WHERE bstate=1 ORDER BY nombre");
        if ($r) { while ($row = $r->fetch_assoc()) $result[] = $row; }
        $this->closet();
        return $result;
    }

    public function getEstados(int $idPais): array
    {
        $this->open();
        $result = [];
        $r = mysqli_query($this->Connection, "SELECT idEstado, nombre FROM cat_estados WHERE idPais=$idPais AND bstate=1 ORDER BY nombre");
        if ($r) { while ($row = $r->fetch_assoc()) $result[] = $row; }
        $this->closet();
        return $result;
    }

    public function getMunicipios(int $idEstado): array
    {
        $this->open();
        $result = [];
        $r = mysqli_query($this->Connection, "SELECT idMunicipio, nombre FROM cat_municipios WHERE idEstado=$idEstado AND bstate=1 ORDER BY nombre");
        if ($r) { while ($row = $r->fetch_assoc()) $result[] = $row; }
        $this->closet();
        return $result;
    }

    // ================================================================
    //  CREAR PARTICIPANTE TOGGLE
    // ================================================================

    public function actualizarCrearParticipante(int $idCuestionario, bool $valor, int $idUsuario): bool
    {
        $this->open();
        $v = $valor ? 1 : 0;
        $r = mysqli_query($this->Connection,
            "UPDATE cuestionarios SET crearParticipante=$v WHERE idCuestionario=$idCuestionario AND creadoPor=$idUsuario");
        $ok = $r && mysqli_affected_rows($this->Connection) >= 0;
        $this->closet();
        return $ok;
    }
}
