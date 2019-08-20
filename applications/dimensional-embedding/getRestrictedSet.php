<?php

 // make sure user is logged in
 session_start();
 include("../../code/php/AC.php");
 $user_name = check_logged();
 if ($user_name == FALSE) {
   echo "no user name";
   return;
 }

 $measures = array();
 $project_name = "";

 if (isset($_POST['variables'])) {
   $measures = json_decode($_POST['variables']);
 } else {
   echo("{ \"message\": \"no variables requested\" }");
   return;
 }

 if (isset($_POST['project_name'])) {
   $project_name = $_POST['project_name'];
 } else {
   echo("{ \"message\": \"no project specified\" }");
   return;
 }   

 // read the user spreadsheet, extract columns of interest and return as json
 $fname = "/home/dataportal/www/applications/DataExploration/user_code/usercache_" . $project_name . "_" . $user_name . ".RData";
 if (!is_readable($fname)) {
   echo("{ \"message\": \"user cached RData file is not readable\" }");
   return;    
 }

 $outfname = tempnam("/tmp", "getRestrictedSet");

 $out = array();
 $cmd = '/usr/bin/R --no-restore --no-save -q -f getRestrictedSet.R --args iname=\"'.$fname.'\" oname=\"'.$outfname.'\" variables=c\\\(\\\"'.implode("\\\",\\\"",$measures).'\\\"\\\) 2>&1';
 exec ('/usr/bin/R --no-restore --no-save -q -f getRestrictedSet.R --args iname=\"'.$fname.'\" oname=\"'.$outfname.'\" variables=c\(\"'.implode("\\\",\\\"",$measures).'\"\) 2>&1', $out);
 echo(file_get_contents($outfname));

?>
