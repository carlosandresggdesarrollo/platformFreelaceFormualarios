const login = () => {     
    let EntradaUsuario      = $('#login-usuario-administrador').val();
    let EntradaContrasena   = $('#login-contrasena-administrador').val();
   
    EntradaUsuario      = EntradaUsuario.replace(/"/, '');
    EntradaContrasena   = EntradaContrasena.replace(/"/, '');

    $('#login-usuario-administrador').val(EntradaUsuario);
    $('#login-contrasena-administrador').val(EntradaContrasena);

    let informationForm     = new FormData(document.getElementById("form-login-administrador")); 
    
    let TockenOfdoor2doordoor2door       = $('#tocken-administradors-01198756765345431234534').val();
    informationForm.append("TockenOfdoor2doordoor2door",TockenOfdoor2doordoor2door);   
               
    if(EntradaContrasena != '' && EntradaUsuario != ''){
        $.ajax({
            url: "/administrador/login/controller/controller.login.php",
            type: 'post',
            data: informationForm,        
            dataType:"json",
            contentType:false,
            processData:false,
            cache:false    
        }).then((result) => {   console.log(result)                       
            if (result.message == 'Good'){
                if (result.userValitor == 'correct_user_door2door'){
                    $('#login-usuario-administrador').val('');
                    $('#login-contrasena-administrador').val('');
                    localStorage.setItem('JSON_door2door_INFOMATION',JSON.stringify((result)) )

                    window.location.href = "/administrador/Modules/Welcome/"
                }else{
                    $('#message-warning-administrador').html('');
                    $('#message-warning-administrador').html('CONTRASEÑA O USUARIO INCORRECTO');
                    $('#modal-message-warning-administrador').modal('show');                                      
                }   
            }else{
                $('#message-warning-administrador').html('');
                $('#message-warning-administrador').html('¡INTÉNTELO MÁS TARDE!');
                $('#modal-message-warning-administrador').modal('show');
            }                            
        }).catch((error) => {
            console.log(error);
            $('#mensaje-advertencia').html('');
            $('#mensaje-advertencia').html('INTENTELO MAS TARDE');
            $('#modal-mensajes-advertencia-administrador').modal('show');
        });
    }else{                               
        $('#message-warning-administrador').html('');
        $('#message-warning-administrador').html('¡Favor  de capturar los campos obligatorios! ');
        $('#modal-message-warning-administrador').modal('show'); 
        
    }                   
}


export default login;