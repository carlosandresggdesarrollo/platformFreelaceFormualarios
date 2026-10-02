<?php

/*<VERIFICACION DE SESSION ACTIVA>*/
    session_start();
    if(isset( $_SESSION['administrador-session'])){
/*<VERIFICACION DE SESSION ACTIVA>*/
/*<VALIDAION REGRESO DEL USUARIO>*/
    if(isset( $_SESSION['administrador-tipoUsuario'])){  
        if($_SESSION['administrador-estatus'] == 'ACTIVO' || $_SESSION['administrador-estatus'] == 'CONFIRMADA' ){
            header('Location: /administrador/Modules/Welcome/');
        }else{
            header('Location: /administrador/closeSession/controller/closeSession.php'); 
        }
       
    }
/*</VALIDAION REGRESO DEL USUARIO>*/

?>

    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" lang="es" xml:lang="es">
        <head>
            <title> Multiagente  </title>
            <?php include_once('../head.php'); ?>   
            <link 
                rel     ="icon" 
                type    ="image/x-icon" 
                href    ="/administrador/Modules/ModulesImage/iconos-sw_256-01.png"
                >
            <style>
                html,body { 
                    height: 100%; 
                }

                .global-container{
                    height:100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #ffff;
                }

                form{
                    padding-top: 10px;
                    font-size: 14px;
                    margin-top: 30px;
                }

                .card-title{ font-weight:300; }

                .btn{
                    font-size: 14px;
                    margin-top:20px;
                }


                .login-form{ 
                    width:330px;
                    margin:20px;
                }

                .sign-up{
                    text-align:center;
                    padding:20px 0 0;
                }

                .alert{
                    margin-bottom:-30px;
                    font-size: 13px;
                    margin-top:20px;
                }
                .btn-primary {
                    background:    #cfcacb;

                }
                /* Añadir animación de fade-in */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }

                body {
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    background-image: url('/recursos/LOGIN/Recurso174.png');
                    background-attachment: fixed;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }

                .content {
                    color: white;
                    text-align: center;
                    padding: 50px;
                }

                .transparente {
                    /* Estilos para el contenedor principal */
                    opacity: 0.9;
                }
                .boton-degradado {
                    background: linear-gradient(to right, #2467DD, #DD003E);
                    color: #FFFF;
                    padding: 10px 30px;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                    text-align: center;
                    display: inline-block;
                    }

                    .boton-degradado:hover {
                    background: linear-gradient(to right, #DD003E, #2467DD);
                    }
             
                            
            </style>
        </head>
        
        <body>  
        <div id="body-main-div"  class="body-main">

            <div class="center">
                <img  class="img-fluid"  src="https://c.tenor.com/XK37GfbV0g8AAAAi/loading-cargando.gif"  />       
            </div>

        </div>

        <div id="id-main" class="opacidad" >
   
        
            <div class="container fade-in transparente" style="width:400px;border: none;" >
                <div class="global-container fade-in">
                    <div class="card login-form fade-in ">
                            <div class="row fade-in">
                                <div class="col-sm-12 fade-in">
                                    <center>
                                        <img class="img-fluid fade-in" style="width:200px;height:150px;" src="/recursos/LOGIN/Recurso173.png" >
                                    </center>
                                </div>
                            </div>
                            <div class="row fade-in">
                                <div class="col-sm-12 fade-in">
                                    <center>
                                        <img class="img-fluid fade-in" style="width:400px;height:100px;" src="/administrador/Modules/ModulesImage/logo.png" >
                                    </center>
                                </div>
                            </div>
                            <div class="row fade-in boton-degradado">
                                <div class="col-sm-12 fade-in">
                                    <center>
                                        <h3 style="color: #FFFF;">Iniciar sesión</h3>
                                    </center>
                                </div>
                            </div>

                        <div class="card-body fade-in">     
                            <div class="card-text fade-in">                            
                                <form id="form-login-administrador">
                                    <div class="form-group fade-in">
                                        <div class="row fade-in">
                                            <div class="col-sm-12 h6 fade-in">
                                                <label>Usuario</label>
                                            </div>
                                        </div>
                                        <input 
                                            type="text" 
                                            value="" 
                                            placeholder="Usuario" 
                                            class="form-control" 
                                            id="login-usuario-administrador"  
                                            name="login-usuario-administrador" 
                                            aria-describedby="emailHelp"
                                            onkeypress="return ( 
                                                (event.charCode >= 48 && event.charCode <= 57) || 
                                                (event.charCode >= 65 && event.charCode <= 90) ||
                                                (event.charCode >= 97 && event.charCode <= 122) ||
                                                (event.charCode >= 192 && event.charCode <= 255) ||  
                                                (event.charCode == 32) || 
                                                (event.charCode == 46) ||  
                                                (event.charCode == 44) ||  
                                                (event.charCode >= 65 && event.charCode <= 90)    
                                            )">
                                    </div>
                                    <div class="form-group fade-in">
                                        <div class="row fade-in">
                                            <div class="col-sm-12 h6 fade-in">
                                                <label>Contraseña</label>
                                            </div>
                                        </div>
                                        <input type="password" placeholder="Contraseña" class="form-control" id="login-contrasena-administrador" name="login-contrasena-administrador">
                                    </div>
                                </form>
                                <div class="form-group fade-in">
                                    <input type="checkbox" onclick="togglePasswordVisibility()"> Mostrar contraseña
                                </div>
                                <div class="row fade-in">
                                    <div class="col-sm-12 fade-in">
                                        <center>
                                            <button id="button-inicialr-sesion-administrador" class="btn btn-primary btn-block fade-in" style="color:#000;">Ingresar</button>
                                        </center>
                                    </div>
                                </div>
                                <div class="row fade-in">
                                    <div class="col-sm-12 fade-in">
                                        <center>
                                            <button href="/administrador/Modules/ModuleRegistro/" id="button-registro-sesion-administrador" class="btn btn-primary btn-block fade-in" style="color:#000;">Registrar</button>
                                        </center>
                                    </div>
                                </div>
                                <div class="row fade-in">
                                    <div class="col-sm-12 fade-in">
                                        <center>
                                            <button href="/administrador/newpassword/" id="button-olvido-contrasena-administrador" class="btn btn-primary btn-block fade-in" style="color:#000;">¿Se te olvidó tu contraseña?</button>
                                        </center>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        

                <!-- jQuery -->
                <script src="/administrador/plugins/jquery/jquery.min.js"></script>
                <!-- jQuery UI 1.11.4 -->
                <script src="/administrador/plugins/jquery-ui/jquery-ui.min.js"></script>
                <!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
                <script>
                $.widget.bridge('uibutton', $.ui.button)
                </script>
                <!-- Bootstrap 4 -->
                <script src="/administrador/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
                <!-- ChartJS -->
                <script src="/administrador/plugins/chart.js/Chart.min.js"></script>
                <!-- Sparkline
                <script src="/administrador/plugins/sparklines/sparkline.js"></script> -->
                <!-- JQVMap -->
                <script src="/administrador/plugins/jqvmap/jquery.vmap.min.js"></script>
                <script src="/administrador/plugins/jqvmap/maps/jquery.vmap.usa.js"></script>
                <!-- jQuery Knob Chart -->
                <script src="/administrador/plugins/jquery-knob/jquery.knob.min.js"></script>
                <!-- daterangepicker -->
                <script src="/administrador/plugins/moment/moment.min.js"></script>
                <script src="/administrador/plugins/daterangepicker/daterangepicker.js"></script>
                <!-- Tempusdominus Bootstrap 4 -->
                <script src="/administrador/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js"></script>
                <!-- Summernote -->
                <script src="/administrador/plugins/summernote/summernote-bs4.min.js"></script>
                <!-- overlayScrollbars -->
                <script src="/administrador/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>
                <!-- AdminLTE App -->
                <script src="/administrador/dist/js/adminlte.js"></script>
                <!-- AdminLTE for demo purposes -->
                <script src="/administrador/dist/js/demo.js"></script>

                <!-- AdminLTE dashboard demo (This is only for demo purposes) 
                <script src="/administrador/dist/js/pages/dashboard.js"></script>-->

                <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.12.1/datatables.min.css"/>
                <script type="text/javascript" src="https://cdn.datatables.net/v/dt/dt-1.12.1/datatables.min.js"></script>
        

                <?php include_once('../Modules/ModulePugins/Modals/warning.php');   ?> 
                <?php include_once('../Modules/ModulePugins/Modals/succes.php');    ?> 
                <?php include_once('../Modules/ModulePugins/Modals/error.php');     ?> 
                <script>                
                    const togglePasswordVisibility = () => {
                        var passwordInput = document.getElementById('login-contrasena-administrador');
                        var passwordType = passwordInput.type === 'password' ? 'text' : 'password';
                        passwordInput.type = passwordType;
                    }
                </script>
            
                <script type="module">               
                
                    $( document ).ready( () => {  
                        if(!Smarphone()){
                            /*<CARGAR HIDE>*/
                                $('#id-main').removeClass('opacidad');
                                $('#body-main-div').removeClass('body-main');
                                $('#body-main-div').hide();
                            /*</CARGAR HIDE>*/

                            $('#login-usuario-administrador').keypress(function(e){  if(e.which == 13){   const pro = proceso(); }   });
                            $('#login-contrasena-administrador').keypress(function(e){  if(e.which == 13){   const pro = proceso(); }   });

                            $('#button-registro-sesion-administrador').on('click', ()=>{  window.location.href = '/administrador/Modules/ModuleRegistro/';  });
                            $('#button-olvido-contrasena-administrador').on('click', ()=>{  window.location.href = '/administrador/newpassword/';  });

                            $('#button-inicialr-sesion-administrador').on( 'click', () => { const pro = proceso(); });

                            const proceso = () => {
                                /*<CARGAR HIDE>*/
                                    $('#id-main').addClass('opacidad');
                                    $('#body-main-div').addClass('body-main');
                                    $('#body-main-div').show();
                                /*</CARGAR HIDE>*/

                                setTimeout(() => {
                                    
                            
                                        let Usuario     = $('#login-usuario-administrador').val();
                                        let Password    = $('#login-contrasena-administrador').val();

                                        if( Usuario != ''){
                                            if(Password != ''){
                                                $.ajax({
                                                    url: "/administrador/login/controller/controller.login.php",
                                                    type: 'post',
                                                    data: {                                           
                                                        Usuario:       Usuario,
                                                        Password:      Password
                                                    },        
                                                    dataType:"json",  
                                                }). 
                                                then((result) => {  console.log(result)
                                                    if(result){

                                                        if(result.message == 'ERROR SISTEMA'){
                                                            /*<CARGAR HIDE>*/
                                                                $('#id-main').removeClass('opacidad');
                                                                $('#body-main-div').removeClass('body-main');
                                                                $('#body-main-div').hide();
                                                            /*</CARGAR HIDE>*/
                                                            $('#message-warning-administrador').html('');
                                                            $('#message-warning-administrador').html('Por el momento la aplicación no está disponible  <br>'+  
                                                                                                        'Por favor contactar con soporte');
                                                            $('#modal-message-warning-administrador').modal('show');
                                                        }else if(result.message == 'USUARIO PENDIENTE'){
                                                            /*<CARGAR HIDE>*/
                                                                $('#id-main').removeClass('opacidad');
                                                                $('#body-main-div').removeClass('body-main');
                                                                $('#body-main-div').hide();
                                                            /*</CARGAR HIDE>*/
                                                            $('#message-warning-administrador').html('');
                                                            $('#message-warning-administrador').html('Necesita validar su correo para validar su cuenta');
                                                            $('#modal-message-warning-administrador').modal('show');

                                                        }else if(result.message == 'USUARIO NO EXISTE'){
                                                            /*<CARGAR HIDE>*/
                                                                $('#id-main').removeClass('opacidad');
                                                                $('#body-main-div').removeClass('body-main');
                                                                $('#body-main-div').hide();
                                                            /*</CARGAR HIDE>*/
                                                            $('#message-warning-administrador').html('');
                                                            $('#message-warning-administrador').html('Usuario y/o contraseña incorrecta');
                                                            $('#modal-message-warning-administrador').modal('show');
                                                        }else if(result.message == 'Good'){
                                                            let NuevoJSON = {
                                                                    idUsuario:      result.RESPUESTA_PASO_1.idUsuario,
                                                                    tipoUsuario:    result.RESPUESTA_PASO_1.tipoUsuario,
                                                                    estatus:        result.RESPUESTA_PASO_1.estatus,
                                                                    sesion:         result.RESPUESTA_PASO_1.sesion
                                                                }; 

                                                                /*<CODIFICACION>*/
                                                                    var encoded = btoa(JSON.stringify(NuevoJSON));
                                                                    localStorage.setItem("JSON_INFORMACION", encoded);
                                                                /*<CODIFICACION>*/
                                                                
                                                                let tipoUsuario = result.RESPUESTA_PASO_1.tipoUsuario;

                                                                if(tipoUsuario == 'ADMINISTRADOR'){

                                                                    location.href ='/administrador/Modules/Welcome/';   

                                                                }else{

                                                                    $.ajax({
                                                                        url: "/administrador/main/controller/controller.update.session.php",
                                                                        type: 'post',
                                                                        data: {
                                                                            idSesion:       result.RESPUESTA_PASO_1.idSesion,
                                                                            idUsuario:      result.RESPUESTA_PASO_1.idUsuario,
                                                                            sesion:         result.RESPUESTA_PASO_1.sesion
                                                                        },        
                                                                        dataType:"json",  
                                                                    }).then((result) => {  console.log(result)
                                                                        if(result){
                                                                            if(result.message == 'Good'){
                                                                                /*<CARGAR HIDE>*/
                                                                                    $('#id-main').removeClass('opacidad');
                                                                                    $('#body-main-div').removeClass('body-main');
                                                                                    $('#body-main-div').hide();
                                                                                /*</CARGAR HIDE>*/
                                                                                $('#message-warning-administrador').html('');
                                                                                $('#message-warning-administrador').html('El usuario no tiene permiso de usar la aplicación móvil <br>'+  
                                                                                                                                    'Por favor contactar con soporte');
                                                                                $('#modal-message-warning-administrador').modal('show');

                                                                            }else{
                                                                                /*<CARGAR HIDE>*/
                                                                                    $('#id-main').removeClass('opacidad');
                                                                                    $('#body-main-div').removeClass('body-main');
                                                                                    $('#body-main-div').hide();
                                                                                /*</CARGAR HIDE>*/
                                                                                $('#message-warning-administrador').html('');
                                                                                $('#message-warning-administrador').html('Por el momento la aplicación no está disponible  <br>'+  
                                                                                                                            'Por favor contactar con soporte');
                                                                                $('#modal-message-warning-administrador').modal('show');
                                                                            }

                                                                        }else{
                                                                            /*<CARGAR HIDE>*/
                                                                                $('#id-main').removeClass('opacidad');
                                                                                $('#body-main-div').removeClass('body-main');
                                                                                $('#body-main-div').hide();
                                                                            /*</CARGAR HIDE>*/
                                                                            $('#message-warning-administrador').html('');
                                                                            $('#message-warning-administrador').html('Por el momento la aplicación no está disponible  <br>'+  
                                                                                                                            'Por favor contactar con soporte');
                                                                            $('#modal-message-warning-administrador').modal('show');
                                                                        }
                                                                    }).catch((err)=> {
                                                                        /*<CARGAR HIDE>*/
                                                                            $('#id-main').removeClass('opacidad');
                                                                            $('#body-main-div').removeClass('body-main');
                                                                            $('#body-main-div').hide();
                                                                        /*</CARGAR HIDE>*/
                                                                        $('#message-warning-administrador').html('');
                                                                        $('#message-warning-administrador').html('Por el momento la aplicación no está disponible  <br>'+  
                                                                                                                            'Por favor contactar con soporte');
                                                                        $('#modal-message-warning-administrador').modal('show');
                                                                    });
                                                                }                      

                                                        }

                                                    }else{
                                                        /*<CARGAR HIDE>*/
                                                            $('#id-main').removeClass('opacidad');
                                                            $('#body-main-div').removeClass('body-main');
                                                            $('#body-main-div').hide();
                                                        /*</CARGAR HIDE>*/
                                                        $('#message-warning-administrador').html('');
                                                        $('#message-warning-administrador').html('Por el momento la aplicación no está disponible  <br>'+  
                                                                                                                            'Por favor contactar con soporte');
                                                        $('#modal-message-warning-administrador').modal('show');
                                                    }
                                                }).catch((err) => {
                                                    /*<CARGAR HIDE>*/
                                                        $('#id-main').removeClass('opacidad');
                                                        $('#body-main-div').removeClass('body-main');
                                                        $('#body-main-div').hide();
                                                    /*</CARGAR HIDE>*/
                                                    $('#message-warning-administrador').html('');
                                                    $('#message-warning-administrador').html('Por el momento la aplicación no está disponible  <br>'+  
                                                                                                                            'Por favor contactar con soporte');
                                                    $('#modal-message-warning-administrador').modal('show');
                                                });                                    

                                            }else{
                                                /*<CARGAR HIDE>*/
                                                    $('#id-main').removeClass('opacidad');
                                                    $('#body-main-div').removeClass('body-main');
                                                    $('#body-main-div').hide();
                                                /*</CARGAR HIDE>*/
                                                $('#message-warning-administrador').html('');
                                                $('#message-warning-administrador').html('Favor de capturar la contraseña');
                                                $('#modal-message-warning-administrador').modal('show');

                                            }
                                        }else{
                                            /*<CARGAR HIDE>*/
                                                $('#id-main').removeClass('opacidad');
                                                $('#body-main-div').removeClass('body-main');
                                                $('#body-main-div').hide();
                                            /*</CARGAR HIDE>*/
                                            $('#message-warning-administrador').html('');
                                            $('#message-warning-administrador').html('Favor de capturar el usuario');
                                            $('#modal-message-warning-administrador').modal('show');

                                        }
                                
                                }, 700);
                            }
                        }else{
                            window.location.href = "/d2dVisitador/main/"
                        } 
                    });
                    const Smarphone = () => {
                        let navegador = navigator.userAgent;
                        if (    
                                navigator.userAgent.match(/Android/i)       || 
                                navigator.userAgent.match(/webOS/i)         || 
                                navigator.userAgent.match(/iPhone/i)        || 
                                navigator.userAgent.match(/iPad/i)          || 
                                navigator.userAgent.match(/iPod/i)          || 
                                navigator.userAgent.match(/BlackBerry/i)    || 
                                navigator.userAgent.match(/Windows Phone/i) 
                            ) {
                            console.log("Estás usando un dispositivo móvil!!");
                            return true;
                        } else {
                            console.log("No estás usando un móvil");
                            return false;
                        }
                    }
                </script>
            </div>
        </div>
        </body>
    </html>
<?php }else{   header('Location: /administrador/main/');  } ?>


            