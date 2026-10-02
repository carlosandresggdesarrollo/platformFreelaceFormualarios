<?php

namespace administrador\Modules\ModuleSettingsCompanies\Model\SettingsCompanies;
    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/

    /*<use>*/
        use administrador\Modules\ModulePugins\Conection\Conection as ConectionSettingsCompanies;
    /*<use>*/

    class SettingsCompanies  extends ConectionSettingsCompanies{

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
                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT * FROM   empresa 
                                        WHERE           bstate  = 1 ORDER BY 	idEmpresa	 DESC LIMIT 1; ';
                /*</Query> */
                
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
                            $JSON_RESULT['message'] = "Good";   
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";
                            $JSON_RESULT['querySelect']     = $querySelect;
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this::closet();
                return $JSON_RESULT;
            }
        /*<Method SelectFull>*/
    
 
        
        /*<Method Create>*/
            public function create(     $razonSocial,
                                        $rfc,
                                        $domicilio,
                                        $noExterior,
                                        $noInterior,
                                        $colonia,
                                        $ciudad,
                                        $estado,
                                        $pais,
                                        $codigoPostal,
                                        $telefono,
                                        $celular,
                                        $email,
                                        $imagen
                                        
                                ){
                /*<Variables> */
                    /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                        $idUser                     = $_SESSION["idUser-cagg"];
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error'] = '';
                /*</Variables> */

                /*<Query>*/
                    if($imagen != ''){
                        $queryInsert = 'INSERT INTO empresa ( 
                            razonSocial, 
                            rfc,  
                            domicilio,          
                            noExterior, 
                            noInterior,
                            colonia,
                            ciudad,
                            estado,
                            pais,
                            codigoPostal,
                            telefono,
                            celular,
                            email,
                            imagen,
                            terminosCondiciones,

                            fechaCreacion, 
                            fechaModificacion,
                            observacion,
                            bstate
                            ) VALUES( 
                                "'.$razonSocial.'", 
                                "'.$rfc.'",  
                                "'.$domicilio.'", 
                                "'.$noExterior.'", 
                                "'.$noInterior.'", 
                                "'.$colonia.'", 
                                "'.$ciudad.'", 
                                "'.$estado.'", 
                                "'.$pais.'", 
                                "'.$codigoPostal.'", 
                                "'.$telefono.'", 
                                "'.$celular.'", 
                                "'.$email.'", 
                                "'.$imagen.'", 
                                "", 
                                "'.$DATE.'",
                                "'.$DATE.'",
                                " [ INSERT '.$DATE.' ], [ idUser '.$idUser.' ] ",
                                1
                            );';
                    }else{
                        $queryInsert = 'INSERT INTO empresa ( 
                            razonSocial, 
                            rfc,  
                            domicilio,          
                            noExterior, 
                            noInterior,
                            colonia,
                            ciudad,
                            estado,
                            pais,
                            codigoPostal,
                            telefono,
                            celular,
                            email,
                            imagen,
                            terminosCondiciones,

                            fechaCreacion, 
                            fechaModificacion,
                            observacion,
                            bstate
                            ) VALUES( 
                                "'.$razonSocial.'", 
                                "'.$rfc.'", 
                                "'.$domicilio.'", 
                                "'.$noExterior.'", 
                                "'.$noInterior.'", 
                                "'.$colonia.'", 
                                "'.$ciudad.'", 
                                "'.$estado.'", 
                                "'.$pais.'", 
                                "'.$codigoPostal.'", 
                                "'.$telefono.'", 
                                "'.$celular.'", 
                                "'.$email.'", 
                                "", 
                                "", 
                                "'.$DATE.'",
                                "'.$DATE.'",
                                " [ INSERT '.$DATE.' ], [ idUser '.$idUser.' ] ",
                                1
                            );';
                    }                   
                /*</Query>*/
                $this::open();        
                    if ( mysqli_query( $this->Connection, $queryInsert)) {
                        $JSON_RESULT['message-1']     = "Good";  
                        $JSON_RESULT['queryInsert'] = $queryInsert;                         
                    } else {
                        $JSON_RESULT['message-1']     = "Bad";
                        $JSON_RESULT['queryInsert'] = $queryInsert;
                        $JSON_RESULT['error']       = "Error: <br>" . mysqli_error($this->Connection);
                    }        
                $this::closet();
                    /*<Query> */
                    $querySelect = '     SELECT * FROM   empresa 
                                            WHERE           bstate  = 1 ORDER BY 	idEmpresa	 DESC LIMIT 1;  ';
                /*</Query> */

                $this::open();            
                if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                    /*<Captura>*/
                        while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                            $JSON_RESULT['idEmpresa']  = $Rol['idEmpresa'];
                            return $JSON_RESULT;
                        }
                    /*</Captura>*/
                } else {
                    /*<Respuesta>*/
                        $JSON_RESULT['message']         = "Bad";
                        $JSON_RESULT['querySelect']     = $querySelect;
                        $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                    /*</Respuesta>*/
                }        
                $this::closet();
                return $JSON_RESULT; 
            }
        /*</Method Create>*/

        /*<Method Update>*/
            public function update(
                                        $id, 
                                        $razonSocial,
                                        $rfc,
                                        $domicilio,
                                        $noExterior,
                                        $noInterior,
                                        $colonia,
                                        $ciudad,
                                        $estado,
                                        $pais,
                                        $codigoPostal,
                                        $telefono,
                                        $celular,
                                        $email,
                                        $imagen
                                    ){
                $JSON_RESULT = [];

                 /*<Variables> */
                            /*</datos>*/
                            session_start();
                            $Date                       = date('Y-m-d h:i:s');
                            $idUser                     = $_SESSION["idUser-cagg"];
                        /*<datos>*/
                        $JSON_RESULT['message']         = '';
                        $JSON_RESULT['error'] = '';
                    /*</Variables> */
                    /*</Query>*/
                        if($imagen != ''){
                                $QueryUpdate =    'UPDATE  empresa
                                                        SET     razonSocial            = "'.$razonSocial.'",
                                                                rfc                    = "'.$rfc.'",
                                                                domicilio              = "'.$domicilio.'",   
                                                                noExterior             = "'.$noExterior.'",   
                                                                noInterior             = "'.$noInterior.'",                                                          
                                                                colonia                = "'.$colonia.'", 
                                                                ciudad                 = "'.$ciudad.'", 
                                                                estado                 = "'.$estado.'", 
                                                                pais                   = "'.$pais.'", 
                                                                codigoPostal           = "'.$codigoPostal.'", 
                                                                telefono               = "'.$telefono.'", 
                                                                celular                = "'.$celular.'", 
                                                                email                  = "'.$email.'", 
                                                                imagen                 = "'.$imagen.'", 
                                                                fechaModificacion      = "'.$Date.'",
                                                                observacion            = " [ UPFATE '.$Date.' ], [ idUser '.$idUser.' ] "
                                                    WHERE idEmpresa        = '.$id.';';
                        }else{
                            $QueryUpdate =    'UPDATE  empresa
                                                    SET     razonSocial            = "'.$razonSocial.'",
                                                            rfc                    = "'.$rfc.'",
                                                            domicilio              = "'.$domicilio.'",   
                                                            noExterior             = "'.$noExterior.'",   
                                                            noInterior             = "'.$noInterior.'",                                                          
                                                            colonia                = "'.$colonia.'", 
                                                            ciudad                 = "'.$ciudad.'", 
                                                            estado                 = "'.$estado.'", 
                                                            pais                   = "'.$pais.'", 
                                                            codigoPostal           = "'.$codigoPostal.'", 
                                                            telefono               = "'.$telefono.'", 
                                                            celular                = "'.$celular.'", 
                                                            email                  = "'.$email.'", 
                                                            fechaModificacion      = "'.$Date.'",
                                                            observacion            = " [ UPFATE '.$Date.' ], [ idUser '.$idUser.' ] "
                                                WHERE idEmpresa        = '.$id.';';
                        }
                        
                    /*</Query>*/
                $this->open();
                    if (mysqli_query($this->Connection, $QueryUpdate)) {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']          = "Good";   
                            $JSON_RESULT['idEmpresa']        = $id; 
                            $JSON_RESULT['QueryDeleteUpdate']   = $QueryUpdate;  
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']             = "Bad";
                            $JSON_RESULT['QueryDeleteUpdate']   = $QueryUpdate;
                            $JSON_RESULT['Error']               = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this->closet(); 
                return $JSON_RESULT;
            }
        /*</Method Update>*/  

       
    }

    