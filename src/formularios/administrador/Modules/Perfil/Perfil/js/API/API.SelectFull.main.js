// Metodo de ListaCostos             
const ConsultarTodoAPI = async() => {   
    let TockenOfdoor2doordoor2door = $('#tocken-administradors-01198756765345431234534').val();   
    const Peticion = await $.ajax({
        url: "/administrador/Modules/ModuleSettingsCompanies/api/administrador.controller.select.full.php",
        type: 'post',
        async: false,
        dataType: "json",
        data: { TockenOfdoor2doordoor2door:TockenOfdoor2doordoor2door }        
    });              
    const Respuesta = Peticion;  
    return Respuesta;   
                         
}

export default ConsultarTodoAPI;
