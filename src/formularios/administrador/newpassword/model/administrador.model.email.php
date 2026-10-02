<?php



//namespace  administrador\Newpassword\Email\Model\Newpassword;
    /*<Includes>*/
        include_once('../../Modules/ModulePugins/administrador.Cofiguration.Conection.php');
        
    /*<Includes>*/
    
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as ConectionNewpassword;
    /*<use>*/

    class NewPassword extends ConectionNewpassword{
        
        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/

        /*<EMAIL>*/
            public function selectEmail($email){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                    $JSON_RESULT['CORREO']         = '';
                /*</Variables> */

                /*<CONSULTAR CONTRASENA>*/
                    /*<Query> */
                        $QuerySelect = 'SELECT * FROM usuarios 
                                            WHERE email = "'.$email.'"';
                    /*</Query> */
                    
                    $JSON_RESULT['querySelect']     = $QuerySelect;
                    
                    $this::open();            
                        if ($resultQuery = mysqli_query($this->Connection, $QuerySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                while ($r = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    $JSON_RESULT['contrasena']   = $r['contrasena'];
                                }
                                $JSON_RESULT['message']     = "Good";
                                $JSON_RESULT['CORREO']      = "EXISTE";
                            }else{
                                $JSON_RESULT['message']     = "Good";
                                $JSON_RESULT['CORREO']      = "NO EXISTE";
                                return $JSON_RESULT;
                            }
                        }else{
                            /*<Respuesta>*/
                                $JSON_RESULT['message']         = "Bad";                            
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                                return $JSON_RESULT;
                            /*</Respuesta>*/
                        }
                    $this::closet();
                /*</CONSULTAR CONTRASENA>*/

                if($JSON_RESULT['contrasena'] != ''){

                    /*<VARIABLES>*/
                        $CONTRASENA                 = $JSON_RESULT['contrasena'];
                        $JSON_RESULT['contrasena']  = '';
                    /*<VARIABLES>*/

                    /*<CONSULTAR INFORMACION>*/

                        /*<Query> */
                            $QuerySelect = 'SELECT *  FROM servidorCorreo
                                                ORDER BY idSCorreo DESC LIMIT 1';
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
                            $mail->setFrom($email, 'door2door');  
                            $mail->addAddress($email);    
                            $mail->isHTML(true);         


                            $mail->Subject = 'SU CONTRASEÑA ACTUAL ES ';  
                            $mail->Body    = 'CONTRASEÑA:'.$CONTRASENA.' </b> ';  
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
                    $JSON_RESULT['message']     = "Good";
                    $JSON_RESULT['CORREO']      = "NO EXISTE";
                    return $JSON_RESULT;
                }
                /*<ENVIAR EMAIL>*/

                /*<ENVIAR EMAIL>*/
                return $JSON_RESULT;
            }
        /*<EMAIL>*/

        
       
    }