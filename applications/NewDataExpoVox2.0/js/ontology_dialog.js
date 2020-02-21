

function insert_ontology_modal(){
    var div = jQuery(
       '<div style = "position:relative;">' 
	+'<div id="dialog-form-ontology" class="span6" title="Ontology" style="width:100%;height:80%">'
          +'<div class="row-fluid" style="margin-top: 50px;">'
            +'<div>'
              +'<div class="form-group">'
                +'<input class="form-control input-lg" id="search" type="text" autocomplete="off" style="width:100%">'
                +'<span style="color: gray; margin-left: 20px; font-weight: 200;">examples: intelligence, schizophrenia</span>'
              +'</div>'
            +'</div>'
          +'</div>'
          +'<div class="row-fluid" style="position: relative;">'
            +'<div class="col-md-11">'
              +'<div id="search-summary"></div>'
            +'</div>'
          +'</div>'
          +'<div class="row-fluid" style="position: relative; margin-top: 10px;">'
            +'<div class="col-md-11" style="min-height: 80%;">'
              +'<dl class="search-results" id="results"></dl>'
            +"</div>"
         +"</div>"
        +"</div>"
       +"</div>");
   var dialog = jQuery(
        '<div class="modal fade" tabindex="-1" id = "ontology-explore" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">'
          +'<div class="modal-dialog modal-xl">'
          +'<div class="modal-content">'
	      +'<div class="modal-header">'
        	+'<h5 class="modal-title" id="">Ontology</h5>'
        	+'<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
          	 +'<span aria-hidden="true">&times;</span>'
        	+'</button>'
	      +'</div>'
	      +'<div class="modal-body" style = "height: 80vh; overflow: auto">'
		+'<div class="row-fluid">'
            	+'<div>'
              +'<div class="form-group">'
                +'<input class="form-control input-lg" id="search" type="text" autocomplete="off" style="width:100%">'
                +'<span style="color: gray; margin-left: 20px; font-weight: 200;">examples: intelligence, schizophrenia</span>'
              +'</div>'
            +'</div>'
          +'</div>'
          +'<div class="row-fluid" style="position: relative;">'
            +'<div class="col-md-12">'
              +'<div id="search-summary" style = "max-height:90%"></div>'
            +'</div>'
          +'</div>'
          +'<div class="row-fluid" style="position: relative; margin-top: 10px;">'
            +'<div class="col-md-12" style="max-height: 80%;">'
              +'<dl class="search-results" id="results"></dl>'
            +"</div>"
         +"</div>"
      	      +'</div>'
	      +'<div class="modal-footer ui-dialog-buttonpane" style = "overflow:auto">'
        	//+'<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'
        	+'<button type="button" class="explore-add btn btn-primary">Add</button>'
      	      +'</div>'
          +'</div>'
          +'</div>'
         +'</div>'
        ).appendTo(jQuery("body"));    

    return div;
}


function ontology_lisener(){
    jQuery('#search').focus();
    jQuery('#search').on('keyup', function(event) {
	var t = jQuery('#search').val();
	search(t);
    });
}
