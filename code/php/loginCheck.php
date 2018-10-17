<?php
// Check if we are still logged in
$page="";
if (isset($_GET['page'])) {
    $page = $_GET['page'];
}

if (!isset($_SESSION)) { 
    session_start(); /// initialize session
}
include("AC.php");
$user_name = check_logged_only(); /// function checks if visitor is logged.
if (!$user_name) {
    // not logged in anymore
    echo("{ 'login': 0 }");
    return; // nothing
}
echo("{ 'login': 1 }");

?>
 