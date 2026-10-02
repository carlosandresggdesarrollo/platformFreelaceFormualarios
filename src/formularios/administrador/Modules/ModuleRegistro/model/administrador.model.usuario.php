<?php

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
    

        /*<Method crear>*/
            public function crear(
                                        $usuario,
                                        $contrasena,
                                        $nombre,
                                        $apellidos,
                                        $email,
                                        $IP,
                                        $tipo = 'CLIENTE',
                                        $profesion = ''

                                    ){
                $JSON_RESULT = [];

                /*<Variables> */
                        /*</datos>*/
                        if (session_status() === PHP_SESSION_NONE) { session_start(); }
                        $DATE                       = date('Y-m-d h:i:s');
                        $idUser                     = isset($_SESSION["administrador-idUsuario"]) ? $_SESSION["administrador-idUsuario"] : 'AUTO-REGISTRO';
                    /*<datos>*/
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['email']           = [];
                    $JSON_EMAIL                     = [];                    
                /*</Variables> */        
                
                $JSON_EMAIL = $this->ValidarEmail($email, $usuario);      
                  
                if($JSON_EMAIL['message'] == 'Good' && !$JSON_EMAIL['repetido']){

                    /*<CONTRASENA>*/
                        $hashedPassword = password_hash($contrasena, PASSWORD_BCRYPT);
                    /*<CONTRASEÑNA>*/

                    /*<TOKEN UNICO>*/
                        $tokenConfirmacion = bin2hex(random_bytes(32));
                    /*</TOKEN UNICO>*/

                    $tipoSanitizado = 'CLIENTE';

                    $this->open();
                    $profSanitizado = mysqli_real_escape_string($this->Connection, $profesion);

                    /*</Query>*/
                        $queryInsert = 'INSERT INTO usuarios (
                                                usuario,
                                                contrasena,
                                                nombre,
                                                apellidos,
                                                email,
                                                profesion,
                                                tipoUsuario,
                                                estatus,
                                                contraro,
                                                token,
                                                imagen,
                                                fechaCreacion,
                                                fechaModificacion,
                                                observacion,
                                                bstate
                                                ) VALUES(
                                                    "'.$usuario.'",
                                                    "'.$hashedPassword.'",
                                                    "'.$nombre.'",
                                                    "'.$apellidos.'",
                                                    "'.$email.'",
                                                    "'.$profSanitizado.'",
                                                    "'.$tipoSanitizado.'",
                                                    "PENDIENTE",
                                                    "0",
                                                    "'.$tokenConfirmacion.'",
                                                    "/administrador/Modules/ModulesImage/cliente.png",
                                                    "'.$DATE.'",
                                                    "'.$DATE.'",
                                                    " [ INSERT  Fecha: '.$DATE.' ], [ idUser '.$idUser.' IP: '.$IP.' ] ",
                                                    1
                                                );';
                    /*</Query>*/
                    $JSON_RESULT['queryInsert']   = $queryInsert;
                        if (mysqli_query($this->Connection, $queryInsert)) {
                            /*<Respuesta>*/
                                $enviarEmail                    =  $this->enviarEmail($email, $tokenConfirmacion);  
                                $JSON_RESULT['enviarEmail']     =  $enviarEmail;
                                /*<VALIDACION DE CORREO>*/  
                                    if($enviarEmail['message'] == 'Good'){
                                        $JSON_RESULT['message']                 =  "Good"; 
                                    }else{
                                        $JSON_DELETE = [];
                                        $JSON_DELETE = $this->delete(
                                            $usuario,
                                            $nombre, 
                                            $apellidos, 
                                            $email
                                        );
                                        /*<VALIDAR>*/
                                            if($JSON_DELETE['message'] != 'Good'){
                                                $JSON_RESULT['message']                 = "ERROR DE SISTEMA"; 
                                                $JSON_RESULT['delete']                  = $JSON_DELETE;
                                            }else{
                                                $JSON_RESULT['message']                 = "NO SE PUDO ENVIAR EMAIL"; 
                                                $JSON_RESULT['delete']                  = $JSON_DELETE;
                                            }
                                        /*<VALIDAR>*/
                                    }         
                                /*</VALIDACION DE CORREO>*/                
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
        /*</Method crear>*/ 

        /*<Method ValidarEmail>*/
            public function ValidarEmail($email,$usuario){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['repetido']        = false;

                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT count(idUsuario)AS total  FROM   
                                                usuarios 
                                        WHERE           
                                                bstate      = 1                 AND 
                                                usuario     = "'.$usuario.'"    AND
                                                email       = "'.$email.'"      ';
                /*</Query> */
                $JSON_RESULT['querySelect']     = $querySelect;

                $this::open();            
                    if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                       /*<Captura>*/
                            while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                if($Rol['total'] == 0){
                                    $JSON_RESULT['repetido'] = false;
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
        /*<Method ValidarEmail>*/

        /*<Method enviar email>*/
            private function enviarEmail($email, $token){
                /*<Variables> */
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['email']           = $email;
                    $JSON_EMAIL                     = [];
                if($email != ''){
                    /*<CONSULTAR INFORMACION>*/
                        /*<Query> */
                            $QuerySelect = 'SELECT *  FROM servidorCorreo ORDER BY idSCorreo DESC LIMIT 1';
                        /*</Query> */

                        $JSON_RESULT['querySelect']     = $QuerySelect;

                        $this::open();            
                            if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                                if ($resultQuery->num_rows > 0) {
                                    while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                        $SERVER     = $r['servidor'];
                                        $USUARIO    = $r['usuario'];
                                        $PASSWORD   = $r['contrasena'];
                                        $PUERTO     = $r['puerto'];
                                    }                  
                                    $JSON_RESULT['SERVER']      = $SERVER;    
                                    $JSON_RESULT['USUARIO']     = $USUARIO;        
                                    $JSON_RESULT['PASSWORD']    = $PASSWORD;    
                                    $JSON_RESULT['PUERTO']      = $PUERTO;    
                                }else{
                                    $JSON_RESULT['message'] = "ERROR AL ENVIAR CORREO";       
                                    return $JSON_RESULT;                     
                                }
                            }else{
                                /*<Respuesta>*/
                                    $JSON_RESULT['message']         = "ERROR AL ENVIAR CORREO";                            
                                    $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                                    return $JSON_RESULT;
                                /*</Respuesta>*/                            
                            }
                        $this::closet();
                    /*</CONSULTAR INFORMACION>*/

                    /*<ENVIAR INFORMACION>*/     
                        require      'PHPMailerAutoload.php';
                        $mail = new PHPMailer;      
                        $mail->isSMTP();  

                        /*<EMAIL>*/              
                            $mail->Host         = $SERVER; //'smtp.gmail.com';  
                            $mail->SMTPAuth     = true;                               
                            $mail->Username     = $USUARIO; //'carlos.andres.g.g.desarrollo@gmail.com';                
                            $mail->Password     = $PASSWORD; //'noepewmuutuikulw';                           
                            $mail->SMTPSecure   = 'tls';                           
                            $mail->Port         = $PUERTO; //587;   
                        /*<EMAIL>*/                                

                        /*<CONTRUIR CORRO>*/
                            $mail->setFrom($email, 'SMS');  
                            $mail->addAddress($email);    
                            $mail->isHTML(true);         


                            $mail->Subject = 'Confirma tu correo - SMS';
                            $mail->Body    = '
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                                        <h1 style="color: white; margin: 0;">¡Bienvenido!</h1>
                                    </div>
                                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                                        <p style="font-size: 16px; color: #333;">Gracias por registrarte en Sms.</p>
                                        <p style="font-size: 16px; color: #333;">Para confirmar tu correo electrónico, haz clic en el siguiente botón:</p>
                                        <div style="text-align: center; margin: 30px 0;">
                                            <a href="http://sms.coeficiente.mx/confirmar-correo/'.$token.'"
                                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                                      color: white;
                                                      padding: 15px 30px;
                                                      text-decoration: none;
                                                      border-radius: 5px;
                                                      font-size: 16px;
                                                      display: inline-block;">
                                                Confirmar mi correo
                                            </a>
                                        </div>
                                        <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
                                        <p style="font-size: 12px; color: #999; word-break: break-all;">http://sms.coeficiente.mx/confirmar-correo/'.$token.'</p>
                                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                        <p style="font-size: 12px; color: #999; text-align: center;">Si no solicitaste este registro, puedes ignorar este correo.</p>
                                    </div>
                                </div>
                            ';  
                        /*</CONTRUIR CORRO>*/                   

                        /*<ENVIAR INFORMACION>*/
                            if(!$mail->send()) {
                                $JSON_RESULT['email']    = 'Error de correo: ' . $mail->ErrorInfo;
                                $JSON_RESULT['message']  = 'ERROR AL ENVIAR CORREO';       
                            } else {
                                $JSON_RESULT['mail']     = $mail;
                                $JSON_RESULT['email']    = 'GoodEmail';     
                                $JSON_RESULT['message']  = 'Good';                       
                            }
                        /*<ENVIAR INFORMACION>*/
                    /*</ENVIAR INFORMACION>*/
                }else{
                    $JSON_RESULT['message']             = "ERROR AL ENVIAR CORREO";
                    $JSON_RESULT['email']               = '';
                }
                

                return $JSON_RESULT;

            }
        /*<Method enviar email>*/

        /*<Method Delete>*/
            public function delete(
                                        $usuario,
                                        $nombre, 
                                        $apellidos, 
                                        $email
                                    ){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables> */

                /*<Query> */
                    $queryDelete = ' DELETE FROM usuarios  
                                                    WHERE           
                                                            usuario         = "'.$usuario.'"    AND 
                                                            nombre          = "'.$nombre.'"     AND
                                                            apellidos       = "'.$apellidos.'"  AND
                                                            email           = "'.$email.'"      AND
                                                            tipoUsuario     = "CLIENTE" ; ';
                /*</Query> */
                $JSON_RESULT['queryDelete']     = $queryDelete;

                $this::open();            
                    if (mysqli_query($this->Connection, $queryDelete)) {                        
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
        /*<Method Delete>*/

 
        
      

       
    }

    