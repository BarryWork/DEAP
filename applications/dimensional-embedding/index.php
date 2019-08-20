<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Multidimensional Embedding</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <!-- <link href="/css/bootstrap.css" rel="stylesheet"> -->
    <!-- <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <link href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.7/themes/vader/jquery-ui.css" rel="stylesheet" type="text/css"/>
    <link rel="stylesheet" href="css/all.css">
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
   <!-- <link rel="stylesheet" type="text/css" href="/js/highslide/highslide.css" /> -->

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Fav and touch icons -->
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/img/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/img/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/img/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="/img/apple-touch-icon-57-precomposed.png">
    <link rel="shortcut icon" href="/img/favicon.png">

    <link href="css/bootstrap-select.min.css" rel="stylesheet" type="text/css"/>
  </head>
  <body>

    <!-- http://mmil-dataportal.ucsd.edu:3000/applications/SurfaceViewerSS/index.php?subjid=Y0181,Y0368&visitid=Y0181,Y0368 -->


<nav class="navbar navbar-default navbar-inverse navbar-fixed-top" role="navigation">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">Multi-dimensional embedding <span class="project_name"></span></a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav">
        <li><a href="/index.php">Home</a></li>
        <!-- <li><a href="/applications/Sets/index.php">Set Definitions</a></li> -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink4" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="direction"></span> <span class="caret"></span>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink4">
            <li><a class="dropdown-item direc" href="#" value="By participants">By participants</a></li>
            <li><a class="dropdown-item direc" href="#" value="By variables">By variables</a></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Perplexity <span class="perplexity"></span> <span class="caret"></span>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            <li><a class="dropdown-item perplex" href="#" value="2">2</a></li>
            <li><a class="dropdown-item perplex" href="#" value="10">10</a></li>
            <li><a class="dropdown-item perplex" href="#" value="20">20</a></li>
            <li><a class="dropdown-item perplex" href="#" value="30">30</a></li>
            <li><a class="dropdown-item perplex" href="#" value="40">50</a></li>
            <li><a class="dropdown-item perplex" href="#" value="50">60</a></li>
            <li><a class="dropdown-item perplex" href="#" value="100">100</a></li>
            <li><a class="dropdown-item perplex" href="#" value="150">150</a></li>
            <li><a class="dropdown-item perplex" href="#" value="200">200</a></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Iterations <span class="iterations"></span> <span class="caret"></span>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink2">
            <li><a class="dropdown-item iters" href="#" value="10">10</a></li>
            <li><a class="dropdown-item iters" href="#" value="100">100</a></li>
            <li><a class="dropdown-item iters" href="#" value="200">200</a></li>
            <li><a class="dropdown-item iters" href="#" value="500">500</a></li>
      <li><a class="dropdown-item iters" href="#" value="1000">1,000</a></li>
            <li><a class="dropdown-item iters" href="#" value="5000">5,000</a></li>
            <li><a class="dropdown-item iters" href="#" value="10000">10,000</a></li>
            <li role="separator" class="divider"></li>
            <li><a class="dropdown-item iters" href="#" value="stop">Stop calculation</a></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink3" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Color by <span class="colorby"></span> <span class="caret"></span>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink3">
            <li><a class="dropdown-item colby" href="#" value="sex">Sex</a></li>
            <li><a class="dropdown-item colby" href="#" value="age">Age</a></li>
            <li><a class="dropdown-item colby" href="#" value="abcd_site">Site</a></li>
            <li><a class="dropdown-item colby" href="#" value="high.educ">Education</a></li>
            <li><a class="dropdown-item colby" href="#" value="household.income">Income</a></li>
            <li><a class="dropdown-item colby" href="#" value="race.ethnicity">Race/Ethnicity</a></li>
            <li><a class="dropdown-item colby" href="#" value="rel_relationship">Family relationship</a></li>
            <li><a class="dropdown-item colby" href="#" value="rel_family_id">Family ID</a></li>
            <li><a class="dropdown-item colby" href="#" value="dti_manufacturers_modelname">Scanner Model</a></li>
            <li role="separator" class="divider"></li>
            <li><a class="dropdown-item colby" href="#" value="blots1">Render artistic 1</a></li>
            <li><a class="dropdown-item colby" href="#" value="blots2">Render artistic 2</a></li>
          </ul>
        </li>

        <li> <select id="participantsets"></select> </li>

      
        <!-- <li><a href="#help-info-box" data-toggle="modal">Help</a></li> -->
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>


 <?php 
   session_start();

   include("../../code/php/AC.php");
   $user_name = check_logged(); /// function checks if visitor is logged.

   if (isset($_SESSION['project_name']))
      $project_name = $_SESSION['project_name'];

   echo('<script type="text/javascript"> user_name = "'.$user_name.'"; project_name = "'.$project_name.'"; </script>');

 ?>


 <div class="container-fluid">
   <div class="row">
     <div class="col-md-12">
       <p class="tut-p">This application visualizes high dimensional data by embedding them in two dimensions.</p>
     </div>
   </div>
   <div class="row">
     <div class="col-md-3">
       <form class="form-group" style="margin-top: 20px;">
         <label for="#sets">Select a set of variables to start or <a href="/applications/Sets/index.php">create a new set first</a></label>
         <select class="form-control" id="sets"></select>
       </form>
     </div>
   </div>
   <div class="row">
     <div id="start" class="col-xs-12">
       <svg id="graph" style="background-color: white;"></svg>
     </div>
   </div>
   <div class="row">
     <div class="col-md-12">
       <p class="tut-p">There are two major modes for this application. The default setting <i>By participants</i> visualizes the participants based on the selected subset of measures. The mode <i>By variables</i> will in turn visualize the variables based on the participants. Dots are used to represent participants or variables. The closer the dots are to each other the more similar they are given the current set of variables.</p>
       <p class="tut-p">The result of the visualization depends heavily on the selected value for <i>perplexity</i>, which measures the number of neighbors a single data point is influenced by. The value depends on the total number of data points in the analysis and has to be selected based on experimentation. Values of perplexity between 5 and 60 have been suggested in the literature. Most computations require approximately 5,000 iterations until convergence.</p>
       <p class="tut-p">The algorithm implemented on this webpage is called t-distributed stochastic neighbor embedding (<a href="https://github.com/karpathy/tsnejs">t-SNE code</a>, <a href="http://jmlr.csail.mit.edu/papers/volume9/vandermaaten08a/vandermaaten08a.pdf">PDF</a>). A good introduction into how to interprete the results can be found <a href="https://distill.pub/2016/misread-tsne/">here</a>.</p>       
     </div>
   </div>   
   <div class="row">
     <div class="col-md-12">
         <hr>
       <i>A service provided by the Data Analysis and Informatics Core of ABCD</i>
     </div>
   </div>
 </div>       
 <div id="help-info-box" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">
   <div class="modal-dialog">
     <div class="modal-content">
       <div class="modal-body">
          <p style="font-weight: 300;font-size: 14pt;line-height: 24px;">
             This application performs a high-dimensional embedding of the data from participants.
          </p>
          <p>This is an experimental feature, please report any errors by email to hbartsch@ucsd.edu.</p>
       </div>
       <div class="modal-footer">
           <button type="button" data-dismiss="modal" class="btn btn-primary">Close</button>
       </div>
     </div>
   </div>
 </div>

                    
<!-- Loading animation container -->
<div class="loading" style="display: none; position: absolute; left: 50%, top: 10%;">
    <!-- We make this div spin -->
    <div class="spinner">
        <!-- Mask of the quarter of circle -->
        <div class="mask">
            <!-- Inner masked circle -->
            <div class="maskedCircle"></div>
        </div>
    </div>
    <div style="color: black; position: absolute; left: 30px; top: 30px; width: 150px;" id="step-information">This computation will take a long time...</div>
</div>
<div id="place-for-popups"></div>

<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/bootstrap-select.min.js"></script>
<script src="js/d3.v3.min.js"></script>
<script src="js/tsne.js"></script>
<script src="/js/md5-min.js"></script>
<script src="js/svg.min.js"></script>
<script src="js/svg.draw.min.js"></script>
<script src="js/point-in-svg-polygon.min.js"></script>
<script src="js/all.js"></script>

</body>
</html>
