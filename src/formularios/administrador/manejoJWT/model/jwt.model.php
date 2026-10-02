<?php
include_once('../../Modules/ModulePugins/administrador.Cofiguration.Conection.php');
/*<use>*/
    use  administrador\Modules\ModulePugins\Conection\Conection as Conection;
/*<use>*/

class JWTModel extends Conection {
    private $conn;
    
    public function __construct() {
        $host       = $this->Server ;
        $dbname     = $this->Database ;
        $username   = $this->User;
        $password   = $this->Password ;
        
        try {
            $this->conn = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            throw new Exception("Error de conexión: " . $e->getMessage());
        }
    }
    
    public function validarCredenciales($usuario, $password) {
        // Permitir login para usuarios ACTIVO, CONFIRMADA y PENDIENTE
        $sql = "SELECT idUsuario, nombre, apellidos, usuario, contrasena, tipoUsuario, estatus, imagen, email, COALESCE(requiereCambioPass, 0) as requiereCambioPass
                FROM usuarios
                WHERE usuario = :usuario AND bstate = 1
                AND estatus IN ('ACTIVO', 'CONFIRMADA', 'PENDIENTE')";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':usuario' => $usuario]);
        $row = $stmt->fetch();

        if (!$row) {
            return ['valid' => false];
        }

        // Verificar password
        if (!password_verify($password, $row['contrasena'])) {
            return ['valid' => false];
        }

        return [
            'valid' => true,
            'idUsuario' => $row['idUsuario'],
            'nombre' => $row['nombre'] . ' ' . $row['apellidos'],
            'tipoUsuario' => $row['tipoUsuario'],
            'estatus' => $row['estatus'],
            'imagen' => $row['imagen'],
            'email' => $row['email'] ?? '',
            'requiereCambioPass' => intval($row['requiereCambioPass'])
        ];
    }
    
    public function crearSesion($idUsuario, $ip, $navegador) {
        $sql = "INSERT INTO sesiones (id_usuario, ip, navegador, fecha_creacion, activa) 
                VALUES (:idUsuario, :ip, :navegador, NOW(), 1)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':idUsuario' => $idUsuario,
            ':ip' => $ip,
            ':navegador' => $navegador
        ]);
        
        return [
            'success' => true,
            'idSesion' => $this->conn->lastInsertId()
        ];
    }
    
    public function guardarRefreshToken($idSesion, $token) {
        $sql = "INSERT INTO refresh_tokens (id_sesion, token, fecha_expiracion, revocado) 
                VALUES (:idSesion, :token, DATE_ADD(NOW(), INTERVAL 7 DAY), 0)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':idSesion' => $idSesion,
            ':token' => $token
        ]);
        
        return true;
    }
    
    public function validarRefreshToken($idSesion, $token) {
        $sql = "SELECT id FROM refresh_tokens 
                WHERE id_sesion = :idSesion 
                AND token = :token 
                AND revocado = 0 
                AND fecha_expiracion > NOW()";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':idSesion' => $idSesion,
            ':token' => $token
        ]);
        
        return $stmt->fetch() !== false;
    }
    
    public function revocarRefreshToken($idSesion) {
        $sql = "UPDATE refresh_tokens SET revocado = 1 WHERE id_sesion = :idSesion";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':idSesion' => $idSesion]);
        
        return true;
    }
    
    public function obtenerDatosUsuario($idUsuario) {
        $sql = "SELECT 
                    idUsuario, 
                    nombre, 
                    apellidos,
                    CONCAT(nombre, ' ', apellidos) as nombreCompleto,
                    usuario, 
                    email,
                    tipoUsuario,
                    imagen,
                    estatus
                FROM usuarios 
                WHERE idUsuario = :idUsuario AND bstate = 1 AND estatus = 'activo'";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':idUsuario' => $idUsuario]);
        
        return $stmt->fetch();
    }
    
    public function verificarUsuarioActivo($idUsuario) {
        $sql = "SELECT idUsuario FROM usuarios 
                WHERE idUsuario = :idUsuario AND bstate = 1 AND estatus = 'activo'";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':idUsuario' => $idUsuario]);
        
        return $stmt->fetch() !== false;
    }
    
    public function cerrarSesion($idSesion) {
        $sql = "UPDATE sesiones SET activa = 0, fecha_cierre = NOW() WHERE id = :idSesion";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':idSesion' => $idSesion]);
        
        return true;
    }
    
    public function limpiarTokensExpirados() {
        $sql = "DELETE FROM refresh_tokens WHERE fecha_expiracion < NOW() OR revocado = 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        
        return $stmt->rowCount();
    }
    
    // Actualizar token en tabla usuarios (opcional, para compatibilidad)
    public function actualizarTokenUsuario($idUsuario, $token) {
        $sql = "UPDATE usuarios SET token = :token, fechaModificacion = NOW() 
                WHERE idUsuario = :idUsuario";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':token' => $token,
            ':idUsuario' => $idUsuario
        ]);
        
        return true;
    }
}