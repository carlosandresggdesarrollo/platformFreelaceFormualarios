<?php

namespace administrador\Modules\ModuleAnalytics\Model;

include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');

use administrador\Modules\ModulePugins\Conection\Conection;

class AnalyticsModel extends Conection
{
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

    public function registrarVisita(string $pagina, ?string $referrer, ?string $idioma, ?string $resolucion): array
    {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_CLIENT_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        if (strpos($ip, ',') !== false) $ip = trim(explode(',', $ip)[0]);
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $parsed = $this->parseUserAgent($ua);

        $this->open();
        $pagina = mysqli_real_escape_string($this->Connection, $pagina);
        $ip = mysqli_real_escape_string($this->Connection, $ip);
        $uaEsc = mysqli_real_escape_string($this->Connection, substr($ua, 0, 1000));
        $nav = mysqli_real_escape_string($this->Connection, $parsed['navegador']);
        $disp = mysqli_real_escape_string($this->Connection, $parsed['dispositivo']);
        $so = mysqli_real_escape_string($this->Connection, $parsed['so']);
        $ref = $referrer ? "'" . mysqli_real_escape_string($this->Connection, substr($referrer, 0, 500)) . "'" : 'NULL';
        $idi = $idioma ? "'" . mysqli_real_escape_string($this->Connection, $idioma) . "'" : 'NULL';
        $res = $resolucion ? "'" . mysqli_real_escape_string($this->Connection, $resolucion) . "'" : 'NULL';

        $r = mysqli_query($this->Connection,
            "INSERT INTO analytics_visitas (pagina, ip, userAgent, navegador, dispositivo, sistemaOperativo, referrer, idioma, resolucionPantalla)
             VALUES ('$pagina', '$ip', '$uaEsc', '$nav', '$disp', '$so', $ref, $idi, $res)");
        $id = $r ? mysqli_insert_id($this->Connection) : 0;
        $this->closet();
        return ['idVisita' => $id];
    }

    public function actualizarVisita(int $idVisita, int $duracion, int $scrollMax): void
    {
        $this->open();
        mysqli_query($this->Connection,
            "UPDATE analytics_visitas SET duracionSegundos=$duracion, scrollMaxPorcentaje=$scrollMax WHERE idVisita=$idVisita");
        $this->closet();
    }

    public function registrarEvento(int $idVisita, string $tipo, ?string $detalle, int $valor = 0): void
    {
        $this->open();
        $tipo = mysqli_real_escape_string($this->Connection, $tipo);
        $det = $detalle ? "'" . mysqli_real_escape_string($this->Connection, substr($detalle, 0, 500)) . "'" : 'NULL';
        mysqli_query($this->Connection,
            "INSERT INTO analytics_eventos (idVisita, tipoEvento, detalle, valor)
             VALUES ($idVisita, '$tipo', $det, $valor)");
        $this->closet();
    }

    public function registrarEventosBatch(int $idVisita, array $eventos): void
    {
        if (empty($eventos)) return;
        $this->open();
        foreach ($eventos as $ev) {
            $tipo = mysqli_real_escape_string($this->Connection, $ev['tipo'] ?? '');
            $det = !empty($ev['detalle']) ? "'" . mysqli_real_escape_string($this->Connection, substr($ev['detalle'], 0, 500)) . "'" : 'NULL';
            $val = intval($ev['valor'] ?? 0);
            mysqli_query($this->Connection,
                "INSERT INTO analytics_eventos (idVisita, tipoEvento, detalle, valor) VALUES ($idVisita, '$tipo', $det, $val)");
        }
        $this->closet();
    }

    // ================================================================
    //  ESTADISTICAS (admin)
    // ================================================================

    public function getResumen(string $desde, string $hasta): array
    {
        $this->open();
        $desde = mysqli_real_escape_string($this->Connection, $desde);
        $hasta = mysqli_real_escape_string($this->Connection, $hasta);

        $result = [];

        $r = mysqli_query($this->Connection,
            "SELECT COUNT(*) as total, COUNT(DISTINCT ip) as unicos, AVG(duracionSegundos) as promDuracion, AVG(scrollMaxPorcentaje) as promScroll
             FROM analytics_visitas WHERE fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'");
        $result['resumen'] = $r ? $r->fetch_assoc() : [];

        $r = mysqli_query($this->Connection,
            "SELECT DATE(fechaVisita) as fecha, COUNT(*) as visitas, COUNT(DISTINCT ip) as unicos
             FROM analytics_visitas WHERE fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY DATE(fechaVisita) ORDER BY fecha ASC");
        $result['porDia'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['porDia'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT pagina, COUNT(*) as visitas, COUNT(DISTINCT ip) as unicos
             FROM analytics_visitas WHERE fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY pagina ORDER BY visitas DESC LIMIT 20");
        $result['porPagina'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['porPagina'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT navegador, COUNT(*) as total
             FROM analytics_visitas WHERE fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY navegador ORDER BY total DESC");
        $result['navegadores'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['navegadores'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT dispositivo, COUNT(*) as total
             FROM analytics_visitas WHERE fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY dispositivo ORDER BY total DESC");
        $result['dispositivos'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['dispositivos'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT sistemaOperativo, COUNT(*) as total
             FROM analytics_visitas WHERE fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY sistemaOperativo ORDER BY total DESC");
        $result['sistemas'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['sistemas'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT e.detalle as seccion, COUNT(*) as vistas
             FROM analytics_eventos e
             JOIN analytics_visitas v ON e.idVisita = v.idVisita
             WHERE e.tipoEvento = 'seccion_vista'
               AND v.fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY e.detalle ORDER BY vistas DESC LIMIT 20");
        $result['secciones'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['secciones'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT e.detalle as enlace, COUNT(*) as clicks
             FROM analytics_eventos e
             JOIN analytics_visitas v ON e.idVisita = v.idVisita
             WHERE e.tipoEvento = 'click'
               AND v.fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY e.detalle ORDER BY clicks DESC LIMIT 20");
        $result['clicks'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['clicks'][] = $row; }

        $r = mysqli_query($this->Connection,
            "SELECT HOUR(fechaVisita) as hora, COUNT(*) as visitas
             FROM analytics_visitas WHERE fechaVisita BETWEEN '$desde 00:00:00' AND '$hasta 23:59:59'
             GROUP BY HOUR(fechaVisita) ORDER BY hora ASC");
        $result['porHora'] = [];
        if ($r) { while ($row = $r->fetch_assoc()) $result['porHora'][] = $row; }

        $this->closet();
        return $result;
    }

    public function getVisitasRecientes(int $limit = 50, int $offset = 0): array
    {
        $this->open();
        $result = ['visitas' => [], 'total' => 0];

        $r = mysqli_query($this->Connection, "SELECT COUNT(*) as total FROM analytics_visitas");
        if ($r) { $result['total'] = intval($r->fetch_assoc()['total']); }

        $r = mysqli_query($this->Connection,
            "SELECT idVisita, pagina, ip, navegador, dispositivo, sistemaOperativo, referrer, idioma, resolucionPantalla, duracionSegundos, scrollMaxPorcentaje, fechaVisita
             FROM analytics_visitas ORDER BY fechaVisita DESC LIMIT $limit OFFSET $offset");
        if ($r) { while ($row = $r->fetch_assoc()) $result['visitas'][] = $row; }

        $this->closet();
        return $result;
    }

    public function getDetalleVisita(int $id): array
    {
        $this->open();
        $result = ['visita' => null, 'eventos' => []];

        $r = mysqli_query($this->Connection, "SELECT * FROM analytics_visitas WHERE idVisita=$id");
        if ($r && $r->num_rows > 0) $result['visita'] = $r->fetch_assoc();

        $r = mysqli_query($this->Connection,
            "SELECT tipoEvento, detalle, valor, fechaEvento FROM analytics_eventos WHERE idVisita=$id ORDER BY fechaEvento ASC");
        if ($r) { while ($row = $r->fetch_assoc()) $result['eventos'][] = $row; }

        $this->closet();
        return $result;
    }
}
