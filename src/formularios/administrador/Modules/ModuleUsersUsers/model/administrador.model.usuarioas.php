<?php

namespace  administrador\Modules\ModuleUsersUsers\Model\Usuarios;
    /*<Includes>*/
        include_once('../../ModulePugins/administrador.Cofiguration.Conection.php');
    /*<Includes>*/
    /*<use>*/
        use  administrador\Modules\ModulePugins\Conection\Conection as ConectionUsuarios;
    /*<use>*/

    class Usuarios extends ConectionUsuarios{

        /*<Method construc>*/
            public function __construct(){
                // Cosntruct Father
                parent::__construct();
            }
        /*<Method construc>*/
    
        /*<PAGUINACION>*/
            /*<consulta total>*/
                public function selectFull($Busqueda, $hoja, $Ordenamiento, $ASC_DESC){
                    /*<Variables> */

                        $JSON_RESULT                    = [];
                        $JSON_RESULT['information']     = [];
                        $JSON_RESULT['message']         = '';
                        $JSON_RESULT['error']           = '';
                        $JSON_RESULT['totalRegistro']   = 0;
                        $JSON_RESULT['hojas']           = 0;
                        $JSON_RESULT['cantidadHojas']   = 0;
                        $JSON_RESULT['inicioActual']    = 0;

                    /*</Variables> */

                    /*<MANEJO DE WHERE>*/
                        $WHERE_BUSQUEDA = '';

                        if($Busqueda != ''){
                            $WHERE_BUSQUEDA = '
                                (                                    
                                    nombre      like "%'.$Busqueda.'%" OR
                                    apellidos   like "%'.$Busqueda.'%" OR
                                    email       like "%'.$Busqueda.'%" OR                                 
                                    estatus     like "%'.$Busqueda.'%" OR
                                    tipoUsuario LIKE "%'.$Busqueda.'%"
                                ) AND
                            ';
                        }
                    /*</MANEJO DE WHERE>*/
                    

                    /*<MANEJOR DE ORDENAMIENTO>*/
                        /*<VARIABLES>*/
                            $ORDENAMIENTO = '';
                        /*</VARIABLES>*/
                      
                        if($Ordenamiento != ''){
                            $ORDENAMIENTO =  'ORDER BY '.$Ordenamiento.' '.$ASC_DESC ;
                        }
                    /*</MANEJOR DE ORDENAMIENTO>*/
                    
                    /*<Query> */
                        $querySelect = 'SELECT *
                                                    FROM usuarios
                                                        WHERE
                                                            '.$WHERE_BUSQUEDA.'
                                                            tipoUsuario IN ("ADMINISTRADOR","AUDITOR") AND
                                                            bstate = 1
                                                            '.$ORDENAMIENTO.'
                                                    LIMIT 20 OFFSET '.$JSON_RESULT['inicioActual'].'; ';
                    /*</Query> */

                    /*<Query> */
                        $querySelectConteo = 'SELECT COUNT(idUsuario)AS total
                                                    FROM usuarios
                                                        WHERE
                                                            '.$WHERE_BUSQUEDA.'
                                                            tipoUsuario IN ("ADMINISTRADOR","AUDITOR") AND
                                                            bstate = 1 ; ';
                    /*</Query> */
                   
                    /*<CALCULAR TOTAL DE HOJAS>*/
                        $TOTAL_REGISTROS                        = $this->totalRegistroActivos( $querySelectConteo );
                        $JSON_RESULT['totalRegistroActivos']    = $TOTAL_REGISTROS;

                        if($TOTAL_REGISTROS['message'] == 'Good'){

                            $JSON_RESULT['totalRegistro']        = $TOTAL_REGISTROS['total'];                            
                            $JSON_RESULT['cantidadHojas']        = $JSON_RESULT['totalRegistro'] /20; 

                            if($JSON_RESULT['cantidadHojas'] < 1) {$JSON_RESULT['cantidadHojas'] = 1; }

                            $JSON_RESULT['inicioActual']         = ($hoja-1) *20;

                            if($JSON_RESULT['inicioActual'] < 0) {$JSON_RESULT['inicioActual'] = 0; }

                        }
                    /*<CALCULAR TOTAL DE HOJAS>*/

                    
                    $JSON_RESULT['querySelect']     = $querySelect;
                    $this->open();            
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
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();
                    return $JSON_RESULT;
                }
            /*/consulta total>*/

            /*<conteo>*/
                private function totalRegistroActivos( $querySelectConteo ){
                    /*<Variables> */
                        $JSON_RESULT                    = [];
                        $JSON_RESULT['message']         = '';
                        $JSON_RESULT['error']           = '';
                        $JSON_RESULT['total']           = 0;                      
                    /*</Variables> */

                    /*<Query> */
                        $querySelect = $querySelectConteo;
                    /*</Query> */
                    
                    $JSON_RESULT['querySelect']     = $querySelect;
                    
                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            /*<Captura>*/
                                while ($R = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                    $JSON_RESULT['total'] = $R['total'];
                                }
                            /*</Captura>*/
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
            /*</conteo>*/
        /*<PAGUINACIONl>*/

        /*<selectOne>*/
            public function selectOne($id){
                
                /*<Variables> */
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = [];
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables> */
                /*<Query> */
                    $querySelect = '    SELECT  *  FROM usuarios  WHERE  bstate  = 1 AND idUsuario = '.$id.'; ';
                /*</Query> */
              
                 $this->open();            
                    if ($resultQuery = mysqli_query( $this->Connection, $querySelect)) {
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
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this->closet();
                return $JSON_RESULT;
            }
        /*<selectOne>*/
        
    
        /*<Method deleteImagen>*/
            public function deleteImagen($id){       
                /*<Variables> */
                    /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                        $idUser                     = $_SESSION["idUser-administrador"];
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['information']     = "/administrador/Modules/ModulesImage/usuarios.png";
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error'] = '';
                /*</Variables> */
                /*<Query>*/
                    $queryDeleteUpdate = '  UPDATE  usuarios 
                                            SET     imagen              = "/administrador/Modules/ModulesImage/usuarios.png",
                                                    fechaModificacion   = "'.$DATE.'",
                                                    observacion      = " [ DELETE '.$DATE.' ], [ idUser '.$idUser.' ] "
                                            WHERE idUsuario = '.$id.';';
                /*</Query>*/
                
                $this->open();
                    if (mysqli_query($this->Connection, $queryDeleteUpdate)) {
                        /*<Respuesta>*/
                           
                            $JSON_RESULT['message'] = "Good";   
                           
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";
                            $JSON_RESULT['queryDeleteUpdate']     = $queryDeleteUpdate;
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this->closet(); 
                return $JSON_RESULT;
            }
        /*</Method deleteImagen>*/

        
        

        /*<Method deleteUsuario>*/
            public function deleteUsuario($id, $IP){       
                /*<Variables> */
                    /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                        $idUser                     = $_SESSION["idUser-administrador"];
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                   
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error'] = '';
                /*</Variables> */
                /*<Query>*/
                    $queryDeleteUpdate = '  UPDATE  usuarios 
                                            SET     bstate              = 0,
                                                    fechaModificacion   = "'.$DATE.'",
                                                    observacion      = " [ DELETE '.$DATE.' ], [ idUser '.$idUser.' IP '.$IP.'] "
                                            WHERE idUsuario = '.$id.';';
                /*</Query>*/
                
                $this->open();
                    if (mysqli_query($this->Connection, $queryDeleteUpdate)) {
                        /*<Respuesta>*/
                           
                            $JSON_RESULT['message'] = "Good";   
                           
                        /*</Respuesta>*/
                    } else {
                        /*<Respuesta>*/
                            $JSON_RESULT['message']         = "Bad";
                            $JSON_RESULT['queryDeleteUpdate']     = $queryDeleteUpdate;
                            $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                        /*</Respuesta>*/
                    }        
                $this->closet(); 
                return $JSON_RESULT;
            }
        /*</Method deleteUsuario>*/

        /*<Method deleteUsuario>*/
            public function updateUsuario(
                                    $id,
                                    $usuario,
                                    $nombre,
                                    $apellido,
                                    $email,
                                    $tipo,
                                    $imagen,
                                    $IP,
                                    $profesion = ''
                ){       
                /*<Variables> */
                    /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                        $idUser                     = $_SESSION["idUser-administrador"];
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                   
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error'] = '';
                /*</Variables> */

                /*<CONSULTAR USUARIO>*/
                    /*<Query> */
                        $querySelect = '    SELECT  COUNT(*)AS total  FROM usuarios  
                                                WHERE  
                                                        bstate      = 1                 AND 
                                                        usuario     = "'.$usuario.'"    AND
                                                        idUsuario   != '.$id.'; ';
                    /*</Query> */
                    $JSON_RESULT['querySelect1']     = $querySelect;
                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                        $JSON_RESULT['total'] = (int)$Rol['total'];
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
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();
                /*<CONSULTAR USUARIO>*/   
                    
                if($JSON_RESULT['total'] == 0){

                    /*<CONSULTAR USUARIO>*/
                        /*<Query> */
                            $querySelect = '    SELECT  COUNT(*)AS total  FROM usuarios  
                                                    WHERE  
                                                        bstate      = 1             AND  
                                                        email       = "'.$email.'"  AND
                                                        idUsuario   != '.$id.'; ';
                        /*</Query> */

                        $JSON_RESULT['querySelect']     = $querySelect;
                        $this->open();            
                            if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                                if ($resultQuery->num_rows > 0) {
                                    /*<Captura>*/
                                        while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                            $JSON_RESULT['total'] = (int)$Rol['total'];
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
                                    $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                                /*</Respuesta>*/
                            }        
                        $this->closet();
                    /*<CONSULTAR USUARIO>*/   

                    if($JSON_RESULT['total'] == 0){

                        /*<ACTUALIZAR CLIENTE>*/
                            /*</Query>*/
                                $QueryUpdate =    ' UPDATE  usuarios
                                                        SET     usuario              = "'.$usuario.'",
                                                                nombre               = "'.$nombre.'",
                                                                apellidos            = "'.$apellido.'",
                                                                email                = "'.$email.'",
                                                                profesion            = "'.$profesion.'",
                                                                tipoUsuario          = "'.$tipo.'",
                                                                imagen               = "'.$imagen.'",
                                                                fechaModificacion    = "'.$DATE.'",
                                                                observacion          = " [ UPFATE '.$DATE.' ], [ idUser '.$idUser.' IP:  '.$IP.'] "
                                                            WHERE idUsuario          = '.$id.';';
                            /*</Query>*/
                            
                            $this->open();
                                if (mysqli_query($this->Connection, $QueryUpdate)) {
                                    /*<Respuesta>*/
                                        $JSON_RESULT['message']             = "Good";  
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
                        /*<ACTUALIZAR CLIENTE>*/

                    }else{
                        $JSON_RESULT['message'] = 'CORREO REPETIDO';
                    }                       

                }else{
                    $JSON_RESULT['message'] = 'USUARIO REPETIDO';
                }   
               
                return $JSON_RESULT;
            }
        /*</Method deleteUsuario>*/

        /*<Method Crear Usuario>*/
           public function crearUsuario(
                                            $usuario,
                                            $nombre,
                                            $apellido,
                                            $contrasena,
                                            $email,
                                            $tipo,
                                            $imagen,
                                            $ip,
                                            $profesion = ''
                                        ){
                /*<Variables> */
                    /*</datos>*/
                        session_start();
                        $DATE                       = date('Y-m-d h:i:s');
                        $idUser                     = $_SESSION["idUser-administrador"];
                    /*<datos>*/
                    $JSON_RESULT                    = [];
                    $JSON_RESULT['idUsuario']       = 0;
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                  
                /*</Variables> */

                if($imagen == ''){$imagen = '/administrador/Modules/ModulesImage/cliente.png';}
                /*<CONSULTAR USUARIO>*/
                    /*<Query> */
                        $querySelect = '    SELECT  COUNT(*)AS total  FROM usuarios  
                                                WHERE  bstate  = 1 AND usuario = "'.$usuario.'"; ';
                    /*</Query> */
                    $JSON_RESULT['querySelect']     = $querySelect;
                    $this->open();            
                        if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                            if ($resultQuery->num_rows > 0) {
                                /*<Captura>*/
                                    while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                        $JSON_RESULT['total'] = (int)$Rol['total'];
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
                                $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                            /*</Respuesta>*/
                        }        
                    $this->closet();
                /*<CONSULTAR USUARIO>*/   
                    
                if($JSON_RESULT['total'] == 0){
                    /*<CONSULTAR USUARIO>*/
                        /*<Query> */
                            $querySelect = '    SELECT  COUNT(*)AS total  FROM usuarios  
                                                    WHERE  bstate  = 1 AND  email = "'.$email.'"; ';
                        /*</Query> */
                        $JSON_RESULT['querySelect']     = $querySelect;
                        $this->open();            
                            if ($resultQuery = mysqli_query($this->Connection, $querySelect)) {
                                if ($resultQuery->num_rows > 0) {
                                    /*<Captura>*/
                                        while ($Rol = $resultQuery->fetch_array(MYSQLI_ASSOC)) {
                                            $JSON_RESULT['total'] = (int)$Rol['total'];
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
                                    $JSON_RESULT['Error']           = "Error: <br>" . mysqli_error($this->Connection);
                                /*</Respuesta>*/
                            }        
                        $this->closet();
                    /*<CONSULTAR USUARIO>*/   

                    if($JSON_RESULT['total'] == 0){

                        /*<CONTRASENA>*/
                            $hashedPassword = password_hash($contrasena, PASSWORD_BCRYPT);
                        /*<CONTRASEÑNA>*/
                        
                         /*<CREAR USUARIO>*/
                              $tipoSanitizado = in_array($tipo, ['ADMINISTRADOR','AUDITOR','CLIENTE']) ? $tipo : 'ADMINISTRADOR';
                              /*<Query>*/
                                $queryInsert = 'INSERT INTO usuarios (
                                                        usuario,
                                                        nombre,
                                                        apellidos,
                                                        contrasena,
                                                        email,
                                                        profesion,
                                                        tipoUsuario,
                                                        imagen,
                                                        estatus,
                                                        contraro,
                                                        token,
                                                        fechaCreacion,
                                                        fechaModificacion,
                                                        observacion,
                                                        bstate
                                                        ) VALUES(
                                                            "'.$usuario.'",
                                                            "'.$nombre.'",
                                                            "'.$apellido.'",
                                                            "'.$hashedPassword.'",
                                                            "'.$email.'",
                                                            "'.$profesion.'",
                                                            "'.$tipoSanitizado.'",
                                                            "/administrador/Modules/ModulesImage/usuarios.png",
                                                            "ACTIVO",
                                                            "",
                                                            "",
                                                            "'.$DATE.'",
                                                            "'.$DATE.'",
                                                            " [ INSERT '.$DATE.' ], [ idUser '.$idUser.' ] ",
                                                            1
                                                        );';
                            /*</Query>*/
                            $this->open();        
                                if ( mysqli_query( $this->Connection, $queryInsert)) {
                                    $JSON_RESULT['message']     = "Good";
                                    $this->tracking($idUser,'usuarios','door2door','INSERT','');
                                } else {
                                    $JSON_RESULT['message']     = "Bad";
                                    $JSON_RESULT['queryInsert'] = $queryInsert;
                                    $JSON_RESULT['error']       = "Error: <br>" . mysqli_error($this->Connection);
                                }        
                            $this->closet();
                        /*</CREAR USUARIO>*/
                    }else{
                        $JSON_RESULT['message'] = 'CORREO REPETIDO';
                    }                       

                }else{
                    $JSON_RESULT['message'] = 'USUARIO REPETIDO';
                }              

                
                return $JSON_RESULT;           
           }
        /*</Method Crear Usuario>*/

        /*<updateEstatus>*/
           public function updateEstatus(
                                                $estatus,
                                                $idUsuario,
                                                $IP
                                        ){
              
                /*<Variables> */
                    /*</datos>*/
                        session_start();
                        $Date                       = date('Y-m-d h:i:s');
                        $idUser                     = $_SESSION["administrador-idUsuario"];
                    /*<datos>*/
                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables> */

                /*</Query>*/
                    $QueryUpdate =    ' UPDATE  usuarios
                                            SET     estatus                 = "'.$estatus.'",                                                                                                
                                                    fechaModificacion       = "'.$Date.'",
                                                    observacion             = " [ UDATE '.$Date.' ], [ idUser '.$idUser.'  IP '.$IP.' ] "
                                                WHERE idUsuario             = '.$idUsuario.';';
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
                
                return $JSON_RESULT;
           }
        /*<updateEstatus>*/

        /*<Method UpdatePassword>*/
            public function updatePassword(
                                            $idUsuario,
                                            $contrasenaNueva,
                                            $IP
                                        ){
                $JSON_RESULT = [];

                /*<Variables>*/
                    session_start();
                    $Date                           = date('Y-m-d H:i:s');
                    $idAdmin                        = $_SESSION["administrador-idUsuario"];

                    $JSON_RESULT['message']         = '';
                    $JSON_RESULT['error']           = '';
                /*</Variables>*/

                /*<Actualizar contraseña - Solo admin>*/
                    // Hashear nueva contraseña
                    $hashedPassword = password_hash($contrasenaNueva, PASSWORD_BCRYPT);

                    /*<Query>*/
                        $QueryUpdate = ' UPDATE usuarios
                                            SET
                                                contrasena           = "'.$hashedPassword.'",
                                                fechaModificacion    = "'.$Date.'",
                                                observacion          = " [ UPDATE PASSWORD BY ADMIN '.$Date.' ], [ Admin '.$idAdmin.' IP: '.$IP.'] "
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
                /*</Actualizar contraseña - Solo admin>*/

                return $JSON_RESULT;
            }
        /*</Method UpdatePassword>*/


        
        
    }

    