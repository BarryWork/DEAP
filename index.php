<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
    <title>DEAP</title>
    <meta name="description" content="Data Exploration and Analysis Portal">
    <meta name="keywords" content="ABCD">
     <meta name="theme-color" content="#4f4f4f">
    <link rel="shortcut icon" href="/imag/favicon.png">
    <!-- ========== ogp ========== -->
    <meta property="og:title" content="Data Explorationn and Analysis Portal">
    <meta property="og:url" content="http://relationdc.com">
    <meta property="og:image" content="http://relationdc.com/assets/img/common/og_rdc.png">
     <meta property="og:type" content="website">
    <meta property="og:description" content="A website">
    <meta property="og:site_name" content="A website">
    <!-- ========== style sheet ========== -->
    <link rel="stylesheet" href="/css/master.css">

<?php
$status = session_status();
if($status == PHP_SESSION_NONE){
       session_start();
}
$_SESSION['project_name'] = "ABCD";

if (isset($_SESSION['project_name'])) {
    echo('<script type="text/javascript"> project_name = "ABCD";</script>'."\n");
}

include("code/php/AC.php");
$user_name = check_logged(); /// function checks if visitor is logged.
echo('<script type="text/javascript"> user_name = "'.$user_name.'"; </script>'."\n");
// print out all the permissions
$permissions = list_permissions_for_user($user_name);
$p = '<script type="text/javascript"> permissions = [';
foreach($permissions as $perm) {
    $p = $p."\"".$perm."\",";
}
echo ($p."]; </script>\n");

$admin = false;
if (check_role( "admin" )) {
    $admin = true;
}
$can_qc = false;
if (check_permission( "can-qc" )) {
    $can_qc = true;
}
echo('<script type="text/javascript"> admin = '.($admin?"true":"false").'; can_qc = '.($can_qc?"true":"false").'; </script>');
?>
    <!-- ========== script ========== -->
    <script src="js/jquery-3.3.1.min.js"></script>
    <script src="/js/app.js"></script>
    <script src="/js/check.js"></script>
  </head>

  <body>
    <div class="wrapper">
      <header class="header"> <a class="header__logo" href="/NDA_Data_Use_Certification_NoSignatures.pdf" title="Link to NDA data use certification">ABCD</a>
        <dl class="header__info-list">
          <dt></dt>
          <dd>Adolescent Brain Cognitive Development</dd>
          <dt></dt>
          <dd><a href="https://scicrunch.org/resolver/SCR_016158" style="color: black;">Data Exploration and Analysis Portal</a></dd>
        </dl>
      </header>

      <div class="content">
        <div class="message">
          <div class="message__content">
            <h1 class="heading message__heading">
              <span class="heading__en">DEAP SCIENCE</span>
            </h1>
            <p class="lead message__text">
              <span style="font-size: 29px; margin-left: -2px;">Data Exploration and Analysis Portal</span>
              <br> <span style="font-size: 11pt; letter-spacing: 0;">A service provided by the Data Analysis and Informatics Center of the ABCD study</span>
              <br> </p>
            <div class="message__image" style="transform: translateY(0px);"></div>
            <p class="current">
              <span class="current__counter">2018</span> NDA17
            </p>
            <p class="login">
              Username:
              <span class="login__name" onclick="logout();" title="Logout the current user">name</span>
            </p>
          </div>
        </div>
      </div>
      <ol class="pagination">
        <li><a href="/applications/Help/" title="Help with using DEAP">Getting Started</a></li>
        <li><a href="/applications/Pre-Registration/" title="Pre-registration workflow">00 Plan</a></li>
        <li><a href="/applications/Ontology/hierarchy.php?entry=display" title="Ontology">01 Explore</a></li>
        <li><a href="/applications/Filter/index.php" title="Filter participants">02 Limit</a></li>
        <li><a href="/applications/NewDataExpo/index.php?model=GAMM4-FZ-CR" title="Multi-level Model">03 Analyse</a></li>
        <li><a href="/applications/Scores/" title="Calculate new scores">04 Extend</a></li>
        <!-- <li><a href="/applications/ModelBuilder" title="ModelBuilder">06 Model Zoo</a></li> -->
      </ol>
    </div>
     <div class="bline bline1"></div>
     <div class="bline bline2"></div>
     <div class="bline bline3"></div>
     <div class="bline bline4"></div>
     <div class="bline bline5"></div>
    <div class="starter">
        <div class="starter-text">Data Exploration and Analysis Portal</div>
        <div class="starter-subtext">Loading <span>.</span><span>.</span><span>.</span></div>
    </div>
  </body>
</html>
