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

        $nombreArchivo = 'form_' . $tipo . '_' . date('YmdHis') . '_' . mt_rand(1000, 9999) . '.' . $ext;
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
                $sets[] = "$col = " . intval($val);
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
        $titulo = mysqli_real_escape_string($this->Connection, $form['titulo'] ?? 'Sin titulo');
        $desc   = mysqli_real_escape_string($this->Connection, $form['descripcion'] ?? '');
        $token  = $this->generarToken();
        $slug   = mysqli_real_escape_string($this->Connection, $this->generarSlug($form['titulo'] ?? 'sin-titulo'));

        $r = mysqli_query($this->Connection,
            "INSERT INTO cuestionarios (titulo, descripcion, estado, compartirToken, slug, creadoPor)
             VALUES ('$titulo', '$desc', 'borrador', '$token', '$slug', $idUsuario)");
        $idCuestionario = $r ? mysqli_insert_id($this->Connection) : 0;

        if ($idCuestionario <= 0) {
            $this->closet();
            return ['success' => false, 'error' => 'No se pudo crear el formulario'];
        }

        $preguntas = $form['preguntas'] ?? [];
        foreach ($preguntas as $i => $preg) {
            $textoPregunta = mysqli_real_escape_string($this->Connection, $preg['textoPregunta'] ?? '');
            $orden = $i + 1;
            mysqli_query($this->Connection,
                "INSERT INTO cuestionario_preguntas (idCuestionario, textoPregunta, orden)
                 VALUES ($idCuestionario, '$textoPregunta', $orden)");
            $idPregunta = mysqli_insert_id($this->Connection);

            $opciones = $preg['opciones'] ?? [];
            foreach ($opciones as $j => $opc) {
                $textoOpc  = mysqli_real_escape_string($this->Connection, $opc['texto'] ?? '');
                $correcta  = !empty($opc['esCorrecta']) ? 1 : 0;
                mysqli_query($this->Connection,
                    "INSERT INTO cuestionario_opciones (idPregunta, textoOpcion, esCorrecta, orden)
                     VALUES ($idPregunta, '$textoOpc', $correcta, $j)");
            }
        }

        $sets = [];
        if (!empty($form['tema'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['tema']);
            $sets[] = "tema='$v'";
        }
        if (!empty($form['colorPrimario'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['colorPrimario']);
            $sets[] = "colorPrimario='$v'";
        }
        if (!empty($form['colorFondo'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['colorFondo']);
            $sets[] = "colorFondo='$v'";
        }
        if (!empty($form['imagenFondo'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['imagenFondo']);
            $sets[] = "imagenFondo='$v'";
        }
        if (!empty($form['musicaUrl'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['musicaUrl']);
            $sets[] = "musicaUrl='$v'";
        }
        if (!empty($form['musicaTipo'])) {
            $v = mysqli_real_escape_string($this->Connection, $form['musicaTipo']);
            $sets[] = "musicaTipo='$v'";
        }
        if (isset($form['opacidadFondo'])) {
            $v = intval($form['opacidadFondo']);
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

    public function guardarRespuestas(int $idCuestionario, ?string $nombre, ?string $email, array $respuestas, array $demograficos = []): array
    {
        $this->open();
        $nom = $nombre ? "'" . mysqli_real_escape_string($this->Connection, $nombre) . "'" : 'NULL';
        $ema = $email ? "'" . mysqli_real_escape_string($this->Connection, $email) . "'" : 'NULL';
        $sexo = !empty($demograficos['sexo']) ? "'" . mysqli_real_escape_string($this->Connection, $demograficos['sexo']) . "'" : 'NULL';
        $edad = !empty($demograficos['edad']) ? intval($demograficos['edad']) : 'NULL';
        $idPais = !empty($demograficos['idPais']) ? intval($demograficos['idPais']) : 'NULL';
        $idEstado = !empty($demograficos['idEstado']) ? intval($demograficos['idEstado']) : 'NULL';
        $idMunicipio = !empty($demograficos['idMunicipio']) ? intval($demograficos['idMunicipio']) : 'NULL';

        mysqli_query($this->Connection,
            "INSERT INTO cuestionario_respuestas_sesion (idCuestionario, nombreParticipante, emailParticipante, sexo, edad, idPais, idEstado, idMunicipio, fechaFin)
             VALUES ($idCuestionario, $nom, $ema, $sexo, $edad, $idPais, $idEstado, $idMunicipio, NOW())");
        $idSesion = mysqli_insert_id($this->Connection);

        $correctas = 0;
        $totalPreguntas = 0;
        foreach ($respuestas as $idPregunta => $idOpcion) {
            $idPregunta = intval($idPregunta);
            $idOpcion = intval($idOpcion);
            mysqli_query($this->Connection,
                "INSERT INTO cuestionario_respuestas (idSesion, idPregunta, idOpcion) VALUES ($idSesion, $idPregunta, $idOpcion)");

            $rCheck = mysqli_query($this->Connection, "SELECT esCorrecta FROM cuestionario_opciones WHERE idOpcion=$idOpcion");
            if ($rCheck && $row = $rCheck->fetch_assoc()) {
                $totalPreguntas++;
                if (intval($row['esCorrecta']) === 1) $correctas++;
            }
        }

        $this->crearParticipanteSiAplica($idCuestionario, $idSesion, $nombre, $email);

        $this->closet();
        return ['idSesion' => $idSesion, 'correctas' => $correctas, 'total' => $totalPreguntas];
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
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_CLIENT_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        if (strpos($ip, ',') !== false) $ip = trim(explode(',', $ip)[0]);
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
        $this->open();
        mysqli_query($this->Connection,
            "UPDATE formulario_visitas SET duracionSegundos=$duracion, scrollMaxPorcentaje=$scrollMax WHERE idVisita=$idVisita");
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
