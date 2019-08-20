sets = [];
var project_name = "ABCD";
var participants = []; // empty mean use all participants
var allMeasures = { "src_subject_id": [], "eventname": [] };
var header = [ "src_subject_id", "eventname" ];

// some variables are not measures (like "M"), only try to pull those once and remember them to be bad
var noMeasureList = ["M", "F"];

// pull only the data we need (allMeasures as a dictionary of columns)
function addOneMeasure( meas ) {
    // maybe this measure is already in allMeasures?
    if (Object.keys(allMeasures).indexOf(meas) > -1) {
        return null; // nothing needs to be done, measure exists already
    }
    if (noMeasureList.indexOf(meas) > -1) {
        return null; // nothing can be done, its a no-measure
    }
    
    // ask the system to return this measure and add it to allMeasures (if it does not exist already)
    return jQuery.getJSON('runR.php', { 'value': meas }, function(data) {
        // got the values, now add to allMeasures (merge with existing)
        var k  = Object.keys(allMeasures);
        k.splice(k.indexOf('src_subject_id'),1);
        k.splice(k.indexOf('eventname'),1);
        var ids    = data[0]; // each of these are arrays
        var event  = data[1];
        var v = null;
        if (data.length > 2 && data[2] != null) {
            v = data[2];
        } else {
            noMeasureList.push(meas);
            return; // this is not a real variable, don't use this one
        }
        allMeasures[meas] = []; // empty, fill in the values
        header.push(meas);
        for (var i = 0; i < ids.length; i++) {
            var found = false;
            for (var j = 0; j < allMeasures['src_subject_id'].length; j++) {
                if (allMeasures['src_subject_id'][j] == ids[i]) {
                    if (allMeasures['eventname'][j] == event[i]) {
                        found = true;
                        // add the value here
                        allMeasures[meas][j] = v[i];
                        break;
                    }       
                }
            }
            if (!found) {
                // add a new entry to all keys at the end
                var lastidx = allMeasures['src_subject_id'].length;
                allMeasures['src_subject_id'][lastidx] = ids[i];
                allMeasures['eventname'][lastidx]      = event[i];
                allMeasures[meas][lastidx]             = v[i];
                for (var j = 0; j < k.length; j++) {
                    allMeasures[k[j]] = None;
                }
            }
        }
    });
}

function getAllSets() {
    jQuery.getJSON('../Sets/getSets.php', { "action": "get" }, function(data) {
	sets = data;
        jQuery('#sets').append("<option item=''></option>");
	for (var i = 0; i < data.length; i++) {
	    jQuery('#sets').append('<option item="' + data[i]['id'] + '">' + data[i]['name'] + ' (' + data[i]['variables'].length + ' variables)</option>');
	}
        jQuery('#sets').selectpicker({ 'header': "Select a set" });
    });
}

