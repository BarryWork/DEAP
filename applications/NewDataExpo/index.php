<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
            <link href="../../css/bootstrap.css" rel="stylesheet">
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

                              margin-top:2px;
                              margin-left:5px;
                              margin-right:5px;

                      }
button.btn-sm.btn-outline-secondary {
    border-top-right-radius: 3px !important;
    border-bottom-right-radius: 3px !important;
    padding-bottom: 0px;
}
.btn.active{
    background-color:lightgreen;

}
              .list-unstyled {
                 padding-left: 0;
                 margin-left:0;
                 list-style: none;
              }
                      label {
                      line-height: 1.1em;
                      }
	.ace_search{
     position: fixed;
}

div.form-group {
    //margin-bottom: 0 !important;
    margin-bottom: 10px;
}
div.col-sm-12.row.row-fluid.input-group {
    margin-left: 0px;
    margin-bottom: 10px;
}
            </style>
           <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
	    <link href ="css/jquery-ui.min.css" rel="stylesheet">
            <link href="css/fontawesome-all.min.css" rel="stylesheet">
            <link href="custom_styles.css" rel="stylesheet">
<!-- Latest compiled and minified CSS -->

            <link href="css/select2.min.css" rel="stylesheet" />
            <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.4/css/select2.min.css" rel="stylesheet" /> -->
            <link href="https://cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-theme/0.1.0-beta.10/select2-bootstrap.css" rel ="stylesheet" type="test/css">

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
<!--         <link href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/start/jquery-ui.css" rel="stylesheet" type="text/css"/>-->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha2/katex.min.css" integrity="sha384-exe4Ak6B0EoJI0ogGxjJ8rn+RN3ftPnEQrGwX59KTCl5ybGzvHGKjhPKk/KC3abb" crossorigin="anonymous">
        <link rel="stylesheet" href="all.css">
        <link rel="stylesheet" href="css/all-surface.css">
        <link rel="stylesheet" href="css/style.css">
	<link href="js/jquery.minicolors.css" rel="stylesheet" type="text/css"/> 
<?php
session_start();
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
echo('<script type="text/javascript"> get_value = \''.json_encode($_GET).'\'; </script>');

?>


  </head>

    <div id="mySidenav" class="sidenav">
      <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
    </div>

  <body  id = "main" spellcheck="false">
    <div id="mySidenav-code" class="sidenav-right">
        <div id = "editor-ace" class ="col-md-12" style = "display:none;position:absolute;height:100%;overflow:hidden; top:0px; bottom: 0px; right: 0px; left:0px;  z-index: 0;  border: 1px solid gray;">
          <div id = "editor"> #test al ot sav</div>
        </div>
    </div>
    <div class = "floating-menu" id = "moveable">
      <div class="floating-header" id = "handle">Details (last used items)</div>
      <div id="floating-list">
        <ul style="margin-top:10px;" class="floating-entry list-unstyled"></ul>
      </div>
    </div>

    <nav class="navbar navbar-expand-lg  navbar-light bg-light" style = "z-index:3;    position: fixed; top: 0; width: 100%; ">
      <button type="button" onclick="openNav()" class="btn btn-circle btn-lg btn-neutral" style = "margin: 2px 10px 2px 5px"><i class="fas fa-align-justify" style="color: gray;"></i></button>
      <a class="navbar-brand" href="#">GAMM4</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
  <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
               <a class="nav-link" href="/index.php">Home <span class="sr-only">(current)</span></a>
          </li>
	  <li class="nav-item">
               <a class="nav-link page-mode" href="/applications/Filter/index.php" target="_subsetting" title="Open the Subsetting application in another tab">Limit</a>
          </li>
          <li class="nav-item">
               <a class="nav-link page-mode" href="#"> <span id="mod-name">Compact Mode</span></a>
          </li>

