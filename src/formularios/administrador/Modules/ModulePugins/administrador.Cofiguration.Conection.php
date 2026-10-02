<?php
                
                
/*
*    Autor:         Carlos Andres González Gómez  
*    Description;   Class of connection MariaDb
**/

namespace  administrador\Modules\ModulePugins\Conection;

    class Conection {
      
    
        // Para Docker: usar nombre del servicio mysql_platform
        protected $Server   = 'mysql_platform';
        protected $User     = 'root';
        protected $Password = 'Kb.204.h3';
        protected $Database = 'biotiposUnani';

        /* Para localhost sin Docker:
        protected $Server   = '127.0.0.1';
        protected $User     = 'root';
        protected $Password = 'Kb.204.h3';
        protected $Database = 'biotiposUnani'; */

        
        public $Connection;

        public function __construct(){ }

        public function open(){
            /*<En el servidors>*/
                 $this->Connection = @mysqli_connect(
                    $this->Server,
                    $this->User,
                    $this->Password,
                    $this->Database
                );

                // Verificar conexión
                if (!$this->Connection) {
                    error_log("Error de conexión MySQL: " . mysqli_connect_error());
                }
            /*<En el servidors>*/
        }
        
        public function closet(){
            mysqli_close($this->Connection);                
        }

        public function tracking(
                                    $idUsuario,
                                    $modelo,
                                    $baseDatos,
                                    $tipoOperacion,
                                    $idClave
                                ){
            /*<datos>*/
                $DATE                       = date('Y-m-d h:i:s');
                $JSON_RESULT                = [];
                $JSON_RESULT['message']     = '';
                $JSON_RESULT['error']       = '';
            /*</datos>*/
            if($modelo != '' &&  $baseDatos != '' && $tipoOperacion != '' ){
                if($tipoOperacion != 'UPDATE'){
                    
                    /*<Query>*/
                        $queryInsert = 'INSERT INTO seguimientos ( 
                                                fecha, 
                                                idUsuario,  
                                                modelo,                                                  
                                                baseDatos,   
                                                tipoOperacion,   

                                                fechaCreacion, 
                                                fechaModificacion,
                                                observacion,
                                                bstate
                                                ) VALUES( 
                                                    "'.$DATE.'", 
                                                    "'.$idUsuario.'", 
                                                    "'.$modelo.'", 
                                                    "'.$baseDatos.'", 
                                                    "'.$tipoOperacion.'", 
                                                    "'.$DATE.'",
                                                    "'.$DATE.'",
                                                    " [ INSERT '.$DATE.' ], [ idUser '.$idUsuario.' ] ",
                                                    1
                                                );';
                    /*</Query>*/
                    $this->open();        
                        if ( mysqli_query( $this->Connection, $queryInsert)) {
                            $JSON_RESULT['message']     = "Good";
                        } else {
                            $JSON_RESULT['message']     = "Bad";
                            $JSON_RESULT['queryInsert'] = $queryInsert;
                            $JSON_RESULT['error']       = "Error: <br>" . mysqli_error($this->Connection);
                        }        
                    $this->closet();
                    return $JSON_RESULT;  
                }else{
                    $querySelect = ' SELECT * FROM '.$modelo.' ORDER BY '.$idClave.' DESC LIMIT 1';
                    $this->open(); 
                        if ( $resultQuery = mysqli_query( $this->Connection, $querySelect)) {
                            $registroAnterior = '';
                            while ($row = $resultQuery->fetch_array(MYSQLI_ASSOC)) {                               
                                foreach ( $row as $clave => $valor ) {   
                                    $registroAnterior .=  '[ '.$clave.'] => [ '.$valor .' ] '; 
                                }     
                            }
                            $queryInsert = 'INSERT INTO seguimientos ( 
                                                        fecha, 
                                                        idUsuario,  
                                                        modelo,                                                  
                                                        baseDatos,   
                                                        tipoOperacion,   
                                                        registroAnterior,

                                                        fechaCreacion, 
                                                        fechaModificacion,
                                                        observacion,
                                                        bstate
                                                        ) VALUES( 
                                                            "'.$DATE.'", 
                                                            "'.$idUsuario.'", 
                                                            "'.$modelo.'", 
                                                            "'.$baseDatos.'", 
                                                            "'.$tipoOperacion.'", 
                                                            "'.$registroAnterior .'",
                                                            "'.$DATE.'",
                                                            "'.$DATE.'",
                                                            " [ INSERT '.$DATE.' ], [ idUser '.$idUsuario.' ] ",
                                                            1
                                                        );';
                            if ( mysqli_query( $this->Connection, $queryInsert)) {
                                $JSON_RESULT['message']     = "Good";
                            } else {
                                $JSON_RESULT['message']     = "Bad";
                                $JSON_RESULT['queryInsert'] = $queryInsert;
                                $JSON_RESULT['error']       = "Error: <br>" . mysqli_error($this->Connection);
                            }       

                        }else {
                            $JSON_RESULT['message']     = "Bad";
                            $JSON_RESULT['querySelect'] = $querySelect;
                            $JSON_RESULT['error']       = "Error: <br>" . mysqli_error($this->Connection);
                        } 
                    $this->closet();   

                }            
            }else{
                $JSON_RESULT['message']  = 'fail variable tracking';            
            }
            return $JSON_RESULT;
        }

        
        public function getDatabase(){ return $this->Database; }
        public function setDatabase($Database){$this->Database = $Database; return $this; }

        public function getPassword(){ return $this->Password; }
        public function setPassword($Password){$this->Password = $Password;return $this;}

        public function getUser(){ return $this->User; }    
        public function setUser($User){ $this->User = $User;  return $this; }

        public function getServer(){ return $this->Server;  }
        public function setServer($Server){ $this->Server = $Server; return $this; }
    }



?>