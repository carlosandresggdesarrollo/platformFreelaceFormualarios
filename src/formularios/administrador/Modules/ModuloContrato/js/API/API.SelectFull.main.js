// Metodo de ListaCostos             
const ConsultarTodoAPI = async() => {   
   
    const Peticion = await $.ajax({
        url: "/administrador/Modules/ModuloContrato/api/administrador.controller.select.full.php",
        type: 'post',
        async: false,
        dataType: "json",
    });              
    const Respuesta = Peticion;  
    return Respuesta;   
                         
}

export default ConsultarTodoAPI;