var sites = [];
// by participants
function setup(data) {
    var data2 = [];
    var parts = [];
    if (typeof participants[0] !== 'undefined' && typeof participants[0]['set'] !== 'undefined') {
        parts = participants[0]['set'].map(function(x) { return x[0]; });
    }
    for (var i = 0; i < data['src_subject_id'].length; i++) {
	var participant = data['src_subject_id'][i];
        if (parts.length > 0 && parts.indexOf(participant) == -1) {
            continue; // ignore this participant
        }
	var site = data['site'][i];
	var ar = [];
	var vs = Object.keys(data);
	var broken = false;
	for (var j = 0; j < vs.length; j++) {
	    if (vs[j] !== "src_subject_id" && vs[j] !== "eventname" && vs[j] !== "site") {
                // this only works with non-categorical variables
		if (isNaN(data[vs[j]][i])) {
		    broken = true;
		}
		ar.push(data[vs[j]][i]);
	    }
	}
	if (!broken) {
	    data2.push(ar);
	    sites.push([site, participant]);
	}
    }
    data = data2;
    return data;
}
// by measures
function setupTransposed(data) {
    var parts = [];
    if (typeof participants[0] !== 'undefined' && typeof participants[0]['set'] !== 'undefined') {
        parts = participants[0]['set'].map(function(x) { return x[0]; });
    }

    var data2 = [];
    var vs = Object.keys(data);
    // we should remove participants that dont have values - and the once that are not in our parts array
    var filterOut = [];
    for (var i = 0; i < data['src_subject_id'].length; i++) {
	var participant = data['src_subject_id'][i];
        if (filterOut.indexOf(participant) > -1) {
            continue; // already gone
        }
        if (parts.length > 0 && parts.indexOf(participant) == -1) {
            filterOut.push(participant);
        }
        for (var j = 0; j < vs.length; j++) {
	    if (vs[j] === "src_subject_id" || vs[j] === "eventname" || vs[j] === "site") {
                continue;
            }
	    if (isNaN(data[vs[j]][i])) {
                filterOut.push(participant);
                break;
            }
        }
    }
    console.log("ignore " + filterOut.length + " participants");
    
    for (var i = 0; i < vs.length; i++) {
	if (vs[i] === "src_subject_id" || vs[i] === "eventname" || vs[i] === "site") {
            continue;
        }
        var ar = [];
        for (var j = 0; j < data['src_subject_id'].length; j++) {
	    var participant = data['src_subject_id'][j];
            if (filterOut.indexOf(participant) > -1)
                continue;
	    // var site = data['site'][j];
	    var broken = false;
	    if (isNaN(data[vs[i]][j])) {
		broken = true;
	    }
	    ar.push(data[vs[i]][j]);
	}
        if (!broken) {
	    data2.push(ar);
	    sites.push([vs[i], ""]);
        }
    }
    data = data2;
    if (data.length == 0) {
        alert("All measures are expected to have values, not NaN or empty. Remove participants with NaN before using this function");
    }
    return data;
}


var firstTime = true;
var tooltip;
var xMap, yMap, xScale, yScale, xValue, yValue;
function render(tsne) {
    var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    
    // for each point Y we have its site in sites, plot them now using d3js
    for (var i = 0; i < Y.length; i++) {
	Y[i].push(sites[i][0]);
	Y[i].push(sites[i][1]);
    }

    var w = jQuery(window).width();
    var h = w * 0.66;
    var margin = {top: 40, right: 40, bottom: 40, left: 40},
	width = w - margin.left - margin.right,
	height = h - margin.top - margin.bottom;

    // setup x
    xValue = function(d) { return d[0];}; // data -> value
    xScale = d3.scale.linear().range([0, width]); // value -> display
    xMap = function(d) { return xScale(xValue(d));}; // data -> display
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").outerTickSize(0);

    // setup y
    yValue = function(d) { return d[1];}; // data -> value
    yScale = d3.scale.linear().range([height, 0]); // value -> display
    yMap = function(d) { return yScale(yValue(d));}; // data -> display
    var yAxis = d3.svg.axis().scale(yScale).orient("left").outerTickSize(0);

    // setup fill color
    var cValue = function(d) { return d[2]; },
	color = d3.scale.category10();

    if (firstTime) {
        firstTime = false;
    
        // add the graph canvas to the body of the webpage
        var svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // add the tooltip area to the webpage
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        
        // load data
        //d3.csv("cereal.csv", function(error, data) {
        data = Y;
        
        // don't want dots overlapping axis, so add in buffer to data domain
        var mi = d3.min(data, xValue);
        var ma = d3.max(data, xValue);
        xScale.domain([d3.min(data, xValue)-(ma-mi)/10.0, d3.max(data, xValue)+(ma-mi)/10.0]);
        var mi = d3.min(data, yValue);
        var ma = d3.max(data, yValue);    
        yScale.domain([d3.min(data, yValue)-(ma-mi)/10.0, d3.max(data, yValue)+(ma-mi)/10.0]);
        
        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            /*.append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("dimension 1")*/;
        
        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            /*.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("dimension 2")*/;
        
        // draw dots
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(cValue(d));})
            .on("mouseover", function(d) {
	        tooltip.transition()
	            .duration(200)
	            .style("opacity", .9);
	        tooltip.html(d[2] + "</br>" + d[3])
	            .style("left", (d3.event.pageX + 5) + "px")
	            .style("top", (d3.event.pageY - 28) + "px");
	    })
            .on("mouseout", function(d) {
	        tooltip.transition()
	            .duration(500)
	            .style("opacity", 0);
	    });
        
        // draw legend
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        
        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);
        
        // draw legend text
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d;})
    } else {
        // after the second time we just adjust the plot
        var svg = d3.select("svg");
        
        var mi = d3.min(data, xValue);
        var ma = d3.max(data, xValue);
        xScale.domain([d3.min(data, xValue)-(ma-mi)/10.0, d3.max(data, xValue)+(ma-mi)/10.0]);
        var mi = d3.min(data, yValue);
        var ma = d3.max(data, yValue);    
        yScale.domain([d3.min(data, yValue)-(ma-mi)/10.0, d3.max(data, yValue)+(ma-mi)/10.0]);

        svg.selectAll(".dot").remove();
        
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(cValue(d));})
            .on("mouseover", function(d) {
	        tooltip.transition()
	            .duration(200)
	            .style("opacity", .9);
	        tooltip.html(d[2] + "</br>" + d[3])
	            .style("left", (d3.event.pageX + 5) + "px")
	            .style("top", (d3.event.pageY - 28) + "px");
	    })
            .on("mouseout", function(d) {
	        tooltip.transition()
	            .duration(500)
	            .style("opacity", 0);
	    });
        
        // Update X Axis
        svg.select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);
        
        // Update Y Axis
        svg.select(".y.axis")
            .transition()
            .duration(100)
            .call(yAxis);
    }
}
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

