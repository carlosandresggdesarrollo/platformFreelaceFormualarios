


<!-- Modal de Ayuda -->
<div class="modal fade" id="modalAyuda" tabindex="-1" role="dialog" aria-labelledby="tituloAyuda" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content" style="border-radius:50px" >
      <div class="modal-header bg-info text-white">
        <h5 class="modal-title" id="tituloAyuda">¿Necesitas ayuda?</h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
         <!-- Bloque de ayuda -->
        <div class="container my-4">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0 " style="color:#ffff;" ><i class="fas fa-info-circle mr-2"></i>Ayuda sobre los Planes de Membresía</h5>
                </div>
                <div class="card-body">

                <p><strong>¿Qué significa "vinculación"?</strong><br>
                Una vinculación es una conexión con una cuenta de WhatsApp...</p>

                <p><strong>¿Qué es un "agente"?</strong><br>
                Un agente es una persona a la que puedes enviar información...</p>

                <p><strong>¿Qué es un "bot"?</strong><br>
                El bot ejecuta flujos de chatbot automatizados...</p>

                <p><strong>¿Qué pasa si ya tengo un plan activo?</strong><br>
                Puedes seguir usando todas las funciones según los límites del plan...</p>

                <p><strong>¿Cuál es la duración de los planes?</strong><br>
                Los planes pueden durar un día, un mes o un año...</p>

                <p><strong>¿Cómo cancelo o cambio de plan?</strong><br>
                Desde la misma sección de planes puedes cancelar tu membresía...</p>

                <!-- Botón para mostrar el modal con video -->
                <div class="text-center mt-4">
                    <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#videoModal">
                        <i class="fas fa-play-circle"></i> Ver video explicativo
                    </button>
                </div>

                </div>
            </div>

            <!-- Modal con video -->
            <div class="modal fade" id="videoModal" tabindex="-1" role="dialog" aria-labelledby="videoModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div class="modal-content"> 

                    <div class="modal-header">
                        <h5 class="modal-title" id="videoModalLabel">Video explicativo de planes</h5>
                        <button type="button" class="close" id="ayuda-close"  aria-label="Cerrar">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <div class="modal-body p-0">
                        <div class="embed-responsive embed-responsive-16by9">
                        <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/TU_VIDEO_ID" allowfullscreen></iframe>
                        </div>
                    </div>

                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <center>
                <button type="button" class="btn btn-success rounded-pill px-4 shadow-sm" data-dismiss="modal">
                😊 Entendido
                </button>
            </center>
        </div>
    </div>
  </div>
</div>

<script type="module">
    $(document).ready(() =>{  
        $('#ayuda-close').on('click', function() {
            $('#videoModal').modal('hide');
        });
    });
</script>