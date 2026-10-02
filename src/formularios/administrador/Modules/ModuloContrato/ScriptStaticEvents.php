<script type="module">
    /*<import librarys>*/ 
        import functionSelectFullAPI    from './js/API/API.SelectFull.main.js';
    /*<import librarys>*/ 
    
    


    $(document).ready(() =>
    {  

        setTimeout(() => {
            /*<CARGAR HIDE>*/
                $('#id-main').removeClass('opacidad');
                $('#body-main-div').removeClass('body-main');
                $('#body-main-div').hide();
            /*</CARGAR HIDE>*/
        }, 1500);

              
            /*<Consultar toda la iformacion>*/ 
                const functionSFA = functionSelectFullAPI().
                then( (result) => {  console.log(result);
                    if(result){                                                           
                        if(result.message == 'Good'){
                            /*<Consulta exitosa>*/
                                let Arrays = [];
                                Arrays = result.information;                                
                                if(Arrays.length > 0){
                                    $('#contraro-div').html(`<center><iframe  frameborder="0"  src="${Arrays[0].contrato}" ></iframe></center>`);                                    
                                }else{
                                    $('#contraro-div').html(`Aún no se ha cargado ningún contrato.`);  
                                }                           
                            /*<Consulta exitosa>*/                        
                        }else{
                           /*<Error de query>*/ 
                                $('#message-warning-platform').html("");
                                $('#message-warning-platform').html('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo en unos segundos o avísanos si el problema sigue.');
                                $('#modal-message-warning-platform').modal('show');
                            /*</Error de query>*/  
                        }       
                    }                           
                }).catch( (err) => {  console.log(err);
                    /*<Error de query>*/ 
                        $('#message-warning-platform').html("");
                        $('#message-warning-platform').html('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo en unos segundos o avísanos si el problema sigue.');
                        $('#modal-message-warning-platform').modal('show');
                    /*</Error de query>*/  
                });
            /*<Consultar toda la iformacion>*/ 

         
    });
</script>