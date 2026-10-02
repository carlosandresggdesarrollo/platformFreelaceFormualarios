<?php

namespace administrador\Modules\Welcome\Model\usuario;
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
            public function selectFull(){
                
                /*<Variables> */
                    $JSON_RESULT                                = [];
                    $JSON_RESULT['information_comentarios']     = [];
                    $JSON_RESULT['information']                 = [];
                    $JSON_RESULT['detalles_view']               = [];
                    $JSON_RESULT['message']                     = '';
                    $JSON_RESULT['error']                       = '';

                    session_start();
                    $idUser                     = $_SESSION["administrador-idUsuario"];
                /*</Variables> */

                /*<USUARIOS>*/
                    /*<Query> */
                        $querySelect = '    SELECT *  FROM  usuarios 
                                                    WHERE           
                                                            bstate      = 1 AND 
                                                            idUsuario   = '.$idUser.' ; ';
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
                /*</USUARIOS>*/

                /*<USUARIOS COMENTARIO>*/
                    /*<Query> */
                        $querySelectComentarios = '    SELECT *  FROM  usuarios_comentarios_view 
                                                                WHERE           
                                                                        bstate      = 1 AND 
                                                                        idUsuario   = '.$idUser.' ; ';
                    /*</Query> */
                    $JSON_RESULT['querySelectComentarios']     = $querySelectComentarios;

                    $this::open();            
                        if ($resultQueryCom = mysqli_query($this->Connection, $querySelectComentarios)) {
                            if ($resultQueryCom->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQueryCom->fetch_array(MYSQLI_ASSOC)) {
                                        array_push($JSON_RESULT['information_comentarios'], $Rol);
                                    }
                                /*</Captura>*/
                            }else{
                                $JSON_RESULT['information_comentarios']     = [];
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
                /*</USUARIOS COMENTARIO>*/

            
                return $JSON_RESULT;
            }
        /*<Method SelectFull>*/

        /*<Metgod emailFull>*/
            public function emailFull(){
                /*<Variables> */
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_EMAIL                     = [];     
                    $email                          = '';               
                /*</Variables> */ 
                session_start();
                $idUser                     = $_SESSION["administrador-idUsuario"];
                /*<CONSULTAR INFORMACION>*/
                    /*<Query> */
                        $QuerySelect = 'SELECT *  FROM usuarios WHERE idUsuario = '.$idUser.';';
                    /*</Query> */

                    $JSON_RESULT['querySelect']     = $QuerySelect;

                    $this::open();            
                        if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    $email = $r['email'];
                                }                            
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
                            $mail->setFrom($email, 'door2door');  
                            $mail->addAddress($email);    
                            $mail->isHTML(true);         


                            $mail->Subject = 'VALIDAR CORREO PORFAVOR';  
                            $mail->Body    = 'LINCK  http://sms.coeficiente.mx/confirmacion/correo.php?session='.$_SESSION['administrador-session'].' </b> ';  
                        /*</CONTRUIR CORRO>*/                   

                        /*<ENVIAR INFORMACION>*/
                            if(!$mail->send()) {
                                $JSON_RESULT['email']    = 'Error de correo: ' . $mail->ErrorInfo;
                                $JSON_RESULT['message']  = 'ERROR AL ENVIAR CORREO';       
                            } else {
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
        /*<Metgod emailFull>*/

       
    }

    