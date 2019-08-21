<!DOCTYPE html>
<html lang="en">

<?php
session_start();
include_once("../../code/php/analytics.php");
include("../../code/php/AC.php");
$user_name = check_logged();
if (isset($_SESSION['project_name']))
	$project_name = $_SESSION['project_name'];
else {
	$projs = json_decode(file_get_contents('/var/www/html/code/php/getProjectInfo.php'),TRUE);
	if ($projs)
		$project_name = $projs[0]['name'];
	else
		$project_name = "Project01";
}

$model = "";
if (isset($_GET['model'])){
	$model = $_GET['model'];
}

echo('<script type="text/javascript"> user_name = "'.$user_name.'";model_name = "'.$model.'"; project_name = "'.$project_name.'"; </script>');

?>


  <head>
    <meta charset="utf-8">
    <title>Extend ABCD</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="../../css/bootstrap.css" rel="stylesheet">
    <link href="css/github.min.css" rel="stylesheet">
    <!-- <link href="css/highlight.min.css" rel="stylesheet"> -->
    <link href="css/school-book.css" rel="stylesheet">
    <link href="css/simplemde.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
    <link href="../NewDataExpo/css/fontawesome-all.min.css" rel="stylesheet">
    <style>
body {
    //padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
}
#editor {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}
.editor-wrapper {
    position: relative;
    height:350px;
    margin-top:10px;
}
.row-fluid{
    margin-top:10px;
    margin-left:5px;
    margin-right:5px;

}
button.btn.active {
    background-color: lightgreen;
}
.list-unstyled {
    padding-left: 0;
    margin-left:0;
    list-style: none;
}
label {
    line-height: 0.5em;
}
h3 {
    margin-top: 10px;
}
.bar rect {
  shape-rendering: crispEdges;
}

.bar text {
  fill: #999999;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
text{
  font-size:0.75em
}
.recipe-block{
  background-color:#f8f9fa!important;
  padding-top:10px;
  margin-top:15px;
  padding-bottom:25px;
  margin-left: 0px;
  margin-right: 0px;
}
.recipe-block:focus-within{
    //background-color:#e8f9fa!important;
  border: 1px solid green;
    border-radius: 3px;
}
.delete-button, .save-button{
  margin-left: 10px;
  float:right;
}
.loader {
    margin:65px;
    border: 16px solid #f3f3f3; /* Light grey */
    border-top: 16px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.lds-ring {
  display: inline-block;
  position: relative;
  width: 24px;
  height: 24px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 24px;
  height: 24px;
  margin: 6px;
  border: 2px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.code-output{
  margin-top: 5px;
  padding: 10px;
  border: 1px #6c757d;
  border-style: dashed;
  border-width: medium;
  width:100%
}
</style>
    <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <link href="css/fontawesome-all.min.css" rel="stylesheet">
    <!-- Latest compiled and minified CSS -->

    <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.4/css/select2.min.css" rel="stylesheet" /> -->
    <link href="css/select2-bootstrap.css" rel ="stylesheet" type="test/css">

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
    <!--             <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css" rel="stylesheet"> -->
    <!-- <link href="css/jquery-ui.min.css" rel="stylesheet"> -->
    <link rel="stylesheet" href="css/style.css">

  </head>

  <body spellcheck="false">

    <nav class="navbar navbar-expand-lg  navbar-light bg-light">
      <a class="navbar-brand" href="#">Extend ABCD</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
	<span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
	<ul class="navbar-nav mr-auto">
	  <li class="nav-item active">
	    <a class="nav-link" href="/index.php">Home <span class="sr-only">(current)</span></a>
	  </li>
	</ul>
      </div>
    </nav>


    <div class="container-fluid" style="margin-top: 10px; margin-bottom: 20px;">
      <div class="row" id="first-item">
	<div class="col-md-12">
    <p class="tut-p">This application allows the user to create and share new measures on DEAP. The computations are run in the web-browser and are written in the JavaScript language also called ES6. This could be as simple as a different quantization of an existing continuous variable or as complex as a new t-score table used to map values to some standard sample. DEAP will store the new measures, which makes them available to the statistical analysis packages on DEAP. Scores marked as "public" can be used in Analyze after they have been saved.</p>
	  <div style = "z-index:9; margin-top: -20px; position: absolute; right: 10px;">
	     <button class="btn btn-light fa fa-plus-circle" data-target="#exampleModal" data-toggle="modal"  style="font-size:64px;color:green;margin:10px;cursor: pointer;" title="Create a new score"></button>
	  </div>
	  <div style="margin-top: 80px;">List of existing score calculations:</div>
	</div>
      </div>
    </div>


    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">

        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Create a new score</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body row card-list">
            <p class="card-text" style="margin-left: 20px;">Select any of the options to extend DEAP with new measures. The measures will only be visible for your user account. Other users need to repeat this setup to gain access.</p>
            <div class="card text-white bg-primary card-option-add-score mb-1" style="width: 100%; min-width: 15rem">
            <!--<img class="card-img-top" src="..." alt="Card image cap">--!>
              <div class="card-body">
                <h5 class="card-title">A) Add a new score based on existing values</h5>
                <p class="card-text">This option uses a notebook to document derived variables. Sharing the text of the notebook is sufficient to allow other users to replicate your measures.</p>
              </div>
            </div>

            <div class="card card-option-upload-spreadsheet" style="width: 100%; min-width: 15rem">
            <!--<img class="card-img-top" src="..." alt="Card image cap">--!>
              <div class="card-body mb-1">
                <h5 class="card-title">B) Add a new score created outside DEAP</h5>
<p class="card-text">Upload the spreadsheet of precalculated features. Start by <a href="/applications/Scores/R/Template.csv">downloading the template</a>. Append your scores as additional columns. Do not change the names of the predefined columns (src_subject_id, eventname). This feature cannot be used to add new participants (rows). The maximum file size accepted is 10 megabyte.</p>
                <form class="input-group"  method="post" id="uploading-form" enctype="multipart/form-data">
                  <div class="custom-file">
                    <input type="file" accept=".csv"  class="custom-file-input" id="inputGroupFile01" onClick="this.form.reset()" aria-describedby="inputGroupFileAddon01">
                    <label class="custom-file-label" for="inputGroupFile01">Choose file</label>
                  </div>
                </form>
              </div>
            </div>

            <div class="card card-option-medication-use" style="width: 100%; min-width: 15rem; margin-top: 4px;">
              <div class="card-body mb-1">
                <h5 class="card-title">C) Add a new score based on medication use information</h5>
                <p class="card-text">Opens the medication use (medUse) application.</p>
              </div>
            </div>

           </div>
          <div class="modal-footer">
            <a href="#" class="btn btn-primary" onclick="add_new_recipe()" data-dismiss="modal" >Add</a>
            <button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
          </div>
        </div>

      </div>
    </div>

  </body>

  <script src="js/highlight.min.js"></script>
  <script src="js/simplemde.min.js"></script>
  <script type="text/javascript" src="js/MathJax-2.7.4/MathJax.js?config=TeX-AMS-MML_SVG"></script>
  <script src="../../js/jquery-3.3.1.min.js"></script>
  <!-- <script src="js/popper.min.js"></script> -->
  <script src="../../js/bootstrap.min.js"></script>
  <script src="js/dataframe-min.js"></script>
  <script src="js/all.js"></script>
  <script src="../../js/d3.v3.min.js"></script>
</html>
