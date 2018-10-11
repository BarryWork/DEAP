<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Pre-Registration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    
    <!-- Le styles -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/bootstrap-toggle.min.css" rel="stylesheet">
    <style>
    body {
    
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
.row-fluid {    
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
    line-height: 1.1em;
}
.mode-button-area {
    margin-top: 10px;
}
.mode-area {
    border-top: 1px solid grey;
    border-bottom: 1px solid grey;
    background-color: #EEE;
    margin-top: 20px;
}
.mode-title {
    font-size: 36pt;
}
            </style>
           <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
            <link href="css/fontawesome-all.min.css" rel="stylesheet">                          
<!-- Latest compiled and minified CSS -->
               
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
            <link rel="stylesheet" href="css/style.css">

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

?>


  </head>

  <body spellcheck="false">

    <nav class="navbar navbar-expand-lg  navbar-light bg-light">
      <a class="navbar-brand" href="#">Pre-Registration</a>
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


    <div class="container" style="margin-top: 40px;">
      <div class="row col-md-12 tut-p">
    In order to make hypothesis registration as easy as possible this platform supports the structured generation of hypothesis. This includes the definition of the hypothesis with variable selection and data transformations. Additionally, DEAP provides sample texts for the following sections that may be part of your hypothesis registration:
    <ul style="margin-top: 10px;">
      <li class="intext">Sampling Plan</li>
      <li class="intext">Design Plan</li>
      <li class="intext">Analysis Plan</li>
      <li class="intext">Analysis Scripts</li>
    </ul>
    We suggest to use the Open Science Foundation (<a href="https://osf.io">OSF</a>) framework to register hypothesis.
      </div>
      <div class="row col-md-12 tut-p">
    The DEAP portal supports a two step approach for hypothesis pre-registration. In a restricted mode (I) users are able to explore the data and see the marginal data distributions across all data domains. This is sufficient to identify suitable data transformations and shows the effects of data transformation and censoring for each variable. It also allows users to specify a subset of the participants for the tested hypothesis. The users can specify the hypothesis for example in the generalized additive mixed model module by defining the dependent and independent variables and all covariates of non interest. In the restricted mode the actual hypothesis test cannot be performed as it would result in the display of scatter plots and the premature calculation of effect sizes and significance values. Users are able to save and bookmark their hypotheses together with the subsetting for later analysis.
      </div>
      <div class="row col-md-12 tut-p">
    In the unrestricted mode (II) users have all the abilities of the restricted mode I as well as they are able to run their saved statistical analysis to test hypotheses.
      </div>
      <div class="row col-md-12 tut-p">
	<center>

      <div class="mode-area">
          <div class="mode-button-area">
            <label>
               <button id="toggle-mode" class="btn-primary btn">Switch Mode</button>
            </label>
          </div>
          <div class="mode-title"></div>
          <div class="mode-body"></div>
      </div>
    
	</center>



    <h1>Overview</h1>
    <p>The Adolescent Brain Cognitive Development (ABCD) Study is a long-term study of cognitive and brain development in children across the United States. From 2016-2018, children between the ages of 9-11 have been invited to join the study from 21 sites around the nation, with the intent to enroll and follow approximately 11,500 healthy children longitudinally for 10 years into young adulthood.</p>

    <div class="reference">Volkow, Nora D., et al. "The conception of the ABCD study: From substance use to a broad NIH collaboration." Developmental cognitive neuroscience (2017).</div>

        <h1>Sampling Plan</H1>
        <P>An important motivation for the ABCD study is that its sample reﬂects the sociodemographic variation of the US population. With one important departure, the ABCD cohort recruitment emulates a multi-stage probability sample of eligible children: A nationally distributed set of 21 primary stage study sites, a probability sampling of schools within the deﬁned catchment areas for each site, and recruitment of eligible children in each sample school. The major departure from traditional probability sampling of U.S. children originates in how participating neuroimaging sites were chosen for the study. Although the 21 ABCD study sites are well-distributed nationally the selection of collaborating sites is not a true probability sample of primary sampling units but was constrained by the grant review selection process and the requirement that selected locations have both the research expertise and the neuroimaging equipment needed for the study protocol. As a consequence, neuroimaging research centers are more likely to be located in urban areas resulting in a potential under-representation of rural youth.</p>

    <p>There is a substantial twin cohort in ABCD, consisting of monozygotic and dizygotic twin pairs, primarily collected at four of the 21 sites. There are also other sibling groups that will have been collected incidentally at all 21 sites.</p>

    <div class="reference">Garavan, H., et al. "Recruiting the ABCD sample: design considerations and procedures." Developmental cognitive neuroscience (2018).</div>

            <h1>Design Plan</h1>
    <p>The ABCD study is a prospective longitudinal study with yearly assessments. The November 2017 public data release on the NIMH Data Archive (NDA) consists of baseline data from 4,521 children from 20 sites. Data collection efforts for ABCD are organized into several data categories. Overviews of neuroimaging data, neuropsychological measures, biospecimens, substance use assessments, and culture and environment are given in the citations below.</p>

    <div class="reference">Lisdahl, Krista M., et al. "Adolescent brain cognitive development (ABCD) study: Overview of substance use assessment methods." Developmental cognitive neuroscience (2018).</div>

        <div class="reference">Uban, Kristina A., et al. "Biospecimens and the ABCD Study: Rationale, Methods of Collection, Measurement and Early Data." Developmental cognitive neuroscience (2018).</div>

        <div class="reference">Casey, B. J., Cannonier, T., Conley, M. I., Cohen, A. O., Barch, D. M., Heitzeg, M. M., ... & Orr, C. A. (2018). The Adolescent Brain Cognitive Development (ABCD) Study: Imaging Acquisition across 21 Sites. Developmental cognitive neuroscience.</div>

    <div class="reference">Luciana, M., et al. "Adolescent neurocognitive development and impacts of substance use: Overview of the adolescent brain cognitive development (ABCD) baseline neurocognition battery." Developmental cognitive neuroscience (2018).</div>

        <div class="reference">Zucker, Robert A., et al. "Assessment of culture and environment in the adolescent brain and cognitive development study: Rationale, description of measures, and early data." Developmental cognitive neuroscience (2018).</div>

    <h1>Analysis Plan</h1>
    <p>Analyses should, if possible, reflect the study design of ABCD. In particular, there are a substantial number of siblings (including twins) in the study, and hence subjects should be nested within families. Moreover, we recommend including site as a random or fixed effect covariate in regression analyses. In DEAP, the Multilevel Module incorporates family and site as random effects, and defaults to including as fixed effect covariates the demographic categories that were used as metrics in recruitment to balance with the American Childhood Survey (ACS): age, sex at birth, race/ethnicity, household income, marital status of guardian, highest household education.</p>

    <p>Proper attention should be given to model assumptions. For example, normality of residuals or linearity of effects for regression models. If these assumptions are not met, consider data transformations or censoring of extreme outliers, or use of non-linear models.</p>

    <p>We strongly recommend reporting and emphasizing effect sizes rather than just p-values, such as change in R-square from a base model (with covariates of no-interest) to a full model (covariates plus independent variables of interest). With the large ABCD sample, even very small effect sizes will tend to be significant. Effect sizes and classification accuracy are also best assessed in out-of-sample validation sets or via cross-validation. Tutorials on effect sizes for continuous outcomes, classification performance, and cross-validation are given in the references below:</p>

  <div class="reference">Vacha-Haase, T., & Thompson, B. (2004). How to estimate and interpret various effect sizes. Journal of counseling psychology, 51(4), 473.</div>

  <div class="reference">Sullivan, Gail M., and Richard Feinn. "Using effect size—or why the P value is not enough." Journal of graduate medical education 4.3 (2012): 279-282.</div>

  <div class="reference">Hastie, T., Tibshirani, R. J., & Friedman, J. (2011). The Elements of Statistical Learning: Data Mining, Inference, and Prediction. (2nd ed.). Springer-Verlag.</div>

  <div class="reference">Pereira, F., Mitchell, T., & Botvinick, M. (2009). Machine learning classifiers and fMRI: a tutorial overview. Neuroimage, 45(1), S199-S209.</div>

  <div class="reference">Varoquaux, G., Raamana, P. R., Engemann, D. A., Hoyos-Idrobo, A., Schwartz, Y., & Thirion, B. (2017). Assessing and tuning brain decoders: Cross-validation, caveats, and guidelines. NeuroImage, 145, 166–179.</div>

  <div class="reference">https://www.leeds.ac.uk/educol/documents/00002182.htm</div>

  <div class="reference">https://towardsdatascience.com/metrics-to-evaluate-your-machine-learning-algorithm-f10ba6e38234</div>


  <h1>Analysis Scripts</h1>
                                                                                                                                                                        <p>We strongly recommend making analysis scripts publicly available along with any published results. DEAP allows for downloading and sharing of R scripts used in analyses. Scripts can be included as Supplementary Materials in published results. We also recommend uploading scripts to a public source code repository such as ABCD&apos;s <a href="https://github.com/ABCD-STUDY/">https://github.com/ABCD-STUDY/</a>.</p>

  <h1>Hypothesis Registration</h1>

  <p>In order to make hypothesis registration as easy as possible this platform supports the structured generation of hypothesis. This includes the definition of the hypothesis with variable selection and data transformations. Here, we provide sample texts for the following sections that may be part of your hypothesis registration.</p>

  <h1>Hypothesis Pre-Registration Template</h1>
   <p>We suggest using the Open Science Foundation (OSF) framework to register hypotheses. Below we include an OSF registration template that borrows heavily from <i>"Pre-Registration in Social Psychology (van ‘t Veer & Giner-Sorolla, 2016)".</i></p>

   <p>For any required question that does not apply to your study put ‘N/A’ in the space for the relevant field and describe why it does not apply to your study.</p>

   <p>In the fields below, we provide some descriptions relevant to the multilevel models in the context of generalized linear mixed-effects model (GLMM) regression analyses utilizing the ABCD sample.</p>

  <p>Registered reports concept and participating journals: <a href="https://cos.io/rr/">https://cos.io/rr/</a>.</p>

   <h1>A. Hypotheses</h1>
  <ol>
    <li>Description of essential elements (required)
        <ol>
            <li>Describe the hypotheses in terms of directional relationships between your measured variables.
                                          <br>[<b>We hypothesize that dependent variable DV is negatively/positively related to independent variable IV after controlling for random effects of site and family nested within site, and for fixed effects of demographics (age, sex at birth, marital status of household, household income, highest household education, and race/ethnicity)</b>]</li>
            <li>For interaction effects, describe the expected direction of the interactions.
                                          <br>[<b>We hypothesize that the effect of IV on DV is conditional on levels of IV2 after centering each of IV and IV2. Specifically, we expect….</b>]</li>
        </ol>
    </li>
    <li>Recommended elements (optional)
    <ol>
       <li>A figure or table may be helpful to describe complex interactions; this facilitates correct specification of the ordering of all group means.
          <ol>
             <li>Up to 5 documents may be uploaded total for this pre-registration.</li>
          </ol>
       </li>
       <li>Rationales or theoretical frameworks for why a certain hypothesis is tested.</li>
       <li>If multiple predictions can be made for the same IV-DV combination, describe what outcome would be predicted by which theory.</li>
    </ol>

    </li>
  </ol>

  <h1>B. Methods</h1>
  <ol>
    <li>Description of essential elements (required)
        <ol>
          <li>Design<br>
              List, based on your hypotheses from section A:
                                                                 i.  Independent variables with all their levels
                                          1. Whether they are within- or between-participant
                                          2. The relationship between them (e.g., orthogonal, nested within subjects).
                                          ii.  List dependent variables, or variables in a correlational design
                                                                 iii.  Variables acting as covariates or moderators
                                          [<b>Random effects include site and family. Fixed-effect covariates include age, sex at birth, marital status of household, household income, highest household education, and race/ethnicity.</b>]
          </li>                                
          <li>Planned Sample for Analyses
              <ol>                            
                 <li>Describe pre-selection rules for which subjects will be included in the analyses<br>
                                 [<b>2017 NDA baseline ABCD data (release 1.1) consist of 4,521 subjects. Data were missing on X1 subjects. We excluded X2 subjects from the analyses because of….</b>]
                 </li>                         
                 <li>Justify planned sample size
                     <ol>                     
                        <li>If applicable, you can upload a file related to your power analysis here (e.g., power analyses from G*Power, a script, a screenshot, etc.).<br>
                                 [<b>Data were collected on 4,521 subjects in the 2017 NDA Baseline ABCD data (release 1.1). With this sample size we have power to detect an effect size of X1 with 80% power.</b>]
                        </li>
                     </ol>                     
                 </li>
              </ol>                            
          </li>
          <li>Exclusion Criteria
              <ol>
                 <li>Describe anticipated specific data exclusion criteria. For example:
                    <ol>                      
                        <li>Missing, erroneous, or overly consistent responses;</li>
                        <li>Failing check-tests or suspicion probes;</li>
                        <li>Demographic exclusions;</li>
                        <li>Data-based outlier criteria;</li>
                        <li>Method-based outlier criteria (e.g. too short or long response times)</li>
                    </ol>
                 </li>
              </ol>                           
          </li>
         </ol>                              
      </li>
 </ol>                                     
 <h1>C. Analysis Plan</h1>
 <ol>
    <li>Confirmatory Analyses (required)
         <ol>
            <li>Describe the analyses that will test the main predictions from the hypotheses section. Include for each main prediction individually:
              <ol>                            
                  <li>The relevant variables and how they are calculated;</li>
                  <li>The statistical technique;<br>
                                          [<b>Analyses conducted using generalized mixed-effects models. Subjects are nested within family (sibs) and families nested within site. Implemented using gamm4 function in R.</b>]</li>
                  <li>Each variable’s role in the technique (e.g., IV, DV, moderator, mediator, covariate);</li>
                  <li>Rationale for each covariate used, if any;<br>
                                          [<b>We controlled for site and family as random effects because these sources of variation are integral to the data sampling scheme of ABCD. We controlled for the six demographic categories as fixed effects because these are also integral to the design and recruitment of ABCD subjects.</b>]</li>
                  <li>If using techniques other than null hypothesis testing (for example, Bayesian statistics), describe your criteria and inputs toward making an evidential conclusion, including prior values or distributions.</li>
              </ol>                            
            </li>
         </ol>                                 
    </li>
    <li>Elements (required)
        <ol>
            <li>Specify contingencies and assumptions, such as:
               <ol>
                 <li>Methods of correction for multiple tests.</li>
                 <li>The method of missing data handling (e.g., pairwise or listwise deletion, multiple imputation).</li>
                 <li>Anticipated data transformations.</li>
                 <li>Assumptions of analyses and plans for alternative/corrected analyses if each assumption is violated.<br>
                                          [<b>If effects are non-linear, we will implement the appropriate transformation, or use quadratic or smooth effects.</b>]</li>
                 <li>Optionally, upload any files here that are related to your analyses (e.g., syntaxes, scripts, etc.).
                     <ol>
                                          <li>Up to 5 documents may be uploaded total for this pre-registration.<br>
                                          [<b>Scripts may be downloaded from ABCD Github (https://github.com/ABCD-STUDY/) with this pre-registration</b>]</li></ol>
                                              </li>
            </li>
        </ol>                                      
    </li>
  </ol>
   </li>
  </ol>                                            
  <h1>Final Questions</h1>
  <ol>
     <li>Have you looked at the data? (required)
        <ol>
          <li>Please choose:
             <ol>
                                              <li>Yes</li>
                                              <li>No</li>
             </ol>                                 
          </li>
          <li>If Yes, describe in detail how you have examined the data and how this relates to the hypotheses and analyses proposed in this pre-registration.</li>
        </ol>                                      
     </li>
     <li>Any additional comments before you pre-register this project (optional)</li>
   </ol>                                              
    <div class="spacer" style="margin-bottom: 60px;"></div>
      </div>
    </div>
</body>

<script src="js/jquery-3.2.1.min.js"></script>
<script src="js/popper.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/bootstrap-toggle.min.js"></script>
<script type="application/javascript">
    function updateModeInterface() {                                              
        if (mode == "restricted") {
            jQuery('.mode-title').text(restrictedModeTitle);
            jQuery('.mode-body').html(restrictedModeBody);
        } else {
            jQuery('.mode-title').text(unrestrictedModeTitle);                
            jQuery('.mode-body').html(unrestrictedModeBody);                
        }
    }
  
    var mode = "restricted";                                              
                                             
    var restrictedModeTitle = "Restricted Mode";
    var unrestrictedModeTitle = "Unrestricted Mode";

    var restrictedModeBody = "This mode help you prevents premature hypothesis tests in the <i>Analysis</i> application by disabling the submit button calculating the results. Hypothesis can still be saved and loaded.";
    var unrestrictedModeBody = "You have enabled all features of the Data Exploration and Analysis Portal.";
                                                                                          
    jQuery(document).ready(function() {
	// read the current mode if it exists and set the initial value
        jQuery.getJSON('modeChange.php', { 'action': 'read' }, function(data) {
            mode = data['mode'];
            // refresh the interface
            updateModeInterface();
        });        
        
        jQuery('#toggle-mode').on('click',function() {
            // store the mode change globally for the user and the project
            if (mode == "restricted") {
                mode = "unrestricted";
            } else {
                mode = "restricted";
            }
            updateModeInterface();
            jQuery.getJSON('modeChange.php', { 'action': 'save', 'mode': mode }, function(data) {
                console.log(data);
            });
            
        });
    });
</script>
