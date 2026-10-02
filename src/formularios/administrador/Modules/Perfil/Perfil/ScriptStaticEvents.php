<script type="module">
    /*<import librarys>*/ 

        import functionCreate           from './js/function/Function.Update.main.js';  
        import functionSelectFullAPI    from './js/API/API.SelectFull.main.js';
    /*<import librarys>*/ 
    
    


    $(document).ready(() =>{  
        /*<Main Module Roles>*/               
            /*<Consultar toda la iformacion>*/ 
                const functionSFA = functionSelectFullAPI().
                then( (result) => {  console.log(result);
                    if(result){                                                                    
                        if(result.message == 'Good'){
                            /*<Consulta exitosa>*/
                                let Arrays = [];
                                Arrays = result.information;
                                if(Arrays.length > 0) {
                                    
                                    $('#create-id-administrador').val(           Arrays[0].idEmpresa);
                                    $('#create-razonsocial-administrador').val(  Arrays[0].razonSocial);
                                    $('#create-rfc-administrador').val(          Arrays[0].rfc);
                                    $('#create-domicilio-administrador').val(    Arrays[0].domicilio);
                                    $('#create-noexterior-administrador').val(   Arrays[0].noExterior);
                                    $('#create-nointerior-administrador').val(   Arrays[0].noInterior);
                                    $('#create-colonia-administrador').val(      Arrays[0].colonia);
                                    $('#create-ciudad-administrador').val(       Arrays[0].ciudad);
                                    $('#create-estado-administrador').val(       Arrays[0].estado);
                                    $('#create-pais-administrador').val(         Arrays[0].pais);
                                    $('#create-codigopostal-administrador').val( Arrays[0].codigoPostal);
                                    $('#create-telefono-administrador').val(     Arrays[0].telefono);
                                    $('#create-celular-administrador').val(      Arrays[0].celular);
                                    $('#create-email-administrador').val(        Arrays[0].email);
                                    $('#imagen-epmresa').html('<img src="'+Arrays[0].imagen+'" style="width:200px;height:200px"  >');


                                }else{
                                }
                                                                  
                                                            
                            /*<Consulta exitosa>*/                        
                        }else{
                           /*<Error de query>*/ 
                                $('#message-error-platform').html("");
                                $('#message-error-platform').html('¡ERROR AL RECARGAR LA PAGUINA!');
                                $('#modal-message-error-platform').modal('show');
                            /*</Error de query>*/  
                        }       
                    }                           
                }).catch( (err) => { 
                    /*<Error de query>*/ 
                        $('#message-error-platform').html("");
                        $('#message-error-platform').html('¡ERROR AL RECARGAR LA PAGUINA!');
                        $('#modal-message-error-platform').modal('show');
                    /*</Error de query>*/  
                });
            /*<Consultar toda la iformacion>*/ 

            /*<Evento creacion de un nuevo>*/
                $('#button-create-administrador').on('click', () =>{ console.log("=>"); const Funresult = functionCreate(); }); 
            /*</Evento creacion de un nuevo>*/

           
        /*</Main Module Roles>*/                                 
    });
</script>