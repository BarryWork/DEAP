<?php
# store the current mode for this user on the system

// make sure user is logged in
session_start();
include("../../code/php/AC.php");
$user_name = check_logged();
if ($user_name == FALSE) {
  echo "no user name";
  return;
}

$fn = "/var/www/html/data/ABCD/Pre-Registration/".$user_name.".json";

$action = "read";
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

if ($action == "read") {
    $contents = "{ 'mode': 'restricted' }";
    if (file_exists($fn)) {
        $contents = json_decode(file_get_contents($fn),true);
    }
    echo(json_encode($contents));
    return;
} elseif ($action == "save") {
    $mode = "restricted";
    if (isset($_GET['mode'])) {
        $mode = $_GET['mode'];
    }
    file_put_contents($fn, json_encode(array('mode' => $mode)));
    return;
}


?>