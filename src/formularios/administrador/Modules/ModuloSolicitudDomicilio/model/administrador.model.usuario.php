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
            public function selectFull(){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';

                    session_start();
                    $idUser                     = $_SESSION["administrador-idUsuario"];
                /*</Variables> */
                
                /*<Query> */
                    $querySelect = '    SELECT *  FROM   
                                                datosgenerales 
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
                return $JSON_RESULT;
            }
        /*<Method SelectFull>*/

        /*<Method crear>*/
            public function crear(
                                        $idDatodGenerales,
                                        $calle,
                                        $noExterior,
                                        $noInterior,
                                        $codigoPostal,
                                        $colonia,
                                        $idMunicipio,
                                        $idEstado,
                                        $idPais,
                                        $IP

                                    ){
              

                /*<Variables> */
                        /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                        $idUser                     = $_SESSION["administrador-idUsuario"];
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';                
                /*</Variables> */        


                if($idDatodGenerales == 0){
                    /*<CREAR USUARIO>*/                   
                        /*<Query>*/
                            $queryInsert = 'INSERT INTO datosgenerales ( 
                                                    idUsuario, 
                                                    calle,
                                                    noExterior,
                                                    noInterior,
                                                    codigoPostal,
                                                    colonia,
                                                    idMunicipio,
                                                    idEstado,
                                                    idPais,
                                                
                                                    fechaCreacion, 
                                                    fechaModificacion,
                                                    observacion,
                                                    bstate
                                                    ) VALUES( 
                                                        '.$idUser.',
                                                        "'.$calle.'",
                                                        "'.$noExterior.'",
                                                        "'.$noInterior.'",
                                                        "'.$codigoPostal.'",
                                                        "'.$colonia.'",
                                                        '.$idMunicipio.',
                                                        '.$idEstado.',
                                                        '.$idPais.',
                                                     
                                                        
                                                        "'.$DATE.'",
                                                        "'.$DATE.'",
                                                        " [ INSERT  Fecha: '.$DATE.' ], [ idUser '.$idUser.' IP: '.$ip.' ] ",
                                                        1
                                                    );';
                    
                        /*</Query>*/

                        $JSON_RESULT['queryInsert']   = $queryInsert;

                        $this->open();
                            if (mysqli_query($this->Connection, $queryInsert)) {
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
                    /*</CREAR USUARIO>*/


                    /*<ACTUALIZAR USUARIO>*/
                        /*</Query>*/
                            $QueryUpdate =    ' UPDATE  usuarios
                                                    SET     estatus                         = "ACTIVO",                                                           
                                                            fechaModificacion               = "'.$DATE.'",
                                                            observacion                     = " [ UPFATE '.$DATE.' ], [ idUser '.$idUser.' IP:  '.$IP.'] "
                                                        WHERE idUsuario                     = '.$idUser.';';
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
                                    return $JSON_RESULT;
                                /*</Respuesta>*/
                            }        
                        $this->closet(); 
                    /*<ACTUALIZAR USUARIO>*/

                }else{
                    
                    /*<ACTUALIZAR USUARIO>*/
                        /*</Query>*/
                            $QueryUpdate =    ' UPDATE  datosgenerales
                                                SET     calle                           = "'.$calle.'",            
                                                        noExterior                      = "'.$noExterior.'",                                                
                                                        noInterior                      = "'.$noInterior.'",                
                                                        codigoPostal                    = "'.$codigoPostal.'",                
                                                        colonia                         = "'.$colonia.'",    
                                                        idMunicipio                     =  '.$idMunicipio.',    
                                                        idEstado                        =  '.$idEstado.',  
                                                        idPais                          =  '.$idPais.',                
                                                        
                                                        fechaModificacion               = "'.$DATE.'",
                                                        observacion                     = " [ UPFATE '.$DATE.' ], [ idUser '.$idUser.' IP:  '.$IP.'] "
                                                    WHERE idDgenerales       = '.$idDatodGenerales.';';
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
                    /*</ACTUALIZAR USUARIO>*/

                    /*<ACTUALIZAR USUARIO>*/
                        /*</Query>*/
                            $QueryUpdate =    ' UPDATE  usuarios
                                                    SET     estatus                         = "ACTIVO",                                                           
                                                            fechaModificacion               = "'.$DATE.'",
                                                            observacion                     = " [ UPFATE '.$DATE.' ], [ idUser '.$idUser.' IP:  '.$IP.'] "
                                                        WHERE idUsuario                     = '.$idUser.';';
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
                                    return $JSON_RESULT;
                                /*</Respuesta>*/
                            }        
                        $this->closet(); 
                    /*<ACTUALIZAR USUARIO>*/

                   
                }   
                session_start();
                $_SESSION["administrador-estatus"] = "ACTIVO";
                
                return $JSON_RESULT;
            }
        /*</Method crear>*/     

        /*<Method selectPaisFull>*/
            public function selectPaisFull(){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';

                  
                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT *  FROM  cat_paises  WHERE  bstate  = 1  ; ';
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
        /*<Method selectPaisFull>*/

        /*<Method selectMunicipioFull>*/
            public function selectMunicipioFull(){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';

                  
                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT *  FROM  municipios_view  WHERE  bstate  = 1  ; ';
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
        /*<Method selectMunicipioFull>*/

        /*<Method selectEstadosFull>*/
            public function selectEstadosFull(){
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';

                  
                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT *  FROM  estados_view  WHERE  bstate  = 1  ; ';
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
        /*<Method selectEstadosFull>*/

      
 
        
      

       
    }

    