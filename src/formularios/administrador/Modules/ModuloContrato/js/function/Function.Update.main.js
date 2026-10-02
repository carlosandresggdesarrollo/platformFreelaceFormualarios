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
                    $('#message-succes-administrador').html('¡Éxito! Tu contrato ya está guardado.');
                    $('#modal-message-succes-administrador').modal('show'); 

                    $('#create-razonsocial-administrador').removeClass("is-invalid");
                    $('#create-celular-administrador').removeClass("is-invalid");                  

                    $('#create-id-administrador').val(result.idEmpresa);
                    
                }else{

                    $('#message-warning-administrador').html("");
                    $('#message-warning-administrador').html('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo en unos segundos o avísanos si el problema sigue.');
                    $('#modal-message-warning-administrador').modal('show');

                }
            }else{

                $('#message-warning-administrador').html("");
                $('#message-warning-administrador').html('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo en unos segundos o avísanos si el problema sigue.');
                $('#modal-message-warning-administrador').modal('show');
                
            }                           
        }).catch( (err) => { 

            $('#message-warning-administrador').html("");
            $('#message-warning-administrador').html('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo en unos segundos o avísanos si el problema sigue.');
            $('#modal-message-warning-administrador').modal('show');

        });

    }else{
        $('#message-warning-administrador').html("");
        $('#message-warning-administrador').html('¡Favor de capturar los campos obligatorios !');
        $('#modal-message-warning-administrador').modal('show');;

  
        $('#create-razonsocial-administrador').addClass("is-invalid");
        $('#create-celular-administrador').addClass("is-invalid");
       
        
    }
  
}
export default Actualizar;
