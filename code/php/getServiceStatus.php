<?php
    $output = array();
    $rserve_status = shell_exec("node /var/www/html/code/js/getRserveStatus.js");
    $output["Rserve-status"] = json_decode($rserve_status);
    $vinfo_status = shell_exec("node /var/www/html/code/js/getVinfoStatus.js ". json_decode($rserve_status)[1]);
    $output["Vinfo-status"] = json_decode($vinfo_status);
    $output["Ontology-status"] = json_decode(shell_exec("node /var/www/html/code/js/getOntologyServerStatus.js"));

    echo json_encode($output);
    return json_encode($output);
?>
