<?php
namespace  administrador\Login\Model\Login;
    /*<Includes>*/
        include_once('../../Modules/ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/
    
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as ConectionLogin;
    /*<use>*/

    class Login extends ConectionLogin{
        
        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/

        /*<Method VALIDATORLOGIN>*/
            public function validatorLogin($user, $password){
                 /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables> */
                /*<Query> */
                    $QuerySelect = '  SELECT 
                                    idUsuario, 
                                    password, 
                                    usuario, 
                                    nombre, 
                                    email, 
                                    tipoUsuario, 
                                    imagen 
                            FROM usuarios
                                WHERE 
                                        bstate = 1  AND                                
                                        usuario = "'.$user.'" 
                                        LIMIT 1; ';
                /*</Query> */
                $this::open();            
                    if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                        if ($resultQuery->num_rows > 0) {
                            $JSON_RESULT['message'] = "Good";
                            $Count = 0;
                            while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                if( password_verify($password, $r['password'] )){
                                    $Count++;

                                    $JSON_RESULT["userValitor"]     = "correct_user_door2door";
                                    $JSON_RESULT["usuario"]         = $r['usuario'];
                                    $JSON_RESULT["idUsuario"]       = $r['idUsuario'];
                                    $JSON_RESULT["tipoUsuario"]     = $r['tipoUsuario'];
                                    $JSON_RESULT["nombre"]          = $r['nombre'];
                                    $JSON_RESULT["email"]           = $r['email'];
                                    $JSON_RESULT["imagen"]          = $r['imagen'];

                                    $this->session($JSON_RESULT);
                                }
                            }
                            if($Count == 0){
                                $JSON_RESULT['userValitor'] = "Not exists";
                                $JSON_RESULT["testeo"]          = $QuerySelect;
                            }
                        }else{
                            $JSON_RESULT['message'] = "Good";
                            $JSON_RESULT['userValitor'] = "Not exists";
                        }
                    }else{
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";
                            $JSON_RESULT['querySelect']     = $QuerySelect;
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }
                $this::closet();
                return $JSON_RESULT;
            }
        /*</Method VALIDATORLOGIN>*/
      

        /*<Method Session>*/
            private function session($JSON_RESULT){
                $ip         =  isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']; 
                $session    = 'Ip:'.$ip.'&usuario:'.$Data["usuario"].'&tipoUsuario:'.$Data["tipoUsuario"];
                $DATE       = date('Y-m-d h:i:s');
                $Query = 'INSERT INTO sesiones ( 
                                        idUsuarios, 
                                        sesion,                     
                                        ip, 
                                        fechaEntrada,
                                        fechaCreacion,
                                        fechaModificacion,
                                        observacion,
                                        bstate
                                        ) VALUES( 
                                            "'.$JSON_RESULT["idUsuario"].'",
                                            "'.$session.'",
                                            "'.$ip.'",
                                            "'.$DATE.'",
                                            "'.$DATE.'",
                                            "'.$DATE.'",
                                            " [ INSERT '.$DATE.' ], [ login ] ",
                                            1
                                        );';
                    
                $this::open(); 
                    if (mysqli_query($this->Connection, $Query)) {
                        
                    }        
                $this::closet();
                // Creacion de sessiones
                session_start();
                    $_SESSION["idUser-administrador"]    = $JSON_RESULT["idUsuario"];
                    $_SESSION["user-administrador"]      = $JSON_RESULT["usuario"];
                    $_SESSION["name-administrador"]      = $JSON_RESULT["nombre"];
                    $_SESSION["email-administrador"]     = $JSON_RESULT["email"];
                    $_SESSION["typeUser-administrador"]  = $JSON_RESULT["tipoUsuario"];
                    $_SESSION["imagen-administrador"]    = $JSON_RESULT["imagen"];
                    $_SESSION["session-administrador"]   = $session;

                    
                
            }
    
        /*<Method Session>*/

        /*<Methid closeSession>*/
            public function closeSession($idUser){

                $RESULT = [];
                $RESULT['message'] = '';
                $DATE       = date('Y-m-d h:i:s');
                
                if($idUser > 0){
                    /*<Consulta>*/
                    $idSesiones = 0;
                    $QuerySelect = 'SELECT * FROM sesiones WHERE idUsuarios  = '.$idUser.' ORDER BY idSesiones DESC  LIMIT 1;';
                    $this::open();            
                        if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    $idSesiones = $r['idSesiones'];
                                }
                            }
                        }else{
                            $RESULT['message'] =  'bad';
                            $RESULT['message'] =  $QuerySelect;
                            return $RESULT;
                        }
                    $this::closet();
                    /*</COnsulta>*/

                    /*<Actualizar la salida>*/
                        $QueryUpdate =    'UPDATE  sesiones
                                                    SET     fechaSalida         = "'.$DATE.'",
                                                            fechaModificacion   = "'.$DATE.'",
                                                            observacion         = " [ UPDATE '.$UPDATE.' ], [ idUser '.$idUser.' ] "
                                                        WHERE idSesiones        = '.$idSesiones.';';
                        $this::open(); 
                            if (mysqli_query($this->Connection, $QueryUpdate)) {
                                $RESULT['message'] =  'Good';
                            }        
                        $this::closet();
                        return $RESULT;
                    /*</Actualizar la salida>*/
                }else{
                    $RESULT['message'] =  'No ha id ';
                    $RESULT['idISuer'] =  $idISuer;
                    return $RESULT;
                }
                return $RESULT;
            }
        /*</Methid closeSession>*/

        
       
    }