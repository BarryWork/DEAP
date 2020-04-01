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
    var width = jQuery('body').width(),
	height = 550;
    var cluster = d3.layout.cluster()
	.size([height, width - 160]);
    var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });
    var svg = d3.select("#hierarchy").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(40,0)");
    root = data;
    var nodes = cluster.nodes(root),
	links = cluster.links(nodes);
    var link = svg.selectAll(".link")
	.data(links)
	.enter().append("path")
	.attr("class", "link")
	.attr("d", diagonal);
    var node = svg.selectAll(".node")
	.data(nodes)
	.enter().append("g")
	.attr("class", "node")
	.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
    node.append("circle")
	.attr("r", 4.5);
    node.append("text")
	.attr("dx", function(d) { return d.children ? -8 : 8; })
	.attr("dy", 3)
	.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
	.text(function(d) { return d.name; });
    
    d3.select(self.frameElement).style("height", height + "px");
}

jQuery(document).ready(function() {
    // add all known sets to the user interface
    getAllSets();
    jQuery('#progress').hide();

    jQuery('#filter-outliers').select2();
    jQuery('#filter-outliers2').select2();

    jQuery('#start-analysis').on('click', function() {
	data = {};
	var s = jQuery('#sets-list').find('option:selected').attr('item');
	var variables = [];
	for (se_idx in sets) {
	    var se = sets[se_idx];
	    if (se['id'] == s) {
		variables = se['variables'];
	    }
	}
	explain = jQuery('#explain-this').val();
	data['filterOutliersTarget'] = jQuery('#filter-outliers').val(); // should be something like 34
	data['filterOutliersExplanatory'] = jQuery('#filter-outliers2').val(); // should be something like 6
	data['stratification-family-id'] = 0;
	data['stratification-sex'] = 0;
	if (jQuery('#family-id-toggle').parent().hasClass('active'))
	    data['stratification-family-id'] = 1;
	if (jQuery('#sex-toggle').parent().hasClass('active'))
	    data['stratification-sex'] = 1;
	
	
	data['variables'] = variables; // list of covars
	data['explain'] = explain;
	// now we can do something with these variables - run an external module in python
        jQuery('#progress').show();
	jQuery.post('php/run.php', { 'action': 'example-abcd_ml',
				     'variables': data['variables'],
				     'target': data['explain'],
				     'filterOutliersTarget': data['filterOutliersTarget'],
				     'filterOutliersExplanatory': data['filterOutliersExplanatory'],
				     'stratification_family_id': data['stratification-family-id'],
				     'stratification_sex': data['stratification-sex']
				   }, function(data) {
				       console.log("success");
				       //visualize(data);
				       jQuery('#timing').html("<br/>timing:" + JSON.stringify(data['timing']));
				       jQuery('#results').children().remove();
				       jQuery('#results').append("<h4 style='margin-top: 40px;'>Validation Scores</h4>");
				       jQuery('#results').append("<div>Metric: <b>r2</b></div>");
				       jQuery('#results').append("<div>Mean Validation score:  " + data['r2-mean-validation-score'] + "</div>");
				       jQuery('#results').append("<div>Std in Validation score:  " + data['r2-std-in-validation-score'] + "</div>");
				       jQuery('#results').append("<div style='margin-top: 30px;'>Metric: <b>neg mean absolute error</b></div>");
				       jQuery('#results').append("<div>Mean Validation score:  " + data['neg-mean-absolute-error-mean-validation-score'] + "</div>");
				       jQuery('#results').append("<div style='margin-bottom: 100px;'>Std in Validation score:  " + data['neg-mean-absolute-error-std-in-validation-score'] + "</div>");
				       
				       jQuery('#results').append(data['results']);
				       jQuery('#results').append(data['dd']);
				       jQuery('#progress').hide();
				   }, "json").fail(function(xhr, textStatus, errorThrown) {
				       alert(xhr.responseText);
				       jQuery('#progress').hide();
				   });
	
    });
    
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
	//jQuery.post('php/run.php', { 'action': 'example-abcd_ml', 'variables': variables }, function(data) {
	//    visualize(data);
	//    jQuery('#timing').html("<br/>timing:" + JSON.stringify(data['timing']));
	//}, "json");
    });
});
