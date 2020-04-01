<?php
// we don't do anything else here but run the model and return the data

$parameter = array();
if (isset($_POST['variables'])) {
  $parameter = $_POST['variables'];
} else {
  echo(json_encode(array( "message" => "no variables specified" )));
  exit();
}
$target = array();
if (isset($_POST['target'])) {
  $target = $_POST['target'];
} else {
  echo(json_encode(array( "message" => "no target variable defined" )));
  exit();
}
$filterOutliersTarget = "";
if (isset($_POST['filterOutliersTarget'])) {
  $filterOutlierTarget = $_POST['filterOutliersTarget'];
}
$filterOutliersExplanatory = "";
if (isset($_POST['filterOutliersExplanatory'])) {
  $filterOutlierExplanatory = $_POST['filterOutliersExplanatory'];
}

$strat_family = "";
if (isset($_POST['stratification_family_id'])) {
  $strat_family = $_POST['stratification_family_id'];
}
$strat_sex = "";
if (isset($_POST['stratification_sex'])) {
  $strat_sex= $_POST['stratification_sex'];
}

$params = array();
$params['variables'] = $parameter;
$params['target'] = $target;
$params['filterOutliersTarget'] = $filterOutliersTarget;
$params['filterOutliersExplanatory'] = $filterOutliersExplanatory;
$params['stratification_family_id'] = $strat_family;
$params['stratification_sex'] = $strat_sex;

// setup the environment and run the code
$temp_file2 = tempnam(sys_get_temp_dir(), 'abcd_ml-results');
// the parameter file from the web-page
$temp_file = tempnam(sys_get_temp_dir(), 'abcd_ml-parameters');
file_put_contents($temp_file, json_encode($params));

file_put_contents("/tmp/bla", $temp_file);

// this call needs to run as the www-data user - not root
// We should also run this in the background - might take too long otherwise
$cmd = "/bin/bash -c \". /etc/profile.d/conda.sh; conda activate ABCD_ML; /opt/conda/envs/ABCD_ML/bin/python /var/www/html/applications/Example-ABCD_ML2/php/example-abcd_ml.py -p ".$temp_file." -o ".$temp_file2." 2>&1\"";
$res = exec($cmd);
echo(file_get_contents($temp_file2));

// delete the output file again - pollutes space otherwise
//unlink($temp_file);
//unlink($temp_file2);
?>
