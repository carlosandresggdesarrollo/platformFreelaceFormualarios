// Metodo de ListaCostos             
const ActualizarAPI = async(PlataformaForm) => {   
    let TockenOfdoor2doordoor2door = $('#tocken-administradors-01198756765345431234534').val();
    PlataformaForm.append("TockenOfPlatformdoor2door",TockenOfdoor2doordoor2door);               
    const Peticion = await $.ajax({
        url: "/administrador/Modules/ModuleSettingsCompanies/api/administrador.controller.create.php",
        type: 'post',
        async: false,
        data: PlataformaForm,        
        dataType:"json",
        contentType:false,
        processData:false,
        cache:false            
    });              
    const Respuesta = Peticion;  
    return Respuesta;                            
}
export default ActualizarAPI;
