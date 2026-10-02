<?php 
/*<Include classes>*/
    include_once('../../Modules/ModulePugins/administrador.Pugins.GeneratorTocken.php');
/*</Include classes>*/

/*<Import>*/   
    use  administrador\Modules\ModulePugins\GeneradorTocken\GeneradorTocken as GeneradorTocken_index;
/*</Import>*/

/*<Instaciacion de objetos>*/                
    $ObjectToken = new GeneradorTocken_index();
/*</Instaciacion de objetos>*/

/*<Variables generales>*/
    $URL  = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]"; 
    $URLtocken = $URL.'-'.$ObjectToken->generatorTocken('tocken-administradors-01198756765345431234534ASDFSDFSDF-');
?>

<?= include_once('../../Session.php');?>
<!-- -->
<!DOCTYPE html>


    <html lang="en">
        <!-- -->
            <head>
                <title> Multiagente  | Perfil</title>
                <?= include_once('../../head.php'); ?>     
            </head>
        <!-- -->
        <!-- -->
        <body class="hold-transition sidebar-mini layout-fixed">
            
            <div class="wrapper">
                <?= include_once('../../preloader.php');?>

                <?= include_once('../../NavSuperior.php');?>
                <!-- Menu -->
                <?= include_once('../../Menu.php');?>
                
                <!-- Interior-->
                <div class="content-wrapper">
                    <!-- Content Header (Page header) -->
                    <div class="content-header titulo-morado titulo-morado titulo-morado titulo-morado titulo-morado titulo-morado titulo-morado">
                        <div class="container-fluid">
                            <div class="container">
                                <div class="row mb-2">
                                <div class="col-sm-6">
                                    <h1 class="m-0" style="color:#FFFFFF;">Perfil</h1>
                                </div><!-- /.col -->
                                <div class="col-sm-6">
                                    <ol class="breadcrumb float-sm-right">
                                    <li class="breadcrumb-item"><a href="/administrador/Modules/Welcome/" style="color:#FFFFFF;">Inicio</a></li>
                                    <i class="breadcrumb-item " style="color:#FFFFFF;">Perfil</li>
                                    </ol>
                                </div><!-- /.col -->
                                </div><!-- /.row -->
                            </div>
                        </div><!-- /.container-fluid -->
                    </div>
                    <!-- /.content-header -->

                    <!-- Main content -->
                    <section class="content">
                    <div class="container-fluid">                        
                            <div class="container">
                                <div class="row">
                                    <div class="col-sm-2">
                                        <button type="button" class="btn btn-primary"   id="button-create-administrador" style="width:200px;">Guardar</button>    
                                    </div>
                                
                                    <div class="col-sm-8"></div>
                                    <div class="col-sm-2">
                                        <a  type="button" 
                                            href="/administrador/Modules/Welcome/"
                                            class="btn btn-secondary btn-block" 
                                            >
                                        Regresar
                                        </a>
                                    </div>
                                </div><br>
                                <?php ?>
                                <div class="row">
                                    <div class="col-sm-12">
                                        <form id="form-create-administrador" enctype="multipart/form-data">         
                                            <input type="hidden" id="create-id-administrador" name="create-id-administrador"  value="0">  
                                            <div class="row">
                                                <div class="col-sm-12">                  
                                                    <div class="row">
                                                        <div class="col-sm-12  h6" >
                                                            <label>Nombre</label>
                                                        </div>
                                                    </div>
                                                    <input type="text"  id="create-usuario-administrador"  name="create-usuario-administrador" placeholder="Nombre" class="form-control" style="background:#D1F0F5;"   >
                                                </div>
                                            </div><br>
                                            <div class="row">
                                                <div class="col-sm-12">                  
                                                    <div class="row">
                                                        <div class="col-sm-12  h6" >
                                                            <label>Apellido</label>
                                                        </div>
                                                    </div>
                                                    <input type="text"  id="create-contrasena-administrador"  name="create-contrasena-administrador" placeholder="Nombre" class="form-control" style="background:#D1F0F5;"   >
                                                </div>
                                            </div><br> 
                                            <div class="row">
                                                <div class="col-sm-12">                  
                                                    <div class="row">
                                                        <div class="col-sm-12  h6" >
                                                            <label>Usuario</label>
                                                        </div>
                                                    </div>
                                                    <input type="text"  id="create-usuario-administrador"  name="create-usuario-administrador" placeholder="Nombre" class="form-control" style="background:#D1F0F5;"   >
                                                </div>
                                            </div><br>
                                            <div class="row">
                                                <div class="col-sm-12">                  
                                                    <div class="row">
                                                        <div class="col-sm-12  h6" >
                                                            <label>Contraseña</label>
                                                        </div>
                                                    </div>
                                                    <input type="password"  valu="12345"  disabled id="create-contrasena-administrador"  name="create-contrasena-administrador" placeholder="Nombre" class="form-control" style="background:#D1F0F5;"   >
                                                </div>
                                            </div><br>
                                        </form>         
                                            
                                    </div>
                                </div>
                            </div>                    
                        </div><!-- /.container-fluid -->
                    </section>
                    <!-- /.content -->
                </div>
            
                <!-- Script -->

                    <?= include_once('../ModulePugins/Modals/warning.php');?> 
                    <?= include_once('../ModulePugins/Modals/succes.php');?> 
                    <?= include_once('../ModulePugins/Modals/error.php');?> 

                    <?= include_once('ScriptStaticEvents.php');?>                 
                    
                <!-- footer -->
                    <?= include_once('../../footer.php');?>     
                <!-- footer -->  
            </div>
            <!-- complement -->
                <?= include_once('../../complement.php');?>
            <!-- complement -->
            <input  type="hidden" value="<?= $URLtocken ?>" id="tocken-administradors-01198756765345431234534">
            
        
            
        </body>
        <!-- -->
    </html>

