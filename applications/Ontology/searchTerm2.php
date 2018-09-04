<?php

$v = '';
if (isset($_GET['search'])) {
    $v = $_GET['search'];
}
if (isset($_GET['getComments'])) {
   $contents = file_get_contents("https://abcd-report.ucsd.edu/applications/link-ontology/getComments.php?item=" . $_GET['getComments']);
   // we can check for info from R as well here
   $ff = glob('../NewDataExpo/variableInfo/' + $_GET['getComments'] + '*.json');
   if (count($ff) > 0) {
      $more = json_decode(file_get_contents($ff[0]),true);
      $content['stat'] = $more;
   }

   if ($contents !== false) {
      echo($contents);
   } else {
      echo("[]");
   }
   return;
}
if (isset($_GET['getStats'])) {
   $variable = $_GET['getStats'];
   $content = file_get_contents("/var/www/html/applications/NewDataExpo/variableInfo/" . $variable . ".json");
   echo($content);
   return;
}

// lets talk to the memory resistent node
function getStatus() {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1');

    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
    curl_setopt($ch, CURLOPT_PORT, 8001);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    curl_setopt($ch, CURLOPT_POST, TRUE);

    $pf = array( 'status' => "1" );
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($pf));

    $body = curl_exec($ch);
    curl_close($ch);
    if ($body == "") {
        $body = "[]";
    }
    echo($body);
}
if (isset($_GET['status'])) {
    getStatus();
    return;
}

if (isset($_GET['teach'])) {
    $teach = $_GET['teach'];
    syslog(LOG_EMERG, "got: " . $teach);
    $teach = json_decode($teach);
    $teach[0] = strtolower($teach[0]);
    $teach[1] = strtolower($teach[1]);

    //add this information to the local teaching file
    $db = array();
    if (file_exists('teach.json')) {
        $db = json_decode(file_get_contents('teach.json'), true);
    }
    if (isset($db[$teach[0]]) && !in_array($teach[1], $db[$teach[0]])) {
        $db[$teach[0]][] = $teach[1];
    } else {
        $db[$teach[0]] = array($teach[1]);
    }
    file_put_contents('teach.json', json_encode($db));
    echo("{ \"message\": \"teaching " . $teach[0] . " is a " . $teach[1] . "\" }");
}
if (isset($_GET['unteach'])) {
    $unteach = $_GET['unteach'];
    //syslog(LOG_EMERG, "got: " . $unteach);
    $unteach = json_decode($unteach);
    $unteach[0] = strtolower($unteach[0]);
    $unteach[1] = strtolower($unteach[1]);

    $db = array();
    if (file_exists('teach.json')) {
        $db = json_decode(file_get_contents('teach.json'), true);
    }
    if (isset($db[$unteach[0]]) && in_array($unteach[1], $db[$unteach[0]])) {
        $idx = array_search($unteach[1], $db[$unteach[0]]);
        //syslog(LOG_EMERG, "idx is: " . $idx);
        array_splice($db[$unteach[0]], $idx, 1);
        //syslog(LOG_EMERG, "db is: " . json_encode($db));        
        file_put_contents('teach.json', json_encode($db));
        echo ("{ \"message\": \"tried to unlearn\" }");    
    }
    return;
}
if (isset($_GET['whathaveyoulearned'])) {
    $db = file_get_contents('teach.json');
    echo($db);
    return;
}
// allow Scores to add variables to local_data.json (only Scores values can be edited)
// this would force
if (isset($_GET['scoresAdd'])) {
    $newMeasure = json_decode(urlencode($_GET['scoresAdd'])); // should this be a post to be able to work with longer descriptions?
    if (!isset($newMeasure['name']) || !isset($newMeasure['description']) || !isset($newMeasure['notes']) || !isset($newMeasure['aliases'])) {
        syslog(LOG_EMERG, "ERROR: scoresAdd requires name, description, notes, and aliases");
        return;
    }
    $newMeasures['origin'] = "Scores";
    $local_data = json_decode(file_get_contents("local_data.json"), true);
    $found = false;
    for ($i = 0; $i < count($local_data); $i++) {
        if ($newMeasures['name'] == $local_data[$i]['name']) {
            if (isset($local_data[$i]['origin']) && $local_data[$i]['origin'] == "Scores") {
                $found = true;
                // replace with new values
                $local_data[$i] = $newMeasures;
                break;
            } else {
                echo("{ \"message\": \"Error: trying to save a known variable that is not derived from the Scores application\"}");
                return;
            }
        }
    }
    if (!$found) {
        $local_data[] = $newMeasures;
    }
    file_put_contents('local_data.json', json_encode($local_data, JSON_PRETTY_PRINT));
    echo("{ \"message\": \"done\"}");
    return;
}
if (isset($_GET['scoresRemove'])) {
    $name = $_GET['scoresRemove'];
    $local_data = json_decode(file_get_contents("local_data.json"), true);
    $found = false;
    for ($i = 0; $i < count($local_data); $i++) {
        if ($name == $local_data[$i]['name']) {
            if (isset($local_data[$i]['origin']) && $local_data[$i]['origin'] == "Scores") {
                $found = true;
                // remove
                unset($local_data[$i]);
                $local_data = array_values($local_data);
                break;
            } else {
                echo("{ \"message\": \"Error: trying to remove a measure is not derived from the Scores application\"}");
                return;
            }
        }
    }
    file_put_contents('local_data.json', json_encode($local_data, JSON_PRETTY_PRINT));
    echo("{ \"message\": \"done\"}");
    return;
}

if ($v == '') {
    echo ("{ \"message\": \"no search term specified\"}");
    return;
}


if (strlen($v) < 2) {
    $v = "";
    echo ("{ \"message\": \"search term too small, more than 1 characters is required\"}");
    return;
}

// lets talk to the memory resistent node
function notifyNode($data) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1');

    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
    curl_setopt($ch, CURLOPT_PORT, 8001);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    curl_setopt($ch, CURLOPT_POST, TRUE);

    $pf = array('search' => $data );
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($pf));

    $body = curl_exec($ch);
    //syslog(LOG_EMERG, "got back =>" .$body);
    curl_close($ch);
    if ($body == "") {
        $body = "[]";
    }
    echo($body);
}

notifyNode($v);

?>