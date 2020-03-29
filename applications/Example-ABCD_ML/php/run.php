<?php
// we don't do anything else here but run the model and return the data
$parameter = array();
if (isset($_POST['variables'])) {
  $parameter = $_POST['variables'];
} else {
  echo(json_encode(array( "message" => "no variables specified" )));
  exit();
}

// setup the environment and run the code
$temp_file2 = tempnam(sys_get_temp_dir(), 'abcd_ml-results');
$temp_file = tempnam(sys_get_temp_dir(), 'abcd_ml-parameters');
file_put_contents($temp_file, json_encode($parameter));
// this call needs to run as the www-data user - not root
$cmd = "/bin/bash -c \". /etc/profile.d/conda.sh; conda activate ABCD_ML; /opt/conda/envs/scikit-learn/bin/python /var/www/html/applications/Example-ABCD_ML/php/example-abcd_ml.py -p ".$temp_file." -o ".$temp_file2." 2>&1\"";
$res = exec($cmd);
echo(file_get_contents($temp_file2));

// delete the output file again - pollutes space otherwise
unlink($temp_file);
unlink($temp_file2);
?>