var stopCurrentRun = false;
var running = false;
var drawing = 0;
var drawstarted = false;
var polygon;
function runSequence( total, tsne ) {
    running = true;
    if (total < 1) {
        jQuery('.loading').hide();
        running = false;
        // start polygon drawing
        var draw = SVG('graph');
        polygon = draw.polygon();
        var options = {};
        draw.on('mouseup', function(event) {
            polygon.draw(event);
            drawstarted = true;
        });
        jQuery(window).on('keyup', function(event) {
            if (event.which == 13 && drawstarted) {
                polygon.draw('done');
                
                function inside(point, vs) {
                    // ray-casting algorithm based on
                    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
                    
                    var x = point[0], y = point[1];
                    
                    var inside = false;
                    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                        var xi = vs[i][0], yi = vs[i][1];
                        var xj = vs[j][0], yj = vs[j][1];
                        
                        var intersect = ((yi > y) != (yj > y))
                            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                        if (intersect) inside = !inside;
                    }
                    
                    return inside;
                };
                
                // now find the list of participant points that are inside the polygon
                var ParticipantList = [];
                var p = jQuery(polygon)[0].attr('points').split(" ").map( function(a) {
                    var b = a.split(",");
                    return [+b[0],+b[1]];
                });
                var svg = d3.select("svg");
                svg.selectAll('.dot').attr('d', function(d) {
                    //console.log("d:" + d[3]);
                    var x = xMap(d);
                    var y = yMap(d);
                    var point = [x, y];
                    var site = d[2];
                    var participant = d[3];
                    //var result = robustPointInPolygon(p, point);
                    var result = inside(point, p);
                    if (result) {
                        if (direction == "By participants")
                            ParticipantList.push(participant);
                        else
                            ParticipantList.push(site);                            
                    }                    
                });
                // now show these participants with their data
                var s = jQuery('#sets').find('option:selected').text();
                if (direction == "By participants") {
                    var vals = Object.keys(allMeasures);
                    var str = vals.join(",") + "\n";
                    for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
                        if (ParticipantList.indexOf(allMeasures['src_subject_id'][i]) !== -1) {
                            var line = "";
                            for (var j = 0; j < vals.length; j++) {
                                if (j > 0)
                                    line = line + ",";
                                line = line + allMeasures[vals[j]][i];
                            }
                            str = str + line + "\n";
                        }
                    }
                    download('tSNE-Selection_' + s + '.csv', str);
                } else {
                    ParticipantList.unshift('abcd_site');
                    ParticipantList.unshift('eventname');
                    ParticipantList.unshift('src_subject_id');
                    var str = ParticipantList.join(", ") + "\n";
                    for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
                        var line = "";
                        for (var j = 0; j < ParticipantList.length; j++) {
                            if (j > 0)
                                line = line + ",";
                            line = line + allMeasures[ParticipantList[j]][i];
                        }
                        str = str + line + "\n";
                    }                    
                    download('tSNE-Selection_' + s + '.csv', str);
                }
                polygon.draw('cancel');
                jQuery('#graph polygon').remove();
                polygon = draw.polygon();
                drawstarted = false;
            }
        });
        
        return; // nothing to be done anymore
    }
    jQuery('#step-information').text('Step: '+total);
    if (stopCurrentRun) {
        stopCurrentRun = false;
        jQuery('#step-information').text("This computation will take a long time...");        
        jQuery('.loading').hide();
        return;
    }
    setTimeout(function() {
        tsne.step();
        render(tsne);
        runSequence(total-1, tsne);
    },100);
}

function createGraph(data) {
    // get the data from the page
    jQuery('svg').children().remove();
    firstTime = true;
    if (direction == "By participants") {
        data = setup(data);
    } else
        data = setupTransposed(data);

    if (data.length == 0) {
        alert("Error: no complete dataset could be found, maybe one variable does not have any values? Also, make sure all columns are numerical!");
        jQuery('.loading').hide();
        return;
    }
        
    var opt = {}
    opt.epsilon = 10;     // epsilon is learning rate (10 = default)
    opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2;          // dimensionality of the embedding (2 = default)

    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataRaw(data);

    runSequence(iterations, tsne);
}

var filters;
function getSubsets( selectThis ) {
    jQuery.getJSON('/applications/Filter/getFilter.php', function(data) {
        filters = data;
        jQuery('#participantsets').children().remove();
        
        // add the null filter first
        jQuery("#participantsets").append('<option>Predefined filters</option>');
        for (var i = 0; i < filters.length; i++) {
            var optGrp = document.createElement('optgroup');
            jQuery(optGrp).attr('label', filters[i]["name"]);
            jQuery('#participantsets').append(optGrp);
            for (var j = 0; j < filters[i]["rules"].length; j++) {
                jQuery(optGrp).append('<option>' + filters[i]["rules"][j]["name"] + '</option>');
            }
        }
        jQuery('#participantsets').selectpicker({
            style: ''
        });
        jQuery('#participantsets').next().css('margin-top', '8px');
        jQuery('#participantsets').selectpicker('refresh');
        if (selectThis !== undefined) {
            jQuery('#participantsets').val(selectThis);
            jQuery('#participantsets').selectpicker('render');
        }
        jQuery('#participantsets').change(function() {
            for (var i = 0; i < filters.length; i++) {
                for (var j = 0; j < filters[i]["rules"].length; j++) {
                    // The stored name of the filter can contain html characters ("<").
                    // Get the html version of the name for the comparisons.
                    var t = jQuery("<div>").append(jQuery(this).val()).html();
                    if (t == filters[i]["rules"][j]["name"]) {
                        var f = filters[i]["rules"][j]['func'];
                        var uniqueIDY = hex_md5(project_name + f.replace(/\s/g,'') + "YES").slice(-4);
                        // get the list of participant names
                        var fn = "/applications/Filter/data/filterSets_"+project_name+"_"+uniqueIDY + ".json";
                        jQuery.getJSON(fn, function(data) {
                            participants = data;
                        }).fail(function() {
                            alert("could not find this set of participants");
                        });
                    }
                }
            }
        });
    }).fail(function(e) {
	console.log("Error on getting filter from Filter page" + e);
    });
}

var perplexity = 30;
var iterations = 500;
var colorby = "abcd_site";
var direction = "By participants";
jQuery(document).ready(function() {
    jQuery('.project_name').text(project_name);
    jQuery('.perplexity').text(perplexity);
    jQuery('.iterations').text(iterations);
    jQuery('.colorby').text(colorby);
    jQuery('.direction').text(direction);

    getSubsets("All subjects");
    
    jQuery('a.perplex').on('click', function() {
        perplexity = jQuery(this).attr('value');
        jQuery('.perplexity').text(perplexity);
    });
    jQuery('a.colby').on('click', function() {
        colorby = jQuery(this).attr('value');
        if (colorby == "blots1") {
            addBlots(0); // works only once
            return;
        }
        if (colorby == "blots2") {
            addBlots(1); // works only once
            return;
        }
        jQuery('.colorby').text(colorby);
        setTimeout(function() { addOneMeasure(colorby); }, 0);
    });
    jQuery('a.iters').on('click', function() {
        olditerations = iterations;
        iterations = jQuery(this).attr('value');
        if (iterations == "stop") {
            stopCurrentRun = true;
            // set the iterations back to the default
            jQuery('.iterations').text(olditerations);
            iterations = olditerations;
        } else {
            jQuery('.iterations').text(iterations);
        }
    });
    jQuery('a.direc').on('click', function() {
        direction = jQuery(this).attr('value');
        jQuery('.direction').text(direction);        
    });

    
    getAllSets();
    setTimeout(function() { addOneMeasure(colorby); }, 0);

    jQuery('#sets').on('change', function() {
	jQuery('.loading').show();
	var s = jQuery(this).find('option:selected').attr('item');
        jQuery('#step-information').text("This computation will take a long time...");

        if (s == "") {
            if (running) {
                stopCurrentRun = true;
            }
            jQuery('.loading').hide();
            return;
        }
        
	var vars = [];
	var promises = [];
	for(se_idx in sets) {
	    var se = sets[se_idx];
	    if (se['id'] == s) {
		for(var i = 0; i < se['variables'].length; i++) {
		    var p = addOneMeasure(se['variables'][i]);
		    if (p !== null)
			promises.push(p);
		}
		break;
	    }
	}
	jQuery.when.apply(jQuery, promises).then(function() {
	    // ok, all variable values are now in allMeasures
	    var s = jQuery('#sets').find('option:selected').attr('item');
	    var data = { "src_subject_id": allMeasures["src_subject_id"], "eventname": allMeasures['eventname'], "site": allMeasures[colorby] };
	    for (se_idx in sets) {
		var se = sets[se_idx];
		if (se['id'] == s) {
		    for (var i = 0; i < se['variables'].length; i++)
			data[se['variables'][i]] = allMeasures[se['variables'][i]];
		}
	    }
	    // start the rendering
            jQuery('svg').children().remove();
	    createGraph(data);
	});	
    });
    
});

Math.nrand = function() {
    var x1, x2, rad, y1;
    do {
        x1 = 2 * this.random() - 1;
        x2 = 2 * this.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while(rad >= 1 || rad == 0);
    var c = this.sqrt(-2 * Math.log(rad) / rad);
    return x1 * c;
};

function addBlots(mode) {
    // replace all circles with blots
    jQuery('svg .axis').attr('display', 'none');
    jQuery.get('img/blot01.svg?_=9999', function(data) {
        var ds = jQuery(data).find('#g4362').children().children();
        jQuery('svg circle.dot').each(function(i,v) {
            //var idx = Math.floor(Math.random() * Math.floor(ds.length));
            var d = ds[4];
            jQuery(d).attr('display','');
            var scale = 1;
            if (mode == 1) {
                var r1 = Math.nrand();
                var r2 = Math.nrand();
                var r3 = Math.nrand();
                var r4 = Math.nrand();
                // chi_squared is sum of sqared normals
                var chi_squared = r1*r1 + r2*r2 + r3*r3 + r4*r4;
                scale = 0.1*chi_squared;
            } else {
                scale = 0.1 * (Math.random()/0.5+1);
            }
            if (scale < 0.05)
                scale = 0.05;
            var deg = Math.floor(Math.random() * 360.0);
            var posx = jQuery(v).attr('cx');
            var posy = jQuery(v).attr('cy');
            var color = jQuery(v).css('fill');
            var d2 = jQuery(d).clone();
            jQuery(d2).attr('transform', 'translate('+Math.floor(posx)+','+Math.floor(posy)+') scale('+scale+','+scale+') rotate('+deg+') translate(-56,-42)');
            jQuery(d2).find('path').css('fill', color);
            jQuery(d2).find('path').css('fill-opacity', 0.5);
            jQuery(d2).find('path').css('stroke', 'none');
            jQuery(v).replaceWith(jQuery(d2));
        });
    });
}
