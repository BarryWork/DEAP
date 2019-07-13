$( document ).ready(function() {
    jQuery.get("code/php/getServiceStatus.php",function(data){
	data = JSON.parse(data);
	console.log(data);
	if (Array.isArray( data["Rserve-status"])){
	    if (data["Rserve-status"][0] > 100 &&  data["Rserve-status"][1] > 3) {
		jQuery("body").append("<span class = 'dot' title='This DEAP instance appears to be working as expected. Report any issues you find to the DEAP github issue tracker at github.com/ABCD-STUDY/DEAP/.'></span>")
	    }
	    
	    if ( JSON.parse(localStorage.getItem('src_subject_id')) && JSON.parse(localStorage.getItem('src_subject_id')).length != data["Rserve-status"][0]) {
		console.log("Warning: miss-match of number of subjects in local storage with rserve backend. Clearing local storage for this browser.");
		window.localStorage.clear();
	    }
	} else {
	    jQuery("body").append("<span class = 'dot' style='background-color:red' title='This DEAP instance seems to have a technical problem. Please contact the NDA help desk and inform them of the issue.'></span>")
	}
    })    
});