<!--           <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span id="mod-name">Select</span> Mode <span class="caret"></span>
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item page-mode" href="#" title="The tutorial mode of DEAP guides the user through some of the standard interpretations of the model and the generated statistics. You can disable the tutorial mode again by selecting <i>Normal</i> (default) in the mode menu.">Tutorial</a>
                <a class="dropdown-item page-mode" href="#">Normal</a>
            </div>
          </li> -->
        </ul>
      </div>

    </nav>

    <div class="container middle-page" style="margin-top: 100px;">
      <div class="row model-definition">
        <div class="col-md-10">
          <div class="content"></div>
        </div>
        <div id = "conrol-pannel" class="col-md-1" style="display: none;">
          <button type="button" id = "compute-button" class="btn btn-primary" onclick = "computeWithCheck()" style="margin-left: 10px;z-index:99999; margin-top: 25px; width:80px;height: 165px;font-size:0.8rem;">Submit</button>

        </div>
      </div>
      <!--ace.js editor for expert mode-->
      <div class="row">

      </div>

      <div class="row tutorial-mode" style="display: none;" tutbefore=".model-definition">
         <div class="col-md-12">
    <p class="tut-p">This application fits generalized additive mixed models using the R package <a href="https://cran.r-project.org/web/packages/gamm4/gamm4.pdf">GAMM4</a> (Simon Wood, Fabian Scheipl). The GAMM model is appropriate for both cross-sectional and longitudinal regression analyses and allows for an explicit modelling of aspects of the study design such as nesting of subjects within sites and family, twin pairs and other siblings.</p>
         </div>
      </div>

      <div class="row tutorial-mode" tutafter=".table1-section" style="display: none;">
          <div class="col-md-12 tut-caption">
    Table 1: Summary of the data used in the current model.
         </div>
      </div>


      <div class="row tutorial-mode" tutafter=".model-definition" style="display: none;">
          <div class="col-md-12 tut-caption">
    Fig. 1: Model specification used to define and execute the statistical model.
         </div>
      </div>

      <div class="row tutorial-mode" style="display: none;" tutbefore=".tut-data-display">
         <div class="col-md-12">
    <p class="tut-p">The model specified in Fig. 1 is used to estimate the statistical relationship between an independent variable and a measured dependent variable. In the generated model plot (Fig. 3) the independent variable is displayed on the X-axis and the dependent variable appears on the Y-axis. Both measures are user defined and can be selected from a list of available measures. Whereas the independent variable can be of any type (categorical or continuous), and there are no requirements for how it is distributed, there are some restrictions on the dependent variable. For example, a binomial regression model (e.g., logistic regression) is fitted if the dependent variable is categorical and has two levels. The grouping variable is a categorical variable that can be included into the model. Both its main effect and its interaction with the independent variable are included into the model. Additional user defined covariates and additional independent variables can be added manually in the field for Other Independent Variables. These variables will be part of the model but will not appear as in the model plot (Fig. 3). The demographic variables listed as a "Fixed Effect Covariates" do not have to be added as independent variables; instead, use the buttons to toggle off the inclusion of any of these fixed effect covariates. Both site and family are always included into the model as random effects as they are part of the study design.</p>
	     </div>
      </div>

    <div class="row tutorial-mode" tutafter=".plot-2" style="display: none;">
       <div class="col-md-12 tut-caption">
    Fig. 2: Data distributions for dependent (left) and independent variable (right).
       </div>
    </div>

    <div class="row tutorial-mode" tutbefore=".model-output" style="display: none;">
       <div class="col-md-12">
           <p class="tut-p">Histograms are used to inspect the distributions of the data used in the model. For a continuous dependent variable (Fig. 2, left) we want to make sure that the data are roughly normally distributed (note, technically the residuals from the model should be roughly normally distributed, rather than the dependent variable. The distribution of the residuals can be seen in the model diagnostic plots below). In particular we want to check if there are large outliers or if the distribution is highly skewed. If large outliers are detected in the model, the user may wish to fit the model after censoring these (robust models are also a possibility, but not currently implemented in the DEAP multilevel module). If the data are highly skewed, a transformation (such as a log-transform) of the data can be tried, though even this may not be sufficient in some cases. The histogram on the right for the independent variable does not have to be Gaussian distributed, though extreme values (high leverage points) may have undue influence on the regression coefficients fitted by the model.</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".plot-0" style="display: none;">
       <div class="col-md-12 tut-caption">
    Fig. 3: Scatter plot of the data with model curve and model confidence interval.
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".model-output" style="display: none;">
       <div class="col-md-12">
    <p class="tut-p">The model output (Fig. 3) displays a scatter plot of the dependent and independent variables for each participant. The plot shows the trends in the data by displaying the calculated model as a line with 95% confidence intervals. The actual model function depends on the choice of covariates selected.</p>
       </div>
    </div>


    <div class="row tutorial-mode" tutbefore=".summary-textarea" style="display: none;">
       <div class="col-md-12">
    <p class="tut-p">The following summary information lists both overall (ANOVA Table) and detailed (Parameter Table) information about the effect of model independent variables and covariates. The Parameter Table contains estimates relative to a reference value for categorical variable. The column “Estimate” for example describes the expected level of the dependent variable for a unit change in the independent variable while holding all the other variables in the model constant. The "standard error" gives the level of precision of the estimated coefficients (though this depends on the scale of the variable). The column "t value" shows the <a href="https://en.wikipedia.org/wiki/Wald_test">Wald</a> statistics used to test the significance of the variable in the regression model, and are used to compute the p-values assuming asymptotically normal coefficient estimates. Standard deviations of the random effects (Random Effects Table) are also included to show how much variance is accounted for by the default ABCD random effects site and family unit nested within site. The model formula (Fig. 4) is a short-hand description for the variables included in the model. It lists the dependent variable <i>tilde</i> (<i>~</i>) the independent variable as well as all the covariates, each identified by their variable name. The site and family variables are not listed but they are always included in the model as random effects. Values with an applied transformation will appear as such in the formula. Interactions between variables are indicated by a ":" character.</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".formula-title" style="display: none;">
       <div class="col-md-12">
    <p class="tut-p">The model formula (Fig. 4) is a short-hand description for the variables included in the model. It lists the dependent variable <i>tilde</i> (<i>~</i>) the independent variable as well as all the covariates, each identified by their variable name. The site and family variables if listed as "Random" are included in the model as random effects with a nesting of family inside site.</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".formula" style="display: none;">
       <div class="col-md-12 tut-caption">
    Fig. 4: Model formula in R format.
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".model-diagnostics" style="display: none;">
       <div class="col-md-12">
    <p class="tut-p">The residual plot (Fig. 8) should show that the fitted and residual values are unrelated - the black line should be fairly flat, showing no systematic trends. If you see a linear trend or a bump, this could be a sign of a model misfit. If this happens, you may explore other functions of the independent variable, such as a smooth version of your independent variable or polynomial terms. For a properly fitted model the residual plot should show a roughly normal distribution (for a continuous model with assumed normal errors).</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutbefore=".anova-table-title" style="display: none;">
       <div class="col-md-12 tut-caption">
    Table 2: Effect size (&Delta;R<sup>2</sup>) table.
       </div>
    </div>

    <div class="row tutorial-mode" tutbefore=".parameter-table-title" style="display: none;">
       <div class="col-md-12 tut-caption">
    Table 3: Analysis of variance (type III ANOVA) table.
       </div>
    </div>

    <div class="row tutorial-mode" tutbefore=".random-effects-title" style="display: none;">
       <div class="col-md-12 tut-caption">
    Table 4: Statistical parameter table.
       </div>
    </div>

    <div class="row tutorial-mode" tutbefore=".other-statistics-title" style="display: none;">
       <div class="col-md-12 tut-caption">
    Table 5: Random effects table.
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".plot-4" style="display: none;">
       <div class="col-md-12 tut-caption">
    Fig. 5: Residual plot.
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".plot-1" style="display: none;">
       <div class="col-md-12 tut-caption">
    Fig. 6: Variance explained by the individual random effects and Q-Q plot for test of normality.
       </div>
    </div>

    <div class="row tutorial-mode" tutbefore=".plot-5" style="display: none;">
       <div class="col-md-12">
        <p class="tut-p">Both histograms in Fig. 6 (top) are plotted on the same scale to show the relative variation of each random effect. The wider the histogram the more variable the random effects (see also the sd values in the Random Effects Table). The model assumes that both the site and the family variables are normally distributed. The Q-Q plot can be used to assess the normality of the residuals after the model fit (see Fig. 5). In the case of normally-distributed residuals the scatter points are expected to hug the red line. If they do not, consider a transformation of the dependent variable, such as a log transformation.</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".effect-size-table-title" style="display: none;">
       <div class="col-md-12">
         <p class="tut-p">The R-squared value describes the proportion of variance accounted for by the fitted model (for logistic regression, this is a little more involved but the idea is similar). A value close to 0 indicates that the model explains very little of the variation in the data, while a value close to 1 indicates that the model explains most of the variation of the data around its mean value. The &Delta;R-squared value is the percent R-squared accounted for by the independent and grouping variables after controlling for the effects of the covariates.</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".other-statistics-title" style="display: none;">
       <div class="col-md-12">
         <p class="tut-p">As a way to compare models the R-squared value is of limited use, as adding additional variables to the model will always tend to increase the R-squared value. Alternative model comparison methods such as Akaike information criterion (<a href="https://en.wikipedia.org/wiki/Akaike_information_criterion">AIC</a>) or Bayesian information criterion (<a href="https://en.wikipedia.org/w\
iki/Bayesian_information_criterion">BIC</a>) are more appropriate for model comparisons as they include penalties for the model degrees of freedom.
      </div>
    </div>
    <div class="row tutorial-mode" tutbefore=".model-diagnostics" style="display: none;">
       <div class="col-md-12">
        <p class="tut-p">
        In order to find out which of several models is the most appropriate make sure that the dependent or response variable (Y-axis) stays the same (this includes any transformations that are applied to the dependent variable) and that the same observations (subjects) appear in each model. You can vary the independent variables and/or covariates to generate a series of different models and record for each the AIC values. The model with the lowest AIC value will minimize the information loss and can be selected as the more appropriate model. It has been suggested in the literature that a drop by at least 10 indicates a substantially better model. The Bayesian information criterion can be used in a similar manner preferring models with lower BIC values; BIC tends to be more conservative, since the model complexity penalty is higher in BIC than in AIC.</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".anova-table-title" style="display: none;">
       <div class="col-md-12">
        <p class="tut-p">The analysis of variance between groups table (Type III ANOVA, Table 3) can be used to test for the significance of one variable controlling for the other variables in the model. It includes the degrees of freedom for each of the variables. For categorical variables, this value is the number of categories for that variable minus 1.</p>
       </div>
    </div>

    <div class="row tutorial-mode" tutafter=".parameter-table-title" style="display: none;">
       <div class="col-md-12">
         <p class="tut-p">The parameter table shows coefficients for factor variables with respect to a reference category. As an example, if <i>sexM</i> is listed the reference category will be Female and the coefficients reflect the difference between Males and Females. The reference category itself will not be listed but can be changed in <i>Expert Mode</i> by reordering the levels. Whichever level is listed first is used as the reference category.</p>
       </div>
    </div>

    <div class="row">
        <div id="scatter" class="col-md-12" style="height: auto; min-height: 500px;"></div>
    </div>

  </div>
          <div class="footer" style="margin-bottom: 20px;">
    <hr>
      <i style="margin-left: 20px; color: gray; font-weight: 200;">A service provided by the Data Analysis and Informatics Core of ABCD.</i>
    </div>
