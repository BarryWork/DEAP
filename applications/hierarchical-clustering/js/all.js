var sets = [];

function getAllSets() {
    jQuery.getJSON('../Sets/getSets.php', { "action": "get" }, function(data) {
	sets = data;
        jQuery('#sets-list').append("<option item=''></option>");
	for (var i = 0; i < data.length; i++) {
	    jQuery('#sets-list').append('<option item="' + data[i]['id'] + '">' + data[i]['name'] + ' (' + data[i]['variables'].length + ' variables)</option>');
	}
	jQuery('#sets-list').select2();
    });
}

function visualize(data) {
    console.log(JSON.stringify(data));
}

jQuery(document).ready(function() {
    // add all known sets to the user interface
    getAllSets();

    jQuery('#sets-list').on('change', function() {
	var s = jQuery(this).find('option:selected').attr('item');
	var variables = [];
	for (se_idx in sets) {
	    var se = sets[se_idx];
	    if (se['id'] == s) {
		variables = se['variables'];
	    }
	}
	// now we can do something with these variables - run an external module in python
	jQuery.post('php/run.php', { 'action': 'hierarchical-clustering', 'variables': variables }, function(data) {
	    visualize(data);
	});
    });
});
