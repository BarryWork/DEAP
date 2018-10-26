<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Limit</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <!-- <link href="/css/bootstrap.css" rel="stylesheet"> -->
    <!-- <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <link href="css/jquery-ui.css" rel="stylesheet" type="text/css"/>
    <link rel="stylesheet" href="css/bootstrap.min.css">
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

    <!-- <link href="css/bootstrap-select.min.css" rel="stylesheet" type="text/css"/> -->
    <link href="css/select2.min.css" rel="stylesheet" type="text/css"/>
    <link rel="stylesheet" href="css/all.css">
  </head>
  <body>

    <!-- http://mmil-dataportal.ucsd.edu:3000/applications/SurfaceViewerSS/index.php?subjid=Y0181,Y0368&visitid=Y0181,Y0368 -->


<nav class="navbar navbar-expand-lg navbar-dark bg-dark" role="navigation">
    <!-- Brand and toggle get grouped for better mobile display -->
    <a class="navbar-brand" href="#">Limit <span class="project_name"></span></a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="mr-auto navbar-nav">
        <li class="nav-item"><a class="nav-link" href="/index.php">Home</a></li>
        <li class="nav-item dropdown">
           <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true">Zoom</a>
           <div class="dropdown-menu">
              <a class="dropdown-item" href="#" onclick="setZoom(100);">Scale 100%</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#" onclick="setZoom(50);">Scale 50%</a>
              <a class="dropdown-item" href="#" onclick="setZoom(200);">Scale 200%</a>
              <a class="dropdown-item" href="#" onclick="setZoom(500);">Scale 500%</a>
           </div>
        </li>
        <li class="nav-item"><a class="nav-link" data-target="#help-info-box" data-toggle="modal">Help</a></li>
      </ul>
    </div><!-- /.navbar-collapse -->
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
       <div id="start" class="col-12"></div>
     </div>
 </div>

 <div id="help-info-box" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">
   <div class="modal-dialog modal-xl">
     <div class="modal-content">
       <div class="modal-header">
         <h5 class="modal-title">Help</h5>
         <button type="button" class="close" data-dismiss="modal" aria-label="Close">
           <span aria-hidden="true">&times;</span>
         </button>
       </div>
       <div class="modal-body">
          <p style="font-weight: 300;font-size: 14pt;line-height: 24px;">
            This application creates filters that can be used to identify a subset of sessions for analysis. 
            The Analysis application can use these subsetting filters to restrict the analysis to the sessions for which the filter returns true.
          </p>
          <p style="font-weight: 300;font-size: 14pt;line-height: 24px;">
       Start by selecting a filter from the drop-down menu. Adjust the filter algorithm in the text field, press enter. The participants are displayed in two groups below. The group on the left represents participants that evaluate to true, the group on the right represents participants that evaluate to false. 
       Once you have selected the proper set, save your search under a new name. Select that name as the subset during statistical analysis.
          </p>
          <hr>
          <p style="font-weight: 300;font-size: 14pt;line-height: 24px;">
            Here is a short description of the functionality for subsetting that is available:
            <dl>
               <dt style="margin-top: 10px;">age=="120"</dt>
               <dd>Measures to filter by such as "age" are referenced by their name. You can either test for being the same (==), or test for numeric quantities such as <code>age<="130"</code>. More than one test can be applied at the same time by using brackets and the "and" operator. To restrict the age range to participants that are between 9 and 10 years old we can therefore use the filter: <code>(age>=(12*9)) and (age<(12*11))</code>.</dd>       
               <dt style="margin-top: 10px;">has(age)</dt>
               <dd>Returns true if age exists and is not empty or NA.</dd>
               <dt style="margin-top: 10px;">quantile(age,0.75)</dt>
               <dd>Returns a threshold value for a given variable. This can be used as in: <code>age>quantile(age,0.75)</code> to select participants with a age value below the 75 percentile.</dd>
       <dt style="margin-top: 10px;">unique(rel_family_id)</dt>
       <dd>Unique returns a single session (at random) for each value in the specified measure. Using it with rel_family_id it returns a single member of each family.</dd>
               <!--<dt>visit()</dt>
               <dd>Returns for each visit a number that indicates the order as defined by "StudyDate". For the oldest visit of a subject this value will be 0.</dd>
               <dt style="margin-top: 10px;">visit( measure )</dt>
               <dd>Returns the sorting order given the measure. For example visit ("StudyDate") will return 
               the sorting order based on the StudyDate column (same as calling visit()). If a variable other
               than "StudyDate" is defined the sorting will be done numerically or alphabetically.</dd> -->
                   
            </dl>
          </p>
       </div>
       <div class="modal-footer">
           <button type="button" data-dismiss="modal" class="btn btn-primary">Close</button>
       </div>
     </div>
   </div>
 </div>

 <div id="save-filter-box" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">
   <div class="modal-dialog">
     <div class="modal-content">
       <div class="modal-header">
          <h4>Modify the current filter</h4>
       </div>
       <div class="modal-body">
         <form>
            <div class="form-group">
               <label for="#new-filter-name">Filter name</label>
	           <input id="new-filter-name" class="form-control" type="text"/>
            </div>
         </form>
       </div>
       <div class="modal-footer">
           <button type="button" data-dismiss="modal" class="btn btn-default">Close</button>
           <button type="button" id="save-filter-button" data-dismiss="modal" class="btn btn-success">Save</button>
           <button type="button" id="delete-filter-button" data-dismiss="modal" class="btn btn-warning">Delete</button
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
</div>
<div id="place-for-popups"></div>

<script src="js/jquery-3.2.1.min.js"></script>
<script src="js/jquery-ui.js"></script>
<!-- <script type="text/javascript" src="/js/highslide/highslide-full.min.js"></script>
<script type="text/javascript" src="/js/highslide/highslide.config.js" charset="utf-8"></script> -->
<script src="js/jquery.csv-0.71.min.js"></script>
       
<script src="js/popper.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<!-- <script src="js/bootstrap.min.js"></script> -->
<!-- <script src="js/bootstrap-select.min.js"></script> -->
<script src="js/select2.min.js"></script>
<script src="js/peg.0.8.0.js"></script>
<script src="/js/md5-min.js"></script>
<script src="js/all.js"></script>

</body>
</html>
