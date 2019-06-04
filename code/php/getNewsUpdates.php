<?php
$ch = curl_init("https://abcd-report.ucsd.edu/applications/DEAP-news/data/updates.html");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
$output = curl_exec($ch);

print($output);
?>

