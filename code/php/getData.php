<?php
// 
// All logged in users to download the Rds version of the merged data.
// (prevent direct download in apache2.conf by adding:
//
// <FilesMatch "\.Rds$">
//      Require all denied
// </FilesMatch>
//

  if(!isset($_SESSION)) { 
    session_start(); /// initialize session
  }
  include("AC.php");
  $user_name = check_logged(); /// function checks if visitor is logged.
  if (!$user_name)
     return; // nothing

  $attachment_location = $_SERVER["DOCUMENT_ROOT"] . "/data/ABCD/data_uncorrected/nda17.Rds";
  if (file_exists($attachment_location)) {
      header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
      header("Cache-Control: public"); // needed for internet explorer
      header("Content-Type: application/Rds");
      header("Content-Transfer-Encoding: Binary");
      header("Content-Length:".filesize($attachment_location));
      header("Content-Disposition: attachment; filename=\"nda17.Rds\"");
      readfile($attachment_location);
      die();        
  } else {
      die("Error: File not found.");
  } 
 ?>
 