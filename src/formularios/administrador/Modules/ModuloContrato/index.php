
<!-- -->
<!DOCTYPE html>
<?php session_start(); ?>
<?php if(isset( $_SESSION['administrador-session'])){ ?>

    <html lang="en">
        <!-- -->
            <head>
                <title> Multiagente  | Contrato</title>
                <?php include_once('../../head.php'); ?>     
                <style>
                    .iframe-container {
                        position: relative;
                        overflow: hidden;
                        width: 100%;
                        padding-top: 56.25%; /* 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
                    }

                    .iframe-container iframe {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: 0;
                    }
                </style>
            </head>
        <!-- -->
        <!-- -->
        <body class="hold-transition sidebar-mini layout-fixed">

            <div id="body-main-div"  class="body-main">
                <div class="center">
                    <img  class="img-fluid"  src="https://c.tenor.com/XK37GfbV0g8AAAAi/loading-cargando.gif"  />       
                </div>                
            </div>

            <div id="id-main" class="opacidad" >             
                
                

                    
                    
                        <div>
                            <!-- Content Header (Page header) -->
                            
                            <!-- /.content-header -->

                            <!-- Main content -->
                            <section class="content">
                                <div class="">                        
                                    <div class="">
                                        <br><br>
                                        <div class="row">
                                            <div class="col-sm-12 d-flex justify-content-end">   
                                                <a 
                                                    href="/administrador/Modules/ModuleRegistro/"  
                                                    class="btn btn-secondary btn-block"   
                                                    >Regresar</a>
                                            </div>         
                                        </div><br>
                                        <div class="row">
                                            <div class="col-sm-12">
                                                <center>
                                                    <img class="img-fluid" style="width:100px;height:100px;" src="/administrador/Modules/ModulesImage/iconos-sw_256-01.png" >
                                                </center>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-sm-12 text-center h3" >
                                                Contrato
                                            </div>
                                        </div>
                                        <div  class="iframe-container" id="contraro-div"></div> 
                                    </div>                    
                                </div><!-- /.container-fluid -->
                            </section>
                            <!-- /.content -->
                        </div>
                
                

                        <?php include_once('ModalImagen.php');?> 
                        <?php include_once('../ModulePugins/Modals/warning.php');?> 
                        <?php include_once('../ModulePugins/Modals/succes.php');?> 
                        <?php include_once('../ModulePugins/Modals/error.php');?> 
                            
                            
                    

                        <?php include_once('ScriptStaticEvents.php');?>  

                        
                    <!-- footer -->
                        <?php include_once('../../footer.php');?>     
                    <!-- footer -->  
                </div>
                <!-- complement -->
                <?php include_once('../../complement.php');?>
                <!-- complement -->
           
           
            
        
            
        </body>
        <!-- -->
    </html>
<?php }else{   header('Location: /administrador/closeSession/controller/closeSession.php'); }?>
