/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/


// Get JSON data
//treeJSON = d3.json("flare.json", function(error, treeData) {
//treeJSON = d3.json("/applications/Ontology/hierarchy.php?_v=&entry=root", function(treeData) {

function drawMedicationTree( treeData ) {
    // Calculate total nodes, max label length
    var totalNodes = 400;
    var maxLabelLength = 1;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;

    // size of the diagram
    var viewerWidth = jQuery('#left').width(); //$(document).width();
    var viewerHeight = jQuery('#left').height(); // $(document).height();
    var vh = jQuery(window).height()-55;
    //if ( vh > viewerHeight) {
	viewerHeight = vh;
    //}
    
    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
	    return [d.y, d.x];
	});

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
	if (!parent) return;

	visitFn(parent);

	var children = childrenFn(parent);
	if (children) {
	    var count = children.length;
	    for (var i = 0; i < count; i++) {
		visit(children[i], visitFn, childrenFn);
	    }
	}
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
	totalNodes++;
	maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function(d) {
	return d.children && d.children.length > 0 ? d.children : null;
    });


    // sort the tree according to the node names

    function sortTree() {
	tree.sort(function(a, b) {
            // prefer medication from non-medications
            if (a['name'] == "Anatomical Therapeutic Chemical (ATC1-4)" &&
                b['name'] == "Not a drug")
                return -1;
            if (b['name'] == "Anatomical Therapeutic Chemical (ATC1-4)" &&
                a['name'] == "Not a drug")
                return 1;
            
	    return (b.ABCDNum2 > a.ABCDNum2)?1: -1;
	    //return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
	});
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
	var speed = panSpeed;
	if (panTimer) {
	    clearTimeout(panTimer);
	    translateCoords = d3.transform(svgGroup.attr("transform"));
	    if (direction == 'left' || direction == 'right') {
		translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
		translateY = translateCoords.translate[1];
	    } else if (direction == 'up' || direction == 'down') {
		translateX = translateCoords.translate[0];
		translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
	    }
	    scaleX = translateCoords.scale[0];
	    scaleY = translateCoords.scale[1];
	    scale = zoomListener.scale();
	    svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
	    d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
	    zoomListener.scale(zoomListener.scale());
	    zoomListener.translate([translateX, translateY]);
	    panTimer = setTimeout(function() {
		pan(domNode, speed, direction);
	    }, 50);
	}
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
	svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.05, 3]).on("zoom", zoom);

    function initiateDrag(d, domNode) {
	draggingNode = d;
	d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
	d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
	d3.select(domNode).attr('class', 'node activeDrag');

	svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
	    if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
	    else return -1; // a is the hovered element, bring "a" to the front
	});
	// if nodes has children, remove the links and nodes
	if (nodes.length > 1) {
	    // remove link paths
	    links = tree.links(nodes);
	    nodePaths = svgGroup.selectAll("path.link")
	        .data(links, function(d) {
		    return d.target.id;
		}).remove();
	    // remove child nodes
	    nodesExit = svgGroup.selectAll("g.node")
	        .data(nodes, function(d) {
		    return d.id;
		}).filter(function(d, i) {
		    if (d.id == draggingNode.id) {
			return false;
		    }
		    return true;
		}).remove();
	}

	// remove parent link
	parentLink = tree.links(tree.nodes(draggingNode.parent));
	svgGroup.selectAll('path.link').filter(function(d, i) {
	    if (d.target.id == draggingNode.id) {
		return true;
	    }
	    return false;
	}).remove();

	dragStarted = null;
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    var defs = baseSvg.append('defs');
    var filter = defs.append('filter')
	.attr('id', 'solid')
	.attr('height', 1)
	.attr('width', 1)
	.attr('x', 0)
	.attr('y', 0);
    filter.append('feFlood')
	.attr('flood-color', 'white')
	.attr('flood-opacity', 0.8);
    filter.append('feComposite')
	.attr('in', 'SourceGraphic');

    //<defs><filter x="0" y="0" width="1" height="1" id="solid"><feFlood flood-color="white"/><feComposite in="SourceGraphic"/></filter></defs>');

    // Define the drag listeners for drag/drop behaviour of nodes.
    dragListener = d3.behavior.drag()
        .on("dragstart", function(d) {
	    return;
	    if (d == root) {
		return;
	    }
	    dragStarted = true;
	    nodes = tree.nodes(d);
	    d3.event.sourceEvent.stopPropagation();
	    // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
	})
        .on("drag", function(d) {
	    return;
	    if (d == root) {
		return;
	    }
	    if (typeof dragStarted !== 'undefined' && dragStarted) {
		domNode = this;
		initiateDrag(d, domNode);
	    }

	    // get coords of mouseEvent relative to svg container to allow for panning
	    relCoords = d3.mouse($('svg').get(0));
	    if (relCoords[0] < panBoundary) {
		panTimer = true;
		pan(this, 'left');
	    } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

		panTimer = true;
		pan(this, 'right');
	    } else if (relCoords[1] < panBoundary) {
		panTimer = true;
		pan(this, 'up');
	    } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
		panTimer = true;
		pan(this, 'down');
	    } else {
		try {
		    clearTimeout(panTimer);
		} catch (e) {

		}
	    }

	    d.x0 += d3.event.dy;
	    d.y0 += d3.event.dx;
	    var node = d3.select(this);
	    node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
	    updateTempConnector();
	}).on("dragend", function(d) {
	    return;
	    if (d == root) {
		return;
	    }
	    domNode = this;
	    if (selectedNode) {
		// now remove the element from the parent, and insert it into the new elements children
		var index = draggingNode.parent.children.indexOf(draggingNode);
		if (index > -1) {
		    draggingNode.parent.children.splice(index, 1);
		}
		if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
		    if (typeof selectedNode.children !== 'undefined') {
			selectedNode.children.push(draggingNode);
		    } else {
			selectedNode._children.push(draggingNode);
		    }
		} else {
		    selectedNode.children = [];
		    selectedNode.children.push(draggingNode);
		}
		// Make sure that the node being added to is expanded so user can see added node is correctly moved
		expand(selectedNode);
		sortTree();
		endDrag();
	    } else {
		endDrag();
	    }
	});

    function endDrag() {
	selectedNode = null;
	d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
	d3.select(domNode).attr('class', 'node');
	// now restore the mouseover event or we won't be able to drag a 2nd time
	d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
	updateTempConnector();
	if (draggingNode !== null) {
	    update(root);
	    centerNode(draggingNode);
	    draggingNode = null;
	}
    }

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
	if (d.children) {
	    d._children = d.children;
	    d._children.forEach(collapse);
	    d.children = null;
	}
    }

    function expand(d) {
	if (d._children) {
	    d.children = d._children;
	    d.children.forEach(expand);
	    d._children = null;
	}
    }

    var overCircle = function(d) {
	selectedNode = d;
	updateTempConnector();
    };
    var outCircle = function(d) {
	selectedNode = null;
	updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
	var data = [];
	if (draggingNode !== null && selectedNode !== null) {
	    // have to flip the source coordinates since we did this for the existing connectors on the original tree
	    data = [{
		source: {
		    x: selectedNode.y0,
		    y: selectedNode.x0
		},
		target: {
		    x: draggingNode.y0,
		    y: draggingNode.x0
		}
	    }];
	}
	var link = svgGroup.selectAll(".templink").data(data);

	link.enter().append("path")
	    .attr("class", "templink")
	    .attr("d", d3.svg.diagonal())
	    .attr('pointer-events', 'none');

	link.attr("d", d3.svg.diagonal());

	link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    var lastCenterNode;
    function centerNode(source) {
        var oldNode = d3.selectAll('text').filter(function(d) {
            return d == lastCenterNode;
        });
        if (oldNode[0].length !== 0) {
            var v = jQuery(oldNode[0]).attr('oldClass');
            oldNode[0][0].className.baseVal = v;
        }
        //d3.select(lastCenterNode).select("text").classed("active", false);        
        lastCenterNode = source;
        updatePillNavigation();
        // update the select box as well
        
        //d3.select(source).select("text").classed("active", true);
        var newNode = d3.selectAll('text').filter(function(d) {
            return d == lastCenterNode;
        });
        if (newNode[0].length > 0) {
            jQuery(newNode[0]).attr('oldClass', newNode[0][0].className.baseVal);
            newNode[0][0].className.baseVal = "nodeTextActive";
        }
        
	scale = zoomListener.scale();
	x = -source.y0;
	y = -source.x0;
	x = x * scale + viewerWidth / 2;
	y = y * scale + viewerHeight / 2;
	d3.select('g').transition()
	    .duration(duration)
	    .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
	zoomListener.scale(scale);
	zoomListener.translate([x, y]);
        
        var focus = svgGroup.select('#focusLineX');
        focus.attr('x1', 0).attr('y1', -1000);
        focus.attr('x2', 0).attr('y2', 200000);
        focus.transition().duration(duration*1.5)
            .attr("transform", function(d) {
                return "translate(" + source.y0 + ",0)";
            });
        var focus = svgGroup.select('#focusLineY');
        focus.attr('x2', 10000).attr('x1', -1000);
        focus.attr('y2', 0).attr('y1', 0);
        focus.transition().duration(duration*1.5)
            .attr("transform", function(d) {
                return "translate(0," + source.x0 + ")";
            });
//        focus.attr('x1', source.y0).attr('y1', -1000);
//        focus.attr('x2', source.y0).attr('y2', 100000);
//        var focus = svgGroup.select('#focusLineY');
//        focus.attr('x2', 10000).attr('x1', -1000);
//        focus.attr('y2', source.x0).attr('y1', source.x0);
    }

    function formatNumber(a) {
        var ts = ',';
        var ds = " ";
        var arr = a.toFixed(0).split('.');
        arr[0] = arr[0].replace( /\B(?=(\d{3})+(?!\d))/g, ts == null ? ',' : ts + '' );

        return arr.join( ds == null ? '.' : ds + '' );
    }

    function getPGUIDs( n ) {
        // return all pGUIDs in a dictionary that have taken a drug at this level
        if (typeof n['children'] == 'undefined' || n['children'].length == 0) {
            var r = {};
            if (typeof pGUIDsPerMed[n['name']] !== 'undefined') {
                return pGUIDsPerMed[n['name']].reduce(function(map, obj) {
                    var m = obj[0];
                    var event = obj[1];
                    var num = obj[2];
                    map[m] = 1;
                    return map;
                }, r);
            }
            return r;
        }
        var result = {};
        for (var i = 0; i < n['children'].length; i++) {
            var res = getPGUIDs(n['children'][i]);
            // merge with result
            var ks = Object.keys(res);
            for (var j = 0; j < ks.length; j++) {
                if (typeof result[ks[j]] !== 'undefined') {
                    result[ks[j]]++;
                } else {
                    result[ks[j]] = 1; // count how many
                }
            }
        }
        return result;
    }
    
    function updatePillNavigation() {
        // use the lastCenterNode as navigation anchor
        jQuery('div.pill-navigation').children().remove();
        jQuery('div.size-estimator').children().remove();
        // jQuery('div.pill-navigation').append('<div class="pill-nav">/ ' + lastCenterNode['name'] + ' /</div>');
        jQuery('div.pill-navigation').append('<div class="pill-nav">&nbsp;</div>');
        var n = lastCenterNode['name'];
        if (typeof lastCenterNode['mark'] !== 'undefined') {
            // remove the number at the beginning
            n = lastCenterNode['name'].split(" ").splice(1).join(" ");
        }
        if (jQuery('#select-search-select').find("option[value=\"" + n + "\"]").length) {
            jQuery('#select-search-select').val(n).trigger('change');
        }
        
        var type = jQuery('#select-medication-group a.active').attr('value');
        if (typeof lastCenterNode['ABCDNum'] !== 'undefined') {
            // what is the percentage of the ATC1-4?
            var pGUIDs = getPGUIDs( lastCenterNode );
            var allKids = [...new Set(allMeasures['src_subject_id'])].length;
            var numPGUIDS = Object.keys(pGUIDs).length;
            var ACTNUMTotal = root['children'][0]['ABCDNum'];
            var perc = lastCenterNode['ABCDNum']/ACTNUMTotal * 100.0;
            // what is the current level?
            function calcLevel( lastCenterNode, result ) {
                if (lastCenterNode['name'] == result['name']) {
                    return 1;
                }
                if (typeof result['children'] !== 'undefined' && result['children'].length > 0) {
                    for (var i = 0; i < result['children'].length; i++) {
                        var l = calcLevel( lastCenterNode, result['children'][i] );
                        if (l > 0) {
                            return l + 1;
                        }
                    }
                }
                return 0;
            }
            var level = calcLevel( lastCenterNode, result ) - 2;

            var who = "";
            if (type == "Child") {
                who = "children";
                if (Object.keys(pGUIDs).length == 1)
                    who = "child";
            } else {
                who = "parents";
                if (Object.keys(pGUIDs).length == 1)
                    who = "parent";                
            }
            var hasAlternates = typeof lastCenterNode['alternates'] !== 'undefined' && lastCenterNode['alternates'].length > 1;
            var alt = "alternative uses";
            if (hasAlternates) {
                alt = "<div class='dropdown select-alternates' id='select-alternates'>";
                alt = alt + "  <a class='dropdown-toggle' href='#' type='text' role='text' data-toggle='dropdown'>alternative uses</a><div class='dropdown-menu'>";
                // what is the active one?
                var act = 0;
                if (typeof lastCenterNode['activeAlternative'] !== 'undefined') {
                    act == lastCenterNode['activeAlternative']; // if we have selected another use
                }
                for (var j = 0; j < lastCenterNode['alternates'].length; j++) {
                    alt = alt + "<a class='dropdown-item " + (act==j?"active":"") +"' href='#' value='" +
                        lastCenterNode['alternates'][j] + "'>" +
                        listOfAllclassIds[lastCenterNode['alternates'][j]]['className'] +
                        "</a>";
                }
                alt = alt + "</div></div>";
            }
            // do a size estimation, come up with an integer number
            var size_estimation = Math.floor(Object.keys(pGUIDs).length / 10);
            if (size_estimation < 1)
                size_estimation = 1;
            if (size_estimation > 12)
                size_estimation = 12;
            for (var i = 0; i < size_estimation; i++) {
                jQuery('div.size-estimator').append("<div class='size-box level" + level + "'></div>");
            }
            
            jQuery('div.pill-navigation').append('<div class="pill-nav-2">' + formatNumber(Object.keys(pGUIDs).length) + " " +
                                                 who + " (" + (numPGUIDS/allKids * 100.0).toFixed(2) + "&#37;) " +
                                                 ' reported use in this ' + (typeof lastCenterNode['rxcui'] !== 'undefined' ? '<a href="http://purl.bioontology.org/ontology/RXNORM/' + lastCenterNode['rxcui'] +  '">category</a>' : 'category') +
                                                 (hasAlternates?". There are " + alt + " for this drug":"") + 
                                                 //formatNumber(lastCenterNode['ABCDNum']) + ' drug usages in this category for ' +
                                                 //formatNumber(Object.keys(pGUIDs).length) + " " + who +
                                                 //(' (' + ((perc < 50)?perc.toFixed(2):perc.toFixed(0)) + '&#37; of total drug use in ' +
                                                 // (numPGUIDS/allKids * 100.0).toFixed(2) +
                                                 // '&#37; of all ' + who + ')') +
                                                 '.</div>');
        } else {
            jQuery('div.pill-navigation').append('<div class="pill-nav-2">Navigate using cursor keys (press right arrow key).</div>');            
        }
    }
    
    // Toggle children function
    var lastOpen = null;
    d3.select("body").on("keydown", function(e) {
        // navigate user cursor keys
        if (d3.event.keyCode == 40) { // down arrow
            // highlight the button that could be pressed for this as well
            var p = jQuery('.control-down').stop().animate( { "border-style": "solid", "border-width": 2, "border-color": "#4285f4" }, { "duration": "20" }).promise();
            p.then(function() {
                jQuery('.control-down').stop().animate({ "border-style": "solid", "border-width": 1, "border-color": "gray" }, { "duration": "20" }).promise();
            });
            
            // given lastCenterNode... where do we go from here?
            var parent = lastCenterNode.parent;
            for (var i = 0; i < parent.children.length-1; i++) {
                if (parent.children[i] == lastCenterNode) {
                    centerNode(parent.children[i+1]);
                    return;
                }
            }
            // if we are still here find the same depth location in another branch
            var d = 0;
            function findSiblingDown( n ) {
                var idx = 0;
                if (typeof n.parent == 'undefined' || typeof n.parent.children == 'undefined')
                    return false;
                
                for (var i = 0; i < n.parent.children.length; i++) {
                    if (n.parent.children[i].name == n['name'])
                        idx = i;
                }
                if (idx < n.parent.children.length-1) {
                    return n.parent.children[idx + 1];
                }
                return false;
            }

            parent = lastCenterNode;
            while (findSiblingDown(parent) === false && parent != root) {
                d++;
                parent = parent.parent;
            }
            parent = findSiblingDown(parent);
            if (parent === false)
                return; // do nothing
            for (var i = 0; i < d; i++) { // pick the first on the same level
                if (typeof parent.children !== 'undefined')
                    parent = parent.children[0];
            }
            centerNode(parent);
        } else if (d3.event.keyCode == 38) { // arrow up
            // highlight the button that could be pressed for this as well
            var p = jQuery('.control-up').stop().animate( { "border-style": "solid", "border-width": 2, "border-color": "#4285f4" }, { "duration": "20" }).promise();
            p.then(function() {
                jQuery('.control-up').stop().animate({ "border-style": "solid", "border-width": 1, "border-color": "gray" }, { "duration": "20" }).promise();
            });
            var parent = lastCenterNode.parent;
            for (var i = 1; i < parent.children.length; i++) {
                if (parent.children[i] == lastCenterNode) {
                    centerNode(parent.children[i-1]);
                    return;
                }
            }
            // if we are still here find the same depth location in another branch
            var d = 0;
            function findSiblingUp( n ) {
                var idx = 0;
                if (typeof n.parent == 'undefined' || typeof n.parent.children == 'undefined')
                    return false;
                
                for (var i = 0; i < n.parent.children.length; i++) {
                    if (n.parent.children[i].name == n['name'])
                        idx = i;
                }
                if (idx - 1 > -1) {
                    return n.parent.children[idx - 1];
                }
                return false;
            }

            parent = lastCenterNode;
            while (findSiblingUp(parent) === false && parent != root) {
                d++;
                parent = parent.parent;
            }
            parent = findSiblingUp(parent);
            if (parent === false)
                return; // do nothing
            for (var i = 0; i < d; i++) { // pick the first on the same level
                if (typeof parent.children !== 'undefined')
                    parent = parent.children[parent.children.length-1];
            }
            centerNode(parent);
            
        } else if (d3.event.keyCode == 37) { // arrow left
            // highlight the button that could be pressed for this as well
            var p = jQuery('.control-left').stop().animate( { "border-style": "solid", "border-width": 2, "border-color": "#4285f4" }, { "duration": "20" }).promise();
            p.then(function() {
                jQuery('.control-left').stop().animate({ "border-style": "solid", "border-width": 1, "border-color": "gray" }, { "duration": "20" }).promise();
            });
            var before = lastCenterNode;
            var parent = lastCenterNode.parent;
            if (typeof parent !== 'undefined') {
                parent['downChoice'] = parent['children'].indexOf(before);
                centerNode(parent);
            }
            return;
        } else if (d3.event.keyCode == 39) { // arrow right
            // highlight the button that could be pressed for this as well
            var p = jQuery('.control-right').stop().animate( { "border-style": "solid", "border-width": 2, "border-color": "#4285f4" }, { "duration": "20" }).promise();
            p.then(function() {
                jQuery('.control-right').stop().animate({ "border-style": "solid", "border-width": 1, "border-color": "gray" }, { "duration": "20" }).promise();
            });
            if (typeof lastCenterNode['children'] !== 'undefined' && lastCenterNode['children'].length > 0) {
                var num = 0;
                if (typeof lastCenterNode['downChoice'] !== "undefined")
                    num = lastCenterNode['downChoice'];
                centerNode(lastCenterNode['children'][num]);
            }
        }
        
	// there is a last undo step
	if (lastOpen === null || d3.event.target === jQuery('#search') || d3.event.keyCode !== 85) {
	    return;
	}
	toggleChildren(lastOpen);
	update(lastOpen);
	centerNode(lastOpen);
    });
    
    
    function toggleChildren(d) {
	//console.log("Toggle children: " + JSON.stringify(d.name));
	if (d.children) {
	    d._children = d.children;
	    d.children = null;
	} else {
	    console.log('remember this lastOpen');
	    lastOpen = d;
	    if (typeof d._children === "undefined") {
		/* d3.json("/applications/Ontology/hierarchy.php?_v=&entry="+d.key, function(json) {
		    if (json === null || typeof json['children'] === 'undefined') {
			return;
		    }
		    d.children = json.children;
		    d._children = null;
		    function toggleAll(d) {
			if (d.children) {
			    d.children.forEach(toggleAll);
			    toggle(d);
			}
		    }
		    update(root);
		}); */
	    }
	    if (d._children) {
		d.children = d._children;
		d._children = null;
	    }
	}
	return d;
    }

    // Toggle children on click.

    function click(d) {
	if (d3.event.defaultPrevented) return; // click suppressed
	d = toggleChildren(d);
	update(d);
	centerNode(d);
	var e = jQuery.Event('keyup');
	e.which = 13;
	var na = d.name;
	if (na == "root")
	    na = "ABCD";
	//jQuery('#search').val(na);
	//jQuery('#search').trigger(e);
    }

    function update(source) {
	// Compute the new height, function counts total children of root node and sets tree height accordingly.
	// This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
	// This makes the layout more consistent.
	var levelWidth = [1];
	var childCount = function(level, n) {

	    if (n.children && n.children.length > 0) {
		if (levelWidth.length <= level + 1) levelWidth.push(0);

		levelWidth[level + 1] += n.children.length;
		n.children.forEach(function(d) {
		    childCount(level + 1, d);
		});
	    }
	};
	childCount(0, root);
	var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
	tree = tree.size([newHeight, viewerWidth]);

        // add a focus line for navigation to group that zoom listener is working on.
        var focus = svgGroup.append('g');
        focus.append('line')
            .attr('id', 'focusLineX')
            .attr('class', 'focusLineX');
        
        focus.append('line')
            .attr('id', 'focusLineY')
            .attr('class', 'focusLineY');
        
       
	// Compute the new tree layout.
	var nodes = tree.nodes(root).reverse(),
	    links = tree.links(nodes);

	// Set widths between levels based on maxLabelLength.
	nodes.forEach(function(d) {
	    d.y = (d.depth * (maxLabelLength * 3)); //maxLabelLength * 10px
	    // alternatively to keep a fixed scale one can set a fixed depth per level
	    // Normalize for fixed-depth by commenting out below line
	    // d.y = (d.depth * 500); //500px per level.
	});

	// Update the nodes…
	node = svgGroup.selectAll("g.node")
	    .data(nodes, function(d) {
		return d.id || (d.id = ++i);
	    });

	// Enter any new nodes at the parent's previous position.
	var nodeEnter = node.enter().append("g")
	    .call(dragListener)
	    .attr("class", "node")
	    .attr("transform", function(d) {
		return "translate(" + source.y0 + "," + source.x0 + ")";
	    })
	    .on('click', click);

	nodeEnter.append("circle")
	    .attr('class', 'nodeCircle')
	    .attr("r", 0)
	    .style("fill", function(d) {
		return d._children ? "lightsteelblue" : "#fff";
	    });

	nodeEnter.append("text")
	    .attr("x", function(d) {
                var x = d.children || d._children ? -10 : 10;
		return x;
	    })
	    .attr("dy", ".35em")
//	    .attr('filter', 'url(#solid))')
	    .attr('class', function(d) {
                //console.log(JSON.stringify(d));
                if (typeof d.mark !== 'undefined') {
                    if (typeof d.alternates !== 'undefined' && d.alternates.length > 1)
                        return 'nodeTextDrugAlternates';
                    return 'nodeTextDrug';
                }
                return 'nodeText'; })
	    .attr("text-anchor", function(d) {
		return d.children || d._children ? "end" : "start";
	    })
	    .text(function(d) {
		if (d.name == "root") {
		    return "ABCD";
		}
		return d.name + " #" + d.ABCDNum2;
	    })
	    //.style('filter', 'url(#solid)');
	    //.style("fill-opacity", 0);

	// phantom node to give us mouseover in a radius around it
/*	nodeEnter.append("circle")
	    .attr('class', 'ghostCircle')
	    .attr("r", 30)
	    .attr("opacity", 0) // change this to zero to hide the target area
	    .style("fill", "red")
	    .attr('pointer-events', 'mouseover')
	    .on("mouseover", function(node) {
		overCircle(node);
	    })
	    .on("mouseout", function(node) {
		outCircle(node);
	    }); */

	// Update the text to reflect whether node has children or not.
	node.select('text')
	    .attr("x", function(d) {
		return d.children || d._children ? -10 : 10;
	    })
            .attr("y", function(d) {
                return d.children || d._children ? -15 : 0;
            })
	    .attr("text-anchor", function(d) {
		return d.children || d._children ? "end" : "start";
	    })
	    .text(function(d) {
		if (d.name == "root")
		    return "ABCD";
		if (typeof d.ABCDNum2 == 'undefined')
		    return d.name;
		
		return (typeof d.classId !== 'undefined'?d.classId + " - ":"") + d.name + " #" + d.ABCDNum2;
	    });

	// Change the circle fill depending on whether it has children and is collapsed
	node.select("circle.nodeCircle")
	    .attr("r", 4.5)
	    .style("fill", function(d) {
		return d._children ? "lightsteelblue" : "#fff";
	    });

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
	    .duration(duration)
	    .attr("transform", function(d) {
		return "translate(" + d.y + "," + d.x + ")";
	    });

	// Fade the text in
	nodeUpdate.select("text")
	    .style("fill-opacity", 1);

	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit().transition()
	    .duration(duration)
	    .attr("transform", function(d) {
		return "translate(" + source.y + "," + source.x + ")";
	    })
	    .remove();

	nodeExit.select("circle")
	    .attr("r", 0);

	nodeExit.select("text")
	    .style("fill-opacity", 0);

	// Update the links…
	var link = svgGroup.selectAll("path.link")
	    .data(links, function(d) {
		return d.target.id;
	    });

	// Enter any new links at the parent's previous position.
	link.enter().insert("path", "g")
	    .attr("class", "link")
	    .attr("d", function(d) {
		var o = {
		    x: source.x0,
		    y: source.y0
		};
		return diagonal({
		    source: o,
		    target: o
		});
	    });

	// Transition links to their new position.
	link.transition()
	    .duration(duration)
	    .attr("d", diagonal);

	// Transition exiting nodes to the parent's new position.
	link.exit().transition()
	    .duration(duration)
	    .attr("d", function(d) {
		var o = {
		    x: source.x,
		    y: source.y
		};
		return diagonal({
		    source: o,
		    target: o
		});
	    })
	    .remove();

	// Stash the old positions for transition.
	nodes.forEach(function(d) {
	    d.x0 = d.x;
	    d.y0 = d.y;
	});

    }

    function redraw() {
	var viewerWidth = jQuery('#left').width(); //$(document).width();
	var viewerHeight = jQuery('#left').height(); // $(document).height();
	var vh = jQuery(window).height()-65;
	//if ( vh > viewerHeight) {
	    viewerHeight = vh;
	//}
	tree.size([viewerHeight, viewerWidth]);
	baseSvg.attr('width', viewerWidth);
	baseSvg.attr('height', viewerHeight);
    }
    
    window.addEventListener("resize", redraw);
    
    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    redraw();
    update(root);
    centerNode(root);

    jQuery('#select-search-select').on('select2:select', function(e) {
        // lookup that element in the tree and navigtate to it
        var v = e.params.data;
        function findNode(root, v) {
            if (root['name'] == v) {
                return root;
            }
            if (typeof root['mark'] !== 'undefined') {
                // partial match is ok
                var n = root['name'].split(" ").splice(1).join(" ");
                if (v == n)
                    return root;
            }
            if (typeof root['children'] !== 'undefined' && root['children'].length > 0) {
                for (var i = 0; i < root['children'].length; i++) {
                    var w = findNode(root['children'][i], v);
                    if (typeof w !== 'undefined') {
                        return w;
                    }
                }
            } else {
                return undefined;
            }
        }
        var w = findNode(root, v.text);
        if (typeof w !== 'undefined')
            centerNode(w);
    });    
    
}