</body>
</html>
<!-- <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script> -->

<script src="../../js/jquery-3.3.1.min.js"></script>

<!--<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>--!>
<!-- <script src="./js/jquery-ui-1.9.2-mod.js"></script> -->

<!-- <script src="//code.jquery.com/jquery-1.7.2.min.js"></script> -->
<!-- <script src="//code.jquery.com/ui/1.8.22/jquery-ui.min.js"></script> -->
<script src="./js/saveSvgAsPng.js"></script>
<script src="/js/md5-min.js"></script>
<script type="text/javascript" src="/js/highslide/highslide-full.min.js"></script>
<script type="text/javascript" src="/js/highslide/highslide.config.js" charset="utf-8"></script>
<link rel="stylesheet" type="text/css" href="/js/highslide/highslide.css" />
<script type="text/javascript" src="/js/HighChart414/js/highcharts.js"></script>
<script type="text/javascript" src="/js/HighChart414/js/highcharts-more.js"></script>
<script type="text/javascript" src="/js/HighChart414/js/modules/exporting.js"></script>
<script type="text/javascript" src="/js/jquery.mousewheel.min.js"></script>
<script type="text/javascript" src="/js/pixastic/pixastic.core.js"></script>
<script type="text/javascript" src="/js/pixastic/pixastic.jquery.js"></script>
<script type="text/javascript" src="/js/pixastic/actions/brightness.js"></script>
<script type="text/javascript" src="/js/mpr.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.4/js/select2.min.js"></script>

