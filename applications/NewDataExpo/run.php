<?php

session_start();
include("../../code/php/AC.php");
$user_name = check_logged();
if (isset($_SESSION['project_name']))
    $project_name = $_SESSION['project_name'];
else {
    $projs = json_decode(file_get_contents('/var/www/html/code/php/getProjectInfo.php'),TRUE);
    if ($projs)
        $project_name = $projs[0]['name'];
    else
        $project_name = "Project01";
}


$action = "start";
if (isset($_POST['action'])) {
    $action = $_POST['action'];
}


#syslog(LOG_EMERG,$action);


if( $action == "start" && isset($_POST["jsondata"]) && isset($_POST["code"] ))
{
    if(isset($_POST["rcode"])){
        $rcode = $_POST["rcode"];
        $code = $_POST["code"];
        $dirname = "/var/www/html/data/".$project_name."/NewDataExpo/usercache/".$user_name."_".$code;
        if(!file_exists($dirname)){
            mkdir($dirname, 0777);
        } 
        file_put_contents($dirname."/r_code.json",$rcode) or die ("Cannot write  specification file");   ;
        exec("cd ./rserve; node ./runR.js '".$dirname."/r_code.json"."'  > /dev/null &");
        echo "success";

        
    }else{
        $dataString = $_POST["jsondata"];
        $code = $_POST["code"];


        $dirname = "/var/www/html/data/".$project_name."/NewDataExpo/usercache/".$user_name."_".$code;
        if(!file_exists($dirname)){
            mkdir($dirname, 0777);
        }

        file_put_contents($dirname."/model_specification.json",$dataString) or die ("Cannot write  specification file");   ; 
        exec("cd ../ModelBuilder/runner/; ./runner.js run -o ".$dirname." ".$dirname."/model_specification.json  > /dev/null &"); 
        echo "success";
    }
} else if ($action == "read") { 
    $code = "*"; 

    if(isset($_POST["code"])){
        $code = $_POST["code"];
    }

    if(isset($_POST["time"])){
        $time = $_POST["time"];
    }
    $dirname = "/var/www/html/data/".$project_name."/NewDataExpo/usercache/*_".$code;
    $files = glob($dirname, GLOB_ONLYDIR);
    $owner_id = explode("usercache", $files[0])[1];
    #when code is set up and glob find the directory
    if(count($files) >0 and $code != "*"){
        $plot_scatter = glob($dirname."/*_scatter.json");
        $plot_statistics = glob($dirname."/*_statistics.json");
        $plot_lineplot = glob($dirname."/*_lineplot.json");
        $plot_output = glob($dirname."/*_output.txt");
        if(count($plot_scatter) > 0 and count($plot_statistics) > 0 and count($plot_lineplot)> 0){
            $ret = array();
            $paths = pathinfo($plot_scatter[0]);
            $ret["scatter"] = "/data/".$project_name."/NewDataExpo/usercache/".$owner_id."/".$paths['basename'];	
            $paths = pathinfo($plot_statistics[0]);
            $ret["statistics"] = "/data/".$project_name."/NewDataExpo/usercache/".$owner_id."/".$paths['basename'];	
            $paths = pathinfo($plot_lineplot[0]);
            $ret["lineplot"] = "/data/".$project_name."/NewDataExpo/usercache/".$owner_id."/".$paths['basename'];
            echo(json_encode($ret));
	
	}else {
	    $file_size = 0 ; 
	    for($ef = 0 ; $ef < count($plot_output); $ef++){
                $paths = pathinfo($plot_output[$ef]);
                $ret["error"][] = "/data/".$project_name."/NewDataExpo/usercache".$owner_id."/".$paths['basename'];
		$file_size = $file_size + filesize("/var/www/html/data/".$project_name."/NewDataExpo/usercache".$owner_id."/".$paths['basename']);
            } 
    	    if( $time > 120 || ($file_size > 108 and count($plot_output) == 4)){

		echo(json_encode($ret));
		return;
	    }
            echo("Not found");
        }   
        return;

    } 

    if(count($files) == 0){
        echo("Not found");
    }
    else{
        echo(json_encode($files));
    }
    // return an array of directories and if they are done processing
    //foreach($files as $file) {
    //	echo($file);	
    //}

} else if ($action == "readThis") {
    $code = "";
    if (!isset($_POST['code'])) {
        echo ("Error: could not read a code");
        return;
    }
    $code = $_POST['code'];
    // collect all the output files in the directory and returns them to the client for printing
    echo("{}");
}else if ($action == "loadModelList") {
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json")){
	$saved_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json"),true);
	$temp_out_save = array();
	foreach($saved_model_list as $name => $item){
		if ( $user_name == "admin" || $item["author"] == $user_name){
			$temp_out_save[$name] = $item; 
		}

	}
	$saved_model_list = $temp_out_save;
    }
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json")){
        $public_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json"),true);
    }
    echo json_encode((object) array_merge( (array) $public_model_list,(array) $saved_model_list));
}else if ($action == "saveModel" && isset($_POST["nameTag"]) && isset($_POST["json_code"]) && isset($_POST["sharing_status"])) {
    $name_tag = $_POST["nameTag"];
    $status = $_POST["sharing_status"];
    $script = $_POST["json_code"];
    $new_model = array();
    $new_model["status"] = $status;
    $new_model["author"] = $user_name;
    $new_model["json"] = $script;
    $date_now = new DateTime();
    $new_model["last-edit-time"] = $date_now->format('Y-m-d H:i:s T'); 
    //syslog(LOG_EMERG,json_encode($new_model));
    $saved_model_list = array();
    $public_model_list = array();
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json")){
	$saved_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json"),true); 
    }
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json")){
	$public_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json"),true); 
    }
    if($status == "private"){
	$saved_model_list[$user_name.'-'.$name_tag] = $new_model; 
    }
    if($status == "public"){
	$public_model_list['[Public]'.$user_name.'-'.$name_tag] = $new_model; 
    }
    file_put_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json",json_encode($saved_model_list));
    file_put_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json",json_encode($public_model_list));
    echo "success";
} else if ($action == "deleteModel" && isset($_POST["nameTag"])) {
    $name_tag = $_POST["nameTag"];
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json")){
        $saved_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json"),true);
    }
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json")){
        $public_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json"),true);
    }
    unset($saved_model_list[$name_tag]);
    unset($public_model_list[$name_tag]);
    file_put_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json",json_encode($saved_model_list));
    file_put_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json",json_encode($public_model_list));
    echo "deleted";
}else if( $action == "saveResult" && isset($_POST["nameTag"]) && isset($_POST["code"] )){
    $name_tag = $_POST["nameTag"];
    $code = $_POST["code"];
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json")){
        $saved_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json"),true);
    }
    if(file_exists("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json")){
        $public_model_list = json_decode(file_get_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json"),true);
    }
	 
    if(isset($saved_model_list[$name_tag])){
	$saved_model_list[$name_tag]["result-code"] = $code;
    }

    if(isset($public_model_list[$name_tag])){
	$public_model_list[$name_tag]["result-code"] = $code;
    }
    file_put_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/saved_models.json",json_encode($saved_model_list));
    file_put_contents("/var/www/html/data/".$project_name."/NewDataExpo/usercache/public_models.json",json_encode($public_model_list));
    
    echo "result saved";
}else if( $action == "getDownloadList" && isset($_POST["code"] )){
    $code = "*";

    if(isset($_POST["code"])){
        $code = $_POST["code"];
    }
    $dirname = "/var/www/html/data/".$project_name."/NewDataExpo/usercache/*_".$code;
    $files = glob($dirname, GLOB_ONLYDIR);
    syslog(LOG_EMERG,json_encode($files));
    $owner_id = explode("usercache", $files[0])[1];
    #when code is set up and glob find the directory
    if(count($files) >0 and $code != "*"){
        $plot_data = glob($dirname."/*_tunnel.json");
	
    	syslog(LOG_EMERG,json_encode($plot_data));
        $plot_rcode = glob($dirname."/gamm4_*.R");
	if(count($plot_data) > 0 and count($plot_rcode) > 0){
    	    syslog(LOG_EMERG,json_encode($files));
            $ret = array();
	    
            $paths = pathinfo($plot_data[0]);
            $ret["data"] = "/data/".$project_name."/NewDataExpo/usercache/".$owner_id."/".$paths['basename'];
	    $size_table = array();
	    foreach( $plot_rcode as $r){
		$size_table[$r] = filesize($r);
	    }
	    //find which is the complete r code
	    $largest_file = "";
	    $largest_size = 0;
	    foreach($size_table as $path => $value){
		if($largest_size < $value){
		    $largest_size = $value;
		    $largest_file = $path;
		}
	    }
	    $paths = pathinfo($largest_file);
	    $ret["r-code"] = "/data/".$project_name."/NewDataExpo/usercache".$owner_id."/".$paths['basename']; 
            echo(json_encode($ret));
        }
    }
}


?>
