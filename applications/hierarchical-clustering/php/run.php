<?php
// we don't do anything else here but run the model and return the data
$parameter = array();
if (!isset($_POST['variables'])) {
   $parameter = $_POST['variables'];
} else {
  echo(json_encode(array( "message" => "no variables specified" )));
  exit();
}

// setup the environment and run the code
$temp_file2 = tempnam(sys_get_temp_dir(), 'hiearchical-clustering-results');
$temp_file = tempnam(sys_get_temp_dir(), 'hiearchical-clustering-parameters');
file_put_contents($temp_file, json_encode($parameter));
$cmd = "/bin/bash -c \"conda activate scikit-learn && python hierarchical-clustering.py ".$temp_file." ".$temp_file2."\"";
$res = exec($cmd);
echo(file_get_contents($temp_file2));

?>