$( document ).ready(function() {
    jQuery.get("code/php/getServiceStatus.php",function(data){
	data = JSON.parse(data);
       if(Array.isArray( data["Rserve-status"])){
             if(data["Rserve-status"][0] > 100 &&  data["Rserve-status"][1] > 3){
                jQuery("body").append("<span class = 'dot'>R</span>")
             }
	     if( JSON.parse(localStorage.getItem('src_subject_id')) && JSON.parse(localStorage.getItem('src_subject_id')).length != data["Rserve-status"][0]){
		window.localStorage.clear();
	     }
       }
       else{
	     window.localStorage.clear();
       }
    })    
});


