<?php
namespace  administrador\Main\Model\Session;
    /*<Includes>*/
        include_once('../../Modules/ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/
    
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as ConectionLogin;
    /*<use>*/

    class Session extends ConectionLogin{

        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/

        

        /*<CONSULTAR_TABLA_SESSIONES>*/
            public function CONSULTAR_TABLA_SESSIONES($sesion){

                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = 'NO EXISTE';
                    $JSON_RESULT['ID_SESSION']      = 0;
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
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
                return $JSON_RESULT;
                
            }
        /*<CONSULTAR_TABLA_SESSIONES>*/

        /*<CONSULTAR_TABLA_RELACION_SESSIONES>*/
            public function CONSULTAR_TABLA_RELACION_SESSIONES($idSesion){
                
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = 'NO EXISTE';
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';

                    $JSON_RESULT['ID_USUARIO']      = 0;
                    $JSON_RESULT['tipoUsuario']     = '';
                    $JSON_RESULT['estatus']         = '';
                    $JSON_RESULT['sesion']          = '';
                    $JSON_RESULT['ID_RxU']          = 0;
                /*</Variables> */

                /*<Query> */
                    $querySelect = 'SELECT * FROM  relauxs_view 
                                        WHERE 
                                                idSesion    = '.$idSesion.'  AND 
                                                bstate      = 1;';
                /*</Query> */

                $JSON_RESULT['querySelect']     = $querySelect;
                
                $this->open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                        if ($resultQuery->num_rows > 0) {
                            /*<Captura>*/
                                $JSON_RESULT['information']     = "EXISTE LA SESION";
                                while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    $JSON_RESULT['ID_USUARIO']  = $r['idUsuario'];
                                    $JSON_RESULT['ID_RxU']      = $r['idRuxs'];
                                    $JSON_RESULT['tipoUsuario'] = $r['tipoUsuario'];
                                    $JSON_RESULT['estatus']     = $r['estatus'];
                                    $JSON_RESULT['sesion']      = $r['sesion'];
                                    $JSON_RESULT['r'] = $r;
                                }
                            /*</Captura>*/
                        }else{
                            $JSON_RESULT['information']     = 'NO EXISTE';
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
        /*<CONSULTAR_TABLA_RELACION_SESSIONES>*/

        /*<CONSULTAR_TABLA_USUARIOS_ACTIVOS>*/
            public function CONSULTAR_TABLA_USUARIOS_ACTIVOS($idUsuario){
                 /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = 'NO EXISTE';
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables> */

                /*<Query> */
                    $querySelect = 'SELECT * FROM  usuarios 
                                        WHERE 
                                                idUsuario = '.$idUsuario.'  AND 
                                                estatus   = "ACTIVO"        AND 
                                                bstate    = 1;';
                /*</Query> */

                $JSON_RESULT['querySelect']     = $querySelect;
                
                $this->open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                        if ($resultQuery->num_rows > 0) {
                            /*<Captura>*/
                                $JSON_RESULT['information']     = "EXISTE USUARIO ACTIVO";
                            /*</Captura>*/
                        }else{
                            $JSON_RESULT['information']     = 'NO EXISTE';
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
        /*<CONSULTAR_TABLA_USUARIOS_ACTIVOS>*/

        /*<ACTUALIZAR_RELACION_SESSIONES>*/
            public function ACTUALIZAR_RELACION_SESSIONES($ID_RxU){
                 /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $DATE                       = date('Y-m-d h:i:s');
                /*</Variables> */

                /*<Query> */
                    $queryUpdate = 'UPDATE relauxs SET 
                                                       bstate                   = 0,
                                                       fechaModificacion        = "'.$DATE.'",
                                                       observacion              = "ELIMINACION DE LA relauxs"    
                                                       WHERE idRuxs  = '.$ID_RxU.' ;';
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
                    
            }
        /*<ACTUALIZAR_RELACION_SESSIONES>*/

        /*<actualizarSesionUsuarioDistinto>*/
            public function actualizarSesionUsuarioDistinto($idSesion,$idUsuario, $sesion){

                /*<CONSULTAR>*/
                    /*<Variables> */
                        $JSON_RESULT                    = [];
                        $JSON_RESULT['ID_SESSION']      = 0;
                        $JSON_RESULT['message']         = '';
                        $JSON_RESULT['error']           = '';

                        $JSON_RESULT['idSesion']        = $idSesion;
                        $JSON_RESULT['idUsuario']       = $idUsuario;
                        $JSON_RESULT['sesion']          = $sesion;
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
                                    $JSON_RESULT['ID_SESSION'] = $r['idSesion'];
                                }
                                    $JSON_RESULT['information']     = "EXISTE LA SESION";
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
                    session_destroy();
                    if($JSON_RESULT['information']   == "NO EXISTE LA SESION"){
                        $JSON_RESULT['message'] = "Good"; 
                        return $JSON_RESULT;
                    }
                /*<CONSULTAR>*/


                /*<ACTUALIZAR>*/
                    /*<Variables> */
                        $JSON_RESULT['message']         = '';
                        $JSON_RESULT['error']           = '';
                        $DATE                       = date('Y-m-d h:i:s');
                    /*</Variables> */

                    /*<Query> */
                        $queryUpdate = 'UPDATE relauxs SET 
                                                        bstate                   = 0,
                                                        fechaModificacion        = "'.$DATE.'",
                                                        observacion              = "ELIMINACION DE LA relauxs"    
                                                        WHERE 
                                                                    idSesion    = '.$JSON_RESULT['ID_SESSION'].'  AND 
                                                                    idUsuario   = '.$idUsuario.' ;';
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
                /*</ACTUALIZAR>*/
                return $JSON_RESULT;
                    
            }
        /*<actualizarSesionUsuarioDistinto>*/


        
        /*<DATOS DEL NAVEGADOR>*/    
            public function getBrowser($user_agent){
            
                if(strpos($user_agent, 'MSIE') !== FALSE)
                    return 'Internet explorer';
                elseif(strpos($user_agent, 'Edge') !== FALSE) //Microsoft Edge
                    return 'Microsoft Edge';
                elseif(strpos($user_agent, 'Trident') !== FALSE) //IE 11
                    return 'Internet explorer';
                elseif(strpos($user_agent, 'Opera Mini') !== FALSE)
                    return "Opera Mini";
                elseif(strpos($user_agent, 'Opera') || strpos($user_agent, 'OPR') !== FALSE)
                    return "Opera";
                elseif(strpos($user_agent, 'Firefox') !== FALSE)
                    return 'Mozilla Firefox';
                elseif(strpos($user_agent, 'Chrome') !== FALSE)
                    return 'Google Chrome';
                elseif(strpos($user_agent, 'Safari') !== FALSE)
                    return "Safari";
                else
                    return 'No hemos podido detectar su navegador';
            
            }
        /*</DATOS DEL NAVEGADOR>*/

        /*<Method Create>*/
            public function INSERTA_NUEVA_SESSION( 
                                    $SESSION,
                                    $NAVEGADOR,
                                    $GUI,
                                    $TOKEN
                                ){
                /*<Variables> */

                    /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error'] = '';
                /*</Variables> */
                /*<Query>*/
                    $queryInsert = 'INSERT INTO sesion ( 
                                            sesion, 
                                            navegador,
                                            guid,
                                            token,
                                            fechaCreacion, 
                                            fechaModificacion,
                                            observacion,
                                            bstate
                                            ) VALUES( 
                                                "'.$SESSION.'",                                           
                                                "'.$NAVEGADOR.'",                 
                                                "'.$GUI.'",                 
                                                "'.$TOKEN.'",                 
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
                return $JSON_RESULT;
            }
        /*</Method Create>*/

        /*<CONSULTA PLANES>*/
            public function selectFullPlan(){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['cat_planes']      = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    session_start();                    
                    $idUser                     = $_SESSION["administrador-idUsuario"];
                /*</Variables> */

           
            
                /*<PLANES>*/
                    /*<Query> */
                        $querySelect                    = 'SELECT *  FROM cat_planes  WHERE  bstate = 1 ; ';
                        $JSON_RESULT['querySelect']     = $querySelect;
                    /*</Query> */                   
                
                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                        array_push($JSON_RESULT['cat_planes'], $Rol);
                                    }
                                /*</Captura>*/
                            }else{
                                $JSON_RESULT['cat_planes']     = [];
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
                /*<PLANES>*/ 
                return  $JSON_RESULT;   
            }   
        /*<CONSULTA PLANES>*/


        
       
    }