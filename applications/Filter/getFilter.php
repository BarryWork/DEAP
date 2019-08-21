<?php

// make sure user is logged in
session_start();
//#include_once("../../code/php/analytics.php");
include("../../code/php/AC.php");
$user_name = check_logged();
if ($user_name == FALSE || $user_name == -1) {
  echo "no user name";
  return;
}

$fn = "/var/www/html/data/ABCD/Filter/data/".$user_name.".json";
#if (!is_readable($fn)) {
#  echo "could not find ".$fn;
#  return;
#}

$action = "read";
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

if ($action == "read") {

    $aruser = array();
    if (is_readable($fn)) {
        $aruser = json_decode( file_get_contents($fn), TRUE);
        $aruser[0]['name'] = $user_name;
    }
    
    $fn = "/var/www/html/data/ABCD/Filter/data/public.json";
    if (is_readable($fn)) {
        $puuser = json_decode( file_get_contents($fn), TRUE);
        if ( !empty($aruser)) {
            $aruser = array_merge( $aruser, $puuser );
        } else {
            $aruser = $puuser;
        }
    }
    echo json_encode( $aruser );
} else if ($action == "save") {
    $name = "";
    if (isset($_GET['name'])) {
        $name = htmlspecialchars($_GET['name']);
    }
    $value = "";
    if (isset($_GET['value'])) {
        $value = $_GET['value'];
    }
    
    $aruser = array();
    if (is_readable($fn)) {
        $aruser = json_decode( file_get_contents($fn), TRUE);
    }
    $found = false;
    for ($i = 0; $i < count($aruser[0]['rules']); $i++) {
        if ($aruser[0]['rules'][$i]['name'] == $name) {
            $found = true;
            $aruser[0]['rules'][$i]['func'] = $value;
            break;
        }
    }
    if (!$found) {
        $aruser[0]['rules'][] = array("name" => $name, "func" => $value );
    }
    file_put_contents($fn, json_encode($aruser));
} else if ($action == "delete") { // needs to be tested first
    $name = "";
    if (isset($_GET['name'])) {
        $name = htmlspecialchars($_GET['name']);
    }
    // only delete if its for the current user - don't delete otherwise, produce error
    
    $aruser = array();
    if (is_readable($fn)) {
        $aruser = json_decode( file_get_contents($fn), TRUE);
    } else {
        echo("{ \"message\": \"Error: Could not read the file ".$fn."\"}");
        return;
    }
    $found = false;
    for ($i = 0; $i < count($aruser[0]['rules']); $i++) {
        if ($aruser[0]['rules'][$i]['name'] == $name) {
            $found = true;
            // delete this entry now...
            unset($aruser[0]['rules'][$i]);
            $aruser[0]['rules'] = array_values($aruser[0]['rules']);
            break;
        }
    }
    if (!$found) {
        echo("{ \"message\": \"Error: could not find that score as a user defined score.\" }");
    } else { // save again
        file_put_contents($fn, json_encode($aruser));
        echo("{ \"message\": \"ok\" }");
    }
}

?>
