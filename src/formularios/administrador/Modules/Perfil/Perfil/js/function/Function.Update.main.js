import Update       from '../API/API.Update.main.js';

// ActualizarUsuarioAPI Usuario            
const Actualizar = async() => { 


    let razonsocial =  $('#create-razonsocial-administrador').val().replace(/['"`]/, '');
    let celular     =  $('#create-celular-administrador').val().replace(/['"`]/, '');
    
    $('#create-razonsocial-administrador').val(razonsocial);
    $('#create-celular-administrador').val(celular)




    if(razonsocial != '' && celular ){         
        let informationForm = new FormData(document.getElementById("form-create-administrador")); 
        const FuUpdate = await Update( informationForm ).
        then( (result) => {  console.log(result)   
            if(result){
                if(result.message == 'Good'){

                    $('#message-succes-administrador').html("");
                    $('#message-succes-administrador').html('CREACIÓN EXITOSA');
                    $('#modal-message-succes-administrador').modal('show'); 

                    $('#create-razonsocial-administrador').removeClass("is-invalid");
                    $('#create-celular-administrador').removeClass("is-invalid");                  

                    $('#create-id-administrador').val(result.idEmpresa);
                    
                }else{

                    $('#message-error-administrador').html("");
                    $('#message-error-administrador').html('¡ERROR AL RECARGAR LA PAGUINA!');
                    $('#modal-message-error-administrador').modal('show');

                }
            }else{

                $('#message-error-administrador').html("");
                $('#message-error-administrador').html('¡ERROR AL RECARGAR LA PAGUINA!');
                $('#modal-message-error-administrador').modal('show');
                
            }                           
        }).catch( (err) => { 

            $('#message-error-administrador').html("");
            $('#message-error-administrador').html('¡ERROR AL RECARGAR LA PAGUINA!');
            $('#modal-message-error-administrador').modal('show');

        });

    }else{
        $('#message-error-administrador').html("");
        $('#message-error-administrador').html('¡Favor de capturar los campos obligatorios !');
        $('#modal-message-error-administrador').modal('show');;

  
        $('#create-razonsocial-administrador').addClass("is-invalid");
        $('#create-celular-administrador').addClass("is-invalid");
       
        
    }
  
}
export default Actualizar;
