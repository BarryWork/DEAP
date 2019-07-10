<?php
// should check if we are logged in
$value = "";
if (isset($_GET['value'])) {
    $value = $_GET['value'];
} else {
    echo("{ \"message\": \"Error, no value specified\" }");
    return; // nothing to do
}
$file = "";
if (isset($_GET['file'])) {
    $file = $_GET['file'];
}

$output = array();
exec("cd /var/www/html/applications/Filter/; /usr/bin/nodejs ./getTable1.js ".$value. " ".$file, $output);
//syslog(LOG_EMERG, "got back: ".implode(" ", $output));
$output = json_decode(implode(" ", $output),true);
$output = implode(" ", $output[0]);
//syslog(LOG_EMERG, "got back: ".json_encode(array($output)));
echo(json_encode(array($output)));
?>