<script type="text/javascript" src="./js/select2.min.js"></script>
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script> -->
<script src="js/jquery-ui.min.js"></script>
<script src="js/popper.min.js"></script>
<script src="../../js/bootstrap.min.js"></script>
<script src="./js/ontology_dialog.js" charset="utf-8"></script>
<script src="./js/all-2.js?_=333"></script>
<script src="./js/all4.js?_=333"></script>
<script src="./js/moment.js"></script>
<script src="./js/JSZip.js"></script>
<script src="./js/FileSaver.js"></script>
<script src="./js/d3.js"></script>
<script src="./js/d3-tip.js">         </script>
<script src="./js/scatter.js" charset="utf-8"></script>
<script src="./js/qq.js" charset="utf-8"></script>
<script src="./js/hist.js" charset="utf-8"></script>
<script src="./js/hist_cata.js" charset="utf-8"></script>
<script src="./js/coeffient.js" charset="utf-8"></script>
<script src="../Ontology/js/highlight-js.js" charset="utf-8"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha2/katex.min.js" integrity="sha384-OMvkZ24ANLwviZR2lVq8ujbE/bUO8IR1FdBrKLQBI14Gq5Xp/lksIccGkmKL8m+h" crossorigin="anonymous"></script>
<script src="https://gitcdn.github.io/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.debug.js" integrity="sha384-CchuzHs077vGtfhGYl9Qtc7Vx64rXBXdIAZIPbItbNyWIRTdG0oYAqki3Ry13Yzu" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.debug.js" integrity="sha384-CchuzHs077vGtfhGYl9Qtc7Vx64rXBXdIAZIPbItbNyWIRTdG0oYAqki3Ry13Yzu" crossorigin="anonymous"></script>

<script src="./js/ace.js"></script>
<script>

jQuery(document).ready(function() {
    //if(user_name != "admin") jQuery("body").html("Deap is under construction, come back later. ");
    loadAnalysisNames();
    load_interface_from_json();
    jQuery("#conrol-pannel").show();
});

//hard coding, user cannot deselect the random effects.
</script>
