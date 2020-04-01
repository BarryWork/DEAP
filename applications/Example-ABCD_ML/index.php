<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Example ABCD_ML</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    
    <!-- Le styles -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <!-- <link href="css/fontawesome-all.min.css" rel="stylesheet">                           -->
    <link href="../NewDataExpo/css/fontawesome-all.min.css" rel="stylesheet">
    <!-- <link href="custom_styles.css" rel="stylesheet"> -->
    <!-- Latest compiled and minified CSS -->
    
    <!-- <link href="css/select2.min.css" rel="stylesheet" /> -->
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
    <link href="css/bootstrap-toggle.min.css" rel="stylesheet">
    <link href="css/bootstrap-editable.css" rel="stylesheet"/>
    <!-- <link href="css/jquery-ui.min.css" rel="stylesheet"> -->
    <link href="css/select2.min.css" rel="stylesheet" type="text/css"/>
    <link rel="stylesheet" href="css/style.css?_=9999">
    
<?php
//session_start();
//include("../../code/php/AC.php");
//$user_name = check_logged();
echo('<script type="text/javascript"> user_name = "'.$user_name.'";model_name = "'.$model.'"; project_name = "'.$project_name.'"; </script>');

?>
  </head>
  
  <body spellcheck="false">
    
    <nav class="navbar navbar-expand-lg  navbar-light bg-light">
      <a class="navbar-brand" href="#">Example ABCD_ML</a>
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
    
    
    <div class="container-fluid" style="margin-top: 10px;">
      <div class="row">
        <div class="col-md-12">
                  <p class="tut-p">This is an example application for the ABCD_ML package running machine learning algorithms on DEAP. We perform a ridge regression (splits = 3, repeats = 1). The split of test to training set is 20% - 80%.</p>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="col-md-12">
	  <form>
	    <div class="form-row">
	      <div class="form-group col-md-8">
		<label for="explain-this">Explain target</label>
		<input type="text" class="form-control" id="explain-this" placeholder="anthro_waist_cm" value="anthro_waist_cm">
	      </div>
	      <div class="form-group col-md-4">
		<label for="filter-outliers">Outlier removal</label>
		<select id="filter-outliers" class="form-control">
		  <option selected value="">No filtering</option>
		  <option value="34" selected>Filter outliers by std 3,4</option>
		</select>
	      </div>
	    </div>
	    
	    <div class="form-row">
	      <div class="form-group col-md-8">
		<label for="sets-list">List of explanatory variables (use <a href="/applications/Sets/">Sets</a> to add more choices)</label>
		<select id="sets-list" class="form-control"></select>
	      </div>
	      <div class="form-group col-md-4">
		<label for="filter-outliers">Outlier removal</label>
		<select id="filter-outliers2" class="form-control">
		  <option selected value="">No filtering</option>
		  <option value="34">Filter outliers by std 3,4</option>
		  <option value="6" selected>Filter outliers by std 6</option>
		</select>
	      </div>
	    </div>

	    <div class="form-row">
	      <div class="form-group">
		<label>Stratify by: </label>
		<div class="btn-group-toggle btn-group" data-toggle="buttons" data-toggle="buttons">
		  <label class="btn btn-secondary active">
		    <input type="checkbox" checked autocomplete="off" id="family-id-toggle"> Family ID
		  </label>
		  <label class="btn btn-secondary">
		    <input type="checkbox" checked autocomplete="off" id="sex-toggle"> Sex
		  </label>
		</div>
	      </div>
	    </div>
	  </form>
	      <button class="btn btn-primary" id="start-analysis">Start analysis</button>
              <div id="progress" class="progress" style="margin-top: 10px;">
		<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
	      </div>
              <div id="results" style="margin-left: 0px;margin-top: 20px;"></div>
	      <span id="timing"></span>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12" style="margin-bottom: 20px; margin-top: 400px;">
          <hr>
          <i>A service provided by the Data Analysis and Informatics Core of ABCD.</i>
        </div>
      </div>
    </div>
    
  </body>
  
  <script src="js/jquery-3.2.1.min.js"></script>
  <script src="js/popper.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/select2.min.js"></script>
  <script src="js/d3.v3.min.js"></script>
 <!--  <script type="text/javascript" src="/js/d3/d3.layout.js"></script> -->
 <!--  <script src="js/highlight-js.js"></script> -->
  <script src="js/all.js"></script>
  
</html>
    
