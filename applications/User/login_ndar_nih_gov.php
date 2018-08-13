<?php

$ok = session_start();

include("../../code/php/AC.php");

$incorrect = '';

if (isset($_POST["ac"]) && $_POST["ac"]=="log") { /// do after login form is submitted
    // ok, now we have the real password here for the username, test that on NDA
    $pw = $_POST['pw'];
    $user = $_POST['username'];
    
    $url = 'https://deapauth.nimhda.org/user/permissiongroup/Adolescent%20Brain%20Cognitive%20Development';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD, "$user:$pw");
    $result = curl_exec($ch);
    curl_close($ch);
    $res = json_decode($result);
    // {"permissionGroupTitle":"Adolescent Brain Cognitive Development","hasPermission":true,"expirationDate":"2018-12-02","status":"Approved"}
    if (isset($res['hasPermission']) && $res['hasPermission'] == true && $res['status'] == "Approved") {
        // ok, assume we have the permissions
        $_SESSION["logged"]=$user;        
    } else {
        audit( "login", "incorrect password for ".$_POST["username"] );
        $incorrect = 'Incorrect username/password. Please, try again.';
    }
    echo($result);
};
if (isset($_SESSION["logged"])) {
    $l = strlen('/login.php');
    if (isset($_POST["url"]) && $l > 0 && substr($_POST["url"],-$l) === '/login.php') {
        $u = $_POST["url"];
    } else {
        $u = "/index.php";
    }
    header("Location: ".$u); // if user is logged go to front page
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="Login to ABCD REPORT">
	<title>Login to the Data Analysis and Exploration portal</title>

	<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

	<link href="css/bootstrap.css" rel="stylesheet">
	<link href="css/bootstrap-responsive.min.css" rel="stylesheet">
	<link href="css/font-awesome.min.css" rel="stylesheet">
	<link href="css/bootswatch.css" rel="stylesheet">
        <link href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/start/jquery-ui.css" rel="stylesheet" type="text/css"/>
        <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
          <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->

<?php
        if ( $incorrect != "") {
          echo ("<script> incorrect = \"".$incorrect."\";</script>");
	}
?>

</head>
<body class="index" id="top">
  <div class="container">
   <div class="row">
     <div class="hero-unit">
       <h1>Data Analysis and Exploration Portal</h2>
       <center><i>A service provided by the <a href="https://abcd-workspace.ucsd.edu">Data Analysis and Informatics Core</a> of <a href="http://abcdstudy.org">ABCD</a></i></center>
       <p class="lead">
         This page requires a login. Logins are provided by your system administration.
       </p>
     </div>
   </div>
   <div class="row">
    <div class="span4"> </div>
    <div class="span3">
      <form action="login.php" method="post" id="login-form">
         <input type="hidden" name="ac" value="log">
         <input type="hidden" name="pw" id="pw">
         <input type="hidden" name="url" id="url" value="<?php echo $_GET['url']; ?>">
         <input type="text" name="username" placeholder="user" class="span3" autofocus/>
      </form>
      <input id="pw-field" type="password" name="password" placeholder="********" onkeypress="handleKeyPress(event, this.form)" class="span3"><br/>
      <div align="right">
         <input type="submit" class="btn" value="Login" form="login-form" class="span3"/><br>
         <!--<a href="requestLogin.php" class="small">request access</a> /--> <!-- <a href="newPassword.php" class="small">send new password</a> -->
      </div>
    </div>
   </div>
  </div>
  
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
  <!-- create an md5sum version of the password before sending it -->
  <script src="../../js/md5-min.js"></script>

  <script type="text/javascript">
     jQuery(document).ready(function() {
        if (typeof incorrect !== 'undefined') {
	   // should do a propper dialog here
            if (incorrect.length > 0) {
                alert(incorrect);
            } else {
                alert('Wrong user name or wrong password, please try again.');
            }
        }

        // prevent enter in the user field to submit form
        jQuery('input').keydown(function(event) {
           if (event.keyCode == 13) {
      	     if (jQuery(this).attr('name') == "username") {
               event.preventDefault();
	       jQuery('#pw-field').focus();
      	       return false;
             }
      	   }
        });
     
        // calculate and copy hash value after entering password
        jQuery('#pw-field').blur(function() {
            rewritePW();
        });
     });

     function rewritePW() {
           hash = hex_md5(jQuery('#pw-field').val());
           // we don't want to create the hash here, we need the full password - sounds dangerous
           // but we are talking to our own system here and we are using https.
           jQuery('#pw').val(jQuery('#pw-field').val());
           //jQuery('#pw').val(hash);     
     }

     function handleKeyPress(e, form) {
       var key = e.keyCode || e.which;
       if (key == 13) {
          rewritePW();
          jQuery('#login-form').submit();
       }
     }

  </script>

</body>
</html>
