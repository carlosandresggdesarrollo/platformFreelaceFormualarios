<?php

namespace administrador\Modules\ModulePerfil\Model\usuario;
    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as ConectionUsuario;
    /*<use>*/

    class usuario  extends ConectionUsuario{

        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/
    
        /*<Method SelectFull>*/
            public function selectFull($idUsuario){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';

                    session_start();
                  
                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT *  FROM   
                                                usuarios 
                                        WHERE           
                                                bstate      = 1 AND 
                                                idUsuario   = '.$idUsuario.' ; ';
                /*</Query> */
                $JSON_RESULT['querySelect']     = $querySelect;

                $this::open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                        if ($resultQuery->num_rows > 0) {
                            /*<Captura>*/
                                while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    array_push($JSON_RESULT['information'], $Rol);
                                }
                            /*</Captura>*/
                        }else{
                            $JSON_RESULT['information']     = [];
                        }
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Good";   
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";                          
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this::closet();
                return $JSON_RESULT;
            }
        /*<Method SelectFull>*/

     
       

        /*<Method Update>*/
            public function update(
                                        $idUsuario,
                                        $nombre,
                                        $apellidos,
                                        $email,
                                        $imagen,
                                        $IP

                                    ){
                $JSON_RESULT = [];

                /*<Variables>*/
                        /*</datos>*/
                        session_start();
                        $Date                       = date('Y-m-d h:i:s');
                           
                    /*<datos>*/
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['email']           = [];
                    $JSON_EMAIL                     = []; 
                    $NUEVA_CONTRASENA               = '';                   
                /*</Variables>*/        
                
                $JSON_EMAIL = $this->ValidarEmail($email,$idUsuario);        

                if($JSON_EMAIL['message'] == 'Good' && !$JSON_EMAIL['repetido']){ 
                    /*</Query>*/
                        $QueryUpdate =    ' UPDATE  usuarios
                                                SET    
                                                        nombre               = "'.$nombre.'",              
                                                        apellidos            = "'.$apellidos.'",   
                                                        email                = "'.$email.'",          
                                                        imagen               = "'.$imagen.'",                
                                                        fechaModificacion    = "'.$Date.'",
                                                        observacion          = " [ UPFATE '.$Date.' ], [ idUser '.$idUsuario.' IP:  '.$IP.'] "
                                                    WHERE idUsuario          = '.$idUsuario.';';
                    /*</Query>*/

                    $JSON_RESULT['QueryDeleteUpdate']   = $QueryUpdate;

                    $this->open();
                        if (mysqli_query($this->Connection, $QueryUpdate)) {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']             = "Good";                                 
                            /*</Respuesta>*/
                        } else {
                            /*<Respuesta>*/
                                $JSON_RESULT['message']             = "Bad";
                                $JSON_RESULT['Error']               = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet(); 
                }else{
                    $JSON_RESULT['email']           =  $JSON_EMAIL;
                    $JSON_RESULT['message']         = 'EMAIL REPETIDO';
                } 
                return $JSON_RESULT;
            }
        /*</Method Update>*/ 

        /*<Method UpdatePassword>*/
            public function updatePassword(
                                            $idUsuario,
                                            $contrasenaActual,
                                            $contrasenaNueva,
                                            $IP
                                        ){
                $JSON_RESULT = [];

                /*<Variables>*/
                    session_start();
                    $Date                           = date('Y-m-d H:i:s');
                    
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['validated']       = false;                   
                /*</Variables>*/        
                
                /*<Validar contraseña actual>*/
                    $QueryValidate = '  SELECT contrasena 
                                        FROM usuarios 
                                        WHERE idUsuario = '.$idUsuario.' 
                                        LIMIT 1;';
                    
                    $this->open();
                        $result = mysqli_query($this->Connection, $QueryValidate);
                        
                        if ($result && mysqli_num_rows($result) > 0) {
                            $row = mysqli_fetch_assoc($result);
                            
                            // Verificar que la contraseña actual sea correcta
                            if (password_verify($contrasenaActual, $row['contrasena'])) {
                                $JSON_RESULT['validated'] = true;
                            } else {
                                $JSON_RESULT['message'] = 'CONTRASEÑA ACTUAL INCORRECTA';
                                $this->closet();
                                return $JSON_RESULT;
                            }
                        } else {
                            $JSON_RESULT['message'] = 'USUARIO NO ENCONTRADO';
                            $this->closet();
                            return $JSON_RESULT;
                        }
                    $this->closet();
                /*</Validar contraseña actual>*/
                
                /*<Actualizar con nueva contraseña>*/
                    if($JSON_RESULT['validated']){
                        // Hashear nueva contraseña
                        $hashedPassword = password_hash($contrasenaNueva, PASSWORD_BCRYPT);
                        
                        /*<Query>*/
                            $QueryUpdate = ' UPDATE usuarios
                                                SET    
                                                    contrasena           = "'.$hashedPassword.'",                
                                                    fechaModificacion    = "'.$Date.'",
                                                    observacion          = " [ UPDATE PASSWORD '.$Date.' ], [ idUser '.$idUsuario.' IP: '.$IP.'] "
                                                WHERE idUsuario = '.$idUsuario.';';
                        /*</Query>*/

                        $JSON_RESULT['QueryUpdate'] = $QueryUpdate;

                        $this->open();
                            if (mysqli_query($this->Connection, $QueryUpdate)) {
                                /*<Respuesta>*/
                                    $JSON_RESULT['message'] = "Good";                                 
                                /*</Respuesta>*/
                            } else {
                                /*<Respuesta>*/
                                    $JSON_RESULT['message'] = "Bad";
                                    $JSON_RESULT['error']   = "Error: <br>" . mysqli_error($this->Connection);
                                /*</Respuesta>*/
                            }        
                        $this->closet(); 
                    }
                /*</Actualizar con nueva contraseña>*/
                
                return $JSON_RESULT;
            }
        /*</Method UpdatePassword>*/

         /*<Method SelectFull>*/
            public function ValidarEmail($email, $idUsuario){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                   
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['repetido']        = true;

                   
                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT count(idUsuario)AS total  FROM   
                                                usuarios 
                                        WHERE           
                                                bstate      = 1                 AND 
                                                email       = "'.$email.'"      AND
                                                idUsuario   != '.$idUsuario.' ; ';
                /*</Query> */
                $JSON_RESULT['querySelect']     = $querySelect;

                $this::open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                       /*<Captura>*/
                            while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                if($Rol['total'] == 0){
                                    $JSON_RESULT['repetido'] = false ;
                                }else{
                                    $JSON_RESULT['repetido'] = true;
                                }
                            }
                        /*</Captura>*/
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Good";   
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";                          
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this::closet();
                return $JSON_RESULT;
            }
        /*<Method SelectFull>*/

    
 
        
      

       
    }

    