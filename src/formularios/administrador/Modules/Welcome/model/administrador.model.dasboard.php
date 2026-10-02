<?php

namespace administrador\Modules\Welcome\Model\dasboard;
    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as ConectionDasboard;
    /*<use>*/

    class dasboard  extends ConectionDasboard{

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

    

       
    }

    