<?php

namespace administrador\Modules\ConfirmacionCorreo\Model\confirmacion;
    /*<Includes>*/
        include_once(__DIR__ . '/../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as Conection;
    /*<use>*/

    class confirmacion extends Conection{

        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/

        /*<Verificar Token>*/
        public function verificarToken($token){
            $JSON_RESULT = [];
            $JSON_RESULT['message'] = '';
            $JSON_RESULT['idUsuario'] = 0;
            $JSON_RESULT['estatus'] = '';

            // El token de confirmacion son 64 caracteres hexadecimales; cualquier otra cosa no existe.
            $token = is_string($token) ? trim($token) : '';
            if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
                $JSON_RESULT['message'] = "Good";
                $JSON_RESULT['error'] = "Token no válido o usuario no encontrado";
                return $JSON_RESULT;
            }

            $QuerySelect = 'SELECT idUsuario, estatus, nombre, apellidos, email
                            FROM usuarios
                            WHERE token = "'.$token.'"
                            AND bstate = 1';

            $this::open();
            if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                if ($resultQuery->num_rows > 0) {
                    $r = $resultQuery->fetch_array(MYSQLI_ASSOC);
                    $JSON_RESULT['message'] = "Good";
                    $JSON_RESULT['idUsuario'] = $r['idUsuario'];
                    $JSON_RESULT['estatus'] = $r['estatus'];
                    $JSON_RESULT['nombre'] = $r['nombre'];
                    $JSON_RESULT['apellidos'] = $r['apellidos'];
                    $JSON_RESULT['email'] = $r['email'];
                } else {
                    $JSON_RESULT['message'] = "Good";
                    $JSON_RESULT['idUsuario'] = 0;
                    $JSON_RESULT['error'] = "Token no válido o usuario no encontrado";
                }
            } else {
                $JSON_RESULT['message'] = "Bad";
                $JSON_RESULT['error'] = 'Error de base de datos';
            }
            $this::closet();

            return $JSON_RESULT;
        }
        /*</Verificar Token>*/

        /*<Confirmar Correo>*/
        public function confirmarCorreo($idUsuario, $estatusActual){
            $JSON_RESULT = [];
            $JSON_RESULT['message'] = '';

            // Si el estatus es PENDIENTE, actualizamos a CONFIRMADA
            if(strtoupper($estatusActual) === 'PENDIENTE'){
                $DATE = date('Y-m-d H:i:s');
                $IP = \authClientIp();
                $idUsuario = intval($idUsuario);

                $QueryUpdate = 'UPDATE usuarios
                                SET estatus = "CONFIRMADA",
                                    fechaModificacion = "'.$DATE.'",
                                    observacion = "[UPDATE Confirmación de correo '.$DATE.'] [IP: '.$IP.']"
                                WHERE idUsuario = '.$idUsuario;

                $this::open();
                if (mysqli_query($this->Connection, $QueryUpdate)) {
                    $JSON_RESULT['message'] = "Good";
                    $JSON_RESULT['confirmado'] = true;
                    $JSON_RESULT['nuevoEstatus'] = "CONFIRMADA";
                    $JSON_RESULT['texto'] = "¡Correo confirmado con éxito! El siguiente paso es iniciar sesión y completar tu registro.";
                } else {
                    $JSON_RESULT['message'] = "Bad";
                    $JSON_RESULT['error'] = 'Error de base de datos';
                }
                $this::closet();
            } else if(strtoupper($estatusActual) === 'INACTIVO'){
                $JSON_RESULT['message'] = "Good";
                $JSON_RESULT['confirmado'] = false;
                $JSON_RESULT['texto'] = "Usuario inactivo. Por favor contacta al administrador para reactivar tu cuenta.";
            } else {
                // Ya está confirmado, verificado o activo
                $JSON_RESULT['message'] = "Good";
                $JSON_RESULT['confirmado'] = true;
                $JSON_RESULT['nuevoEstatus'] = $estatusActual;
                $JSON_RESULT['texto'] = "¡Tu correo ya fue confirmado anteriormente! Puedes iniciar sesión.";
            }

            return $JSON_RESULT;
        }
        /*</Confirmar Correo>*/
    }
