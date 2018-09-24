$( document ).ready(function() {
    jQuery.get("code/php/getServiceStatus.php",function(data){
       if(Array.isArray( data["Rserve-status"])){
             if(data["Rserve-status"][1] > 100 &&  data["Rserve-status"][2] > 3){
                jQuyer("body").append("<span class = 'dot'>&nbsp;&nbsp;R</span>")
             }
       } 
    })    
});


