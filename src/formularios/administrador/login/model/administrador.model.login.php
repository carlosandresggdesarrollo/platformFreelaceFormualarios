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
                    $JSON_RESULT['existe']          = "NO EXISTE";   
                /*</Variables> */
                /*<Query> */
                    $QuerySelect = '  SELECT 
                                                *                                            
                                        FROM usuarios usu
                                            WHERE 
                                                    usu.bstate  = 1  AND
                                                    usu.tipoUsuario  = "ADMINISTRADOR"  AND
                                                    usu.usuario = "'.$user.'"
                                                    LIMIT 1; ';
                /*</Query> */
                $JSON_RESULT["QuerySelect"]          = $QuerySelect;
                $this::open();            
                    if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                        if ($resultQuery->num_rows > 0) {
                            $JSON_RESULT['message'] = "Good";
                            $Count = 0;
                            while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                if( password_verify($password, $r['contrasena'] )){
                                    $Count++;
                                    $JSON_RESULT["existe"]          = "EXISTE";
                                    $JSON_RESULT["idUsuario"]       = $r['idUsuario'];      
                                    $JSON_RESULT["tipoUsuario"]     = $r['tipoUsuario'];                                   
                                    $JSON_RESULT["estatus"]         = $r['estatus'];    

                                    session_start();
                                    $_SESSION["administrador-tipoUsuario"]     = $r['tipoUsuario'];    
                                    $_SESSION["administrador-nombre"]          = $r['nombre'];   
                                    $_SESSION["administrador-imagen"]          = $r['imagen'];   
                                    $_SESSION["administrador-idUsuario"]       = $r['idUsuario'];   
                                    $_SESSION["administrador-estatus"]         = $r['estatus'];   
                                }
                            }
                            if($Count == 0){
                                $JSON_RESULT['existe']          = "NO EXISTE";                               
                            }
                        }else{
                            $JSON_RESULT['message'] = "Good";
                            $JSON_RESULT['userValitor'] = "Not exists";
                        }
                    }else{
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }
                $this::closet();
                return $JSON_RESULT;
            }
        /*</Method VALIDATORLOGIN>*/
      

        /*<consultarRelacionUsuarios>*/
            public function consultarRelacionUsuarios($sesion){

                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['existe']          = "NO EXISTE";
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['ID_SESSION']      = 0;
                /*</Variables> */

                /*<Query> */
                    $querySelect = 'SELECT * FROM  sesion 
                                        WHERE 
                                                sesion = "'.$sesion.' " AND 
                                                bstate = 1;';
                /*</Query> */

                $JSON_RESULT['querySelect']     = $querySelect;
                
                $this->open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                        if ($resultQuery->num_rows > 0) {
                            /*<Captura>*/
                                while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    $JSON_RESULT['ID_SESSION']     = $r['idSesion'];
                                }
                                $JSON_RESULT['existe']     = "EXISTE";
                            /*</Captura>*/
                        }else{
                            $JSON_RESULT['existe']     = "NO EXISTE";
                        }
                        /*<Respuesta>*/
                            $JSON_RESULT['message'] = "Good";   
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";                           
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this->closet();

                return $JSON_RESULT;

            }
        /*</consultarRelacionUsuarios>*/

        /*<InsertarRelacionUsuarios>*/
            public function InsertarRelacionUsuarios(
                $idSesion,
                $idUsuario
            ){
                /*<Variables> */

                    /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables> */
                if($idSesion > 0 &&  $idUsuario > 0){    
                    /*<Query>*/
                        $queryInsert = 'INSERT INTO relauxs ( 
                                                idSesion, 
                                                idUsuario,
                                                fechaCreacion, 
                                                fechaModificacion,
                                                observacion,
                                                bstate
                                                ) VALUES( 
                                                    '.$idSesion.',                                           
                                                    '.$idUsuario.',                   
                                                    "'.$DATE.'",
                                                    "'.$DATE.'",
                                                    " [ INSERT '.$DATE.' ], [ idUser '.$idUser.' ] ",
                                                    1
                                                );';
                    /*</Query>*/
                    $JSON_RESULT['queryInsert'] = $queryInsert;
                    $this->open();        
                        if ( mysqli_query( $this->Connection, $queryInsert)) {
                            $JSON_RESULT['message']     = "Good";                           
                        } else {
                            $JSON_RESULT['message']     = "Bad";                        
                            $JSON_RESULT['error']       = "Error: <br>" . mysqli_error($this->Connection);
                        }        
                    $this->closet(); 
                }else{
                    $JSON_RESULT['message']     = "NO HAY DATOS";       
                    $JSON_RESULT['idSesion']    = $idSesion;
                    $JSON_RESULT['idUsuario']   = $idUsuario;
                } 
                return $JSON_RESULT;
                
            }
        /*</InsertarRelacionUsuarios>*/
 
        /*<ValidacionEstatus>*/
            public function ValidacionEstatus($idUsuario){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['existe']          = "NO EXISTE";
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables> */

                /*<Query> */
                    $querySelect = 'SELECT * FROM  usuarios 
                                        WHERE 
                                                idUsuario   = '.$idUsuario .'   AND 
                                                estatus     = "PENDIENTE"       AND
                                                bstate      = 1;';
                /*</Query> */

                $JSON_RESULT['querySelect']     = $querySelect;
                
                 $this->open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                        if ($resultQuery->num_rows > 0) {
                            /*<Captura>*/
                                $JSON_RESULT['existe']     = "EXISTE";
                            /*</Captura>*/
                        }else{
                            $JSON_RESULT['existe']     = "NO EXISTE";
                        }
                        /*<Respuesta>*/
                            $JSON_RESULT['message'] = "Good";   
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";                           
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this->closet();
                return $JSON_RESULT;

            }
        /*</ValidacionEstatus>*/

        /*<closeSession>*/
            public function closeSession($sesion){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['existe']          = "NO EXISTE";   
                /*</Variables> */

                /*<CONSULTAR SESSION>*/
                    /*<Query> */
                        $querySelect = 'SELECT * FROM  sesion 
                                            WHERE 
                                                    sesion = "'.$sesion.'" AND 
                                                    bstate = 1;';
                    /*</Query> */

                    $JSON_RESULT['querySelect']     = $querySelect;
                    
                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    $JSON_RESULT['information']     = "EXISTE LA SESION";
                                    while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                        $JSON_RESULT['ID_SESSION'] = $r['idSesion'];
                                    }
                                /*</Captura>*/
                            }else{
                                $JSON_RESULT['information']     = "NO EXISTE LA SESION";
                            }
                            /*<Respuesta>*/
                                $JSON_RESULT['message'] = "Good";   
                            /*</Respuesta>*/
                        } else {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Bad";                           
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();
                /*</CONSULTAR SESSION>*/
                if($JSON_RESULT['information'] == "EXISTE LA SESION"){
                    /*<Variables> */
                        $DATE                       = date('Y-m-d h:i:s');
                    /*</Variables> */

                    /*<Query> */
                        $queryUpdate = 'UPDATE sesion SET 
                                                        bstate                   = 0,
                                                        fechaModificacion        = "'.$DATE.'",
                                                        observacion              = "ELIMINACION DE LA relauxs"    
                                                        WHERE idSesion  = '.$JSON_RESULT['ID_SESSION'].' ;';
                    /*</Query> */

                    $JSON_RESULT['queryUpdate']     = $queryUpdate;
                    
                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $queryUpdate)) {                       
                            /*<Respuesta>*/
                                $JSON_RESULT['message'] = "Good";   
                            /*</Respuesta>*/
                        } else {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Bad";                           
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();    
                    
                    return $JSON_RESULT;

                }else{
                    $JSON_RESULT['message']         = "NO EXISTE LA SESION";                           
                    $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                }
                return $JSON_RESULT;
            }
        /*<closeSession>*/



        
       
    }