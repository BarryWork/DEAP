<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Medications</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <!-- <link href="/css/bootstrap.css" rel="stylesheet"> -->
    <!-- <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <link href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.7/themes/vader/jquery-ui.css" rel="stylesheet" type="text/css"/>
<!--    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css"> -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" crossorigin="anonymous">
   <!-- <link rel="stylesheet" type="text/css" href="/js/highslide/highslide.css" /> -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      
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

    <!-- <link href="css/bootstrap-select.min.css" rel="stylesheet" type="text/css"/> -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="css/all.css">
      
  </head>
  <body style="overflow: hidden;">

    <!-- http://mmil-dataportal.ucsd.edu:3000/applications/SurfaceViewerSS/index.php?subjid=Y0181,Y0368&visitid=Y0181,Y0368 -->


<nav class="navbar navbar-dark bg-dark fixed-top navbar-expand-lg" role="navigation">
    <!-- Brand and toggle get grouped for better mobile display -->
    <a class="navbar-brand" href="#">Medications <span class="project_name"></span></a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
       <span class="navbar-toggler-icon"></span>
    </button>
      
    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item"><a class="nav-link" href="/index.php">Home</a></li>
        <li class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" id="group-indicator">Parent / Child <span class="caret"></span></a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown" id='select-medication-group'>
                  <a class="dropdown-item" href="#" value="Parent">Parent</a>
                  <a class="dropdown-item active" href="#" value="Child">Child</a>
                </div>
        </li>
        <li class="nav-item dropdown">
           <select class="dropdown-menu" aria-labelledby="navbarDropdown" id='existingFilters'> </select>      
        </li>
        <li class="nav-item"><a class="nav-link" href="#create-new-score" data-toggle="modal">Create</a></li>
      </ul>
       <ul class="navbar-nav ml-auto">
        <li class="nav-item pull-right"><a class="nav-link" href="#help-info-box" data-toggle="modal">Help</a></li>
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>


 <?php 
   session_start();

   include_once("../../code/php/analytics.php");
   include("../../code/php/AC.php");
   $user_name = check_logged(); /// function checks if visitor is logged.

   if (isset($_SESSION['project_name']))
      $project_name = $_SESSION['project_name'];

   echo('<script type="text/javascript"> user_name = "'.$user_name.'"; project_name = "'.$project_name.'"; </script>');

 ?>


 <div class="container-fluid">
     <div class="row-fluid">
       <div id="left" style="height: 100%; width: 100%; overflow: hidden; color: white;" class="col-xs-10">
          <div id="tree-container"></div>
       </div>
       <div class="col-xs-2" style="margin-top: 10px;">
          </div>
     </div>
 </div>
 <div class="pill-navigation">
       <div class="pill-nav">&nbsp;</div>
 </div>
 <div class="size-estimator">
  </div>
 <div class="select-search" style="position: absolute; top: 115px; left: 50px; font-size: 34px; font-weight: 200; white-space: nowrap; color: gray;">
       / <select class="search-type" id="select-search-select">
       </select> /
 </div>

 <div class="control-area">
       <div class="control-up"></div>
       <div class="control-down"></div>
       <div class="control-left"></div>
       <div class="control-right"></div>       
 </div>
       
 <div id="help-info-box" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">
   <div class="modal-dialog">
     <div class="modal-content">
       <div class="modal-body">
          <p style="font-weight: 300;font-size: 14pt;line-height: 24px;">
Visualizing of medication use in ABCD&#39;s participants and their parents during pregnancy. The categorization used by this application is obtained using the RxNorm API (see https://rxnav.nlm.nih.gov/RxClassAPIs.html#). The numbers in brackets displayed after each category are the number of times medication in this category appeared in any of the entered fields. Use your mouse-wheel to zoom, left-mouse click to pan. Use your cursor keys to change the currently selected category and click on the / medication name / to search.<p>
          <p style="font-weight: 300;font-size: 14pt;line-height: 24px;">
Info on ADHD from the CDC: https://www.cdc.gov/ncbddd/adhd/data.html
          </p>
          <p class="text-white">
          This product uses publicly available data from the U.S. National Library of Medicine (NLM), National Institutes of Health, Department of Health and Human Services; NLM is not responsible for the product and does not endorse or recommend this or any other product.
          </p>
          <p>This is an experimental feature, please report any errors by email to HaukeBartsch@gmail.com.</p>
       </div>
       <div class="modal-footer">
           <button type="button" data-dismiss="modal" class="btn btn-primary">Close</button>
       </div>
     </div>
   </div>
 </div>


 <div id="create-new-score" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">
   <div class="modal-dialog">
     <div class="modal-content">
              <div class="modal-header">
              <h4>Create a new score</h4>
              </div>
       <div class="modal-body">
          <div id="med-stats"></div>
          <p style="font-weight: 300;font-size: 14pt;line-height: 24px;">
Your user account will be able to use this score for further statistical analysis.
          </p>
          <p style="line-height: 1.5em;">This is an experimental feature, please report any issues on <a href="github.com/ABCD-STUDY/DEAP/issues">github.com/ABCD-STUDY/DEAP/issues.</a></p>
       </div>
       <div class="modal-footer">
           <button type="button" data-dismiss="modal" class="btn">Cancel</button>
           <button type="button" data-dismiss="modal" class="btn btn-primary" id="create-new-score-button">Create New Score</button>
       </div>
     </div>
   </div>
 </div>


                    
<!-- Loading animation container -->
<div class="loading" style="display: none;">
    <!-- We make this div spin -->
    <div class="spinner">
        <!-- Mask of the quarter of circle -->
        <div class="mask">
            <!-- Inner masked circle -->
            <div class="maskedCircle"></div>
        </div>
    </div>
    <div class="spinner-text" style="position: relative;"></div>
</div>
<div id="place-for-popups"></div>

<script src="js/jquery.min.js"></script>
<script src="js/jquery-ui.min.js"></script>
<script src="js/jquery.easing.compatibility.min.js"></script>
<!-- <script type="text/javascript" src="/js/highslide/highslide-full.min.js"></script>
<script type="text/javascript" src="/js/highslide/highslide.config.js" charset="utf-8"></script> -->
<!-- <script src="js/jquery.csv-0.71.min.js"></script> -->
<!-- <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script> -->
<script src="js/popper.min.js" crossorigin="anonymous"></script>
<script src="js/bootstrap.min.js" crossorigin="anonymous"></script>
<script src="js/select2.min.js"></script>

<!-- <script src="js/bootstrap.min.js"></script> -->
<!-- <script src="js/bootstrap-select.min.js"></script> -->
<script src="js/d3.v3.min.js"></script>
<script src="/js/md5-min.js"></script>
<script src="js/dnTree.js?_=77759"></script>
<script src="js/lz-string.min.js"></script>          
<script src="js/all.js?_=7769"></script>

</body>
</html>
