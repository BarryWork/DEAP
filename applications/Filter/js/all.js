var filters = null;
 var allMeasures = { "src_subject_id": [], "eventname": [] };
 var idxSubjID = 0;
 var idxVisitID = 1;
 var idxStudyDate = -1;
 var header = [ "src_subject_id", "eventname" ];

 function getAllFilters( selectThis ) {
   jQuery.getJSON('getFilter.php', function(data) {
       filters = data;
       jQuery('select.existingFilters').children().remove();
       
       // add the null filter first
       jQuery("select.existingFilters").append('<option>Predefined filters</option>');
       for (var i = 0; i < filters.length; i++) {
           var optGrp = document.createElement('optgroup');
           jQuery(optGrp).attr('label', filters[i]["name"]);
           jQuery('select.existingFilters').append(optGrp);
           for (var j = 0; j < filters[i]["rules"].length; j++) {
               jQuery(optGrp).append('<option>' + filters[i]["rules"][j]["name"] + '</option>');
           }
       }
       /*jQuery('.selectpickerS').selectpicker({
           style: ''
       });
       jQuery('.selectpickerS').selectpicker('refresh'); */
       if (selectThis !== undefined) {
           jQuery('.selectpickerS').val(selectThis);
           //jQuery('.selectpickerS').selectpicker('render');
       }
       jQuery('.selectpickerS').change(function() {
           for (var i = 0; i < filters.length; i++) {
               for (var j = 0; j < filters[i]["rules"].length; j++) {
                   // The stored name of the filter can contain html characters ("<").
                   // Get the html version of the name for the comparisons.
                   var t = jQuery("<div>").append(jQuery(this).val()).html();
                   if (t == filters[i]["rules"][j]["name"]) {
                       jQuery('.inputmeasures').val(filters[i]["rules"][j]["func"]);
                       changeSearch();
                   }
               }
           }
       });
   });
 }

function highlight(where, what) {
//    return;
    // get that measure for each variable
    var idWhat = -1;
    for (var i = 0; i < header.length; i++) {
        if (what == header[i]) {
            idWhat = i;
            break;
        }
    }
    if (idWhat == -1) {
        console.log("Error: could not find " + what + " variable in the header");
        return;
    }
    var measure = new Object();
    var valueAr = {}; // get the unique values from this array
    for (var i = 0; i < allMeasures[what].length; i++) {
        valueAr[allMeasures[what][i]] = 1;
    }
    // come up with a color code for this measure, sort and use colormap
    valueAr = Object.keys(valueAr);
    // how do we need to sort? alphabetic or by number?
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && !isNaN(n - 0);
    }
    if (valueAr.length > 0 && isNumber(valueAr[0]))
        valueAr.sort(function(a,b) { return a-b; });
    else
        valueAr.sort(); // use alphabetic sorting
    
    for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
        if (!measure.hasOwnProperty(allMeasures[header[idxSubjID]][i]))
            measure[allMeasures[header[idxSubjID]][i]] = new Object();
        measure[allMeasures[header[idxSubjID]][i]][allMeasures[header[idxVisitID]][i]] = allMeasures[header[idWhat]][i];
    }
    
    jQuery(where + " .data").each(function(dat) {
        var sid = jQuery(this).attr('subjid');
        var vid = jQuery(this).attr('visitid');
        var need_light = jQuery(this).attr('light');
	// we could show only a single circle, but what if we have more variables? We could also show all of them and less pills
	//if (need_light == "on")
	//   return;
        var v = valueAr.indexOf(""+measure[sid][vid]) / (valueAr.length - 1);
        var col = parseInt(8 * v); // goes from 0 to valueAr.length
        // console.log("highlight: "+dat + " " + sid + " " + vid + " " + measure[sid][vid] + " val: .q" + col + "-9");
        //jQuery(this).children().remove();
        
        if (parseFloat(measure[sid][vid]) == measure[sid][vid]) {
            jQuery('<div class="spot ' + "q" + col + "-9" + '" data-toggle="tooltip" title="' + what + ' = ' + parseFloat(measure[sid][vid]).toFixed(2) + '"></div>').appendTo(this); // .hide().appendTo(this).fadeIn(1500);
        } else {
            jQuery('<div class="spot ' + "q" + col + "-9" + '" data-toggle="tooltip" title="' + what + ' = ' + measure[sid][vid] + '"></div>').appendTo(this);
        }
        //jQuery(this).append('<div class="spot ' + "q" + col + "-9" + '" title="' + what + ' = ' + measure[sid][vid] + '"></div>');
	jQuery(this).attr('light', "on");
    });
    
}

 // create one level of the filter
 // below - where one block should be
function createBlock(below) {
    // organization: #below div .dataHere
    
    // add two rows, one for the data the other for the filter
    var d01 = document.createElement("div");
    jQuery(d01).addClass("row").addClass('no-gutters').css('margin-top', '10px');
    var d02 = document.createElement("div");
    jQuery(d02).addClass("row").css('margin-top', '10px');
    var d1 = document.createElement("div");
    var d2 = document.createElement("div");
    jQuery(d1).addClass("col-9");
    jQuery(d2).addClass("col-12");
    jQuery(d2).addClass("dataHere");
    jQuery(below).append("<div class=\"sectionTitle\" id=\"dataHereTitle\">All data points available in " + project_name + "</div>");
    jQuery(d02).append(d2);
    jQuery(below).append(d02);
    jQuery(below).append(d01);
    // now add a div for the data
    
    var existingFilters = document.createElement("div");
    jQuery(existingFilters).addClass('existingFilterDiv');
    jQuery(existingFilters).addClass('col-3');
    var sel = document.createElement("select");
    jQuery(sel).addClass('selectpickerS');
    jQuery(sel).addClass('existingFilters');
    jQuery(sel).attr('data-live-search', 'true');
    jQuery(sel).attr('data-size', '10');
    jQuery(existingFilters).append(sel);
    jQuery(d01).append(existingFilters);
    
    jQuery(d01).append(d1);
    
    var d21 = document.createElement("div");
    //jQuery(d21).addClass("span12");
    jQuery(d21).addClass("select");
    jQuery(d1).append(d21);
    jQuery(d21).append('<div class="input-group">' +
                       '  <input class="inputmeasures form-control" type="text" placeholder="select a predefined filter or enter your own">  ' +
                       '  <div class="input-group-append">' +
                       '    <button class="btn-outline-secondary btn" id="runFilter" type="button">&nbsp;Run</button>' +

                       '    <button type="button" class="btn-outline-secondary btn" id="saveNewFilter">&nbsp;Save/Delete</button>' +
                       '  </div>' +
                       '</div>');
    jQuery(d21).append('<div id="info"></div>')
    jQuery('#saveNewFilter').click(function() {
        var z = jQuery('.inputmeasures').val();
        if(z == ""){
            return; // nothing to do
        }
        jQuery('#save-filter-button').on('click', function() {
            console.log("save the current filter " + jQuery('#new-filter-name').val() + " " + jQuery(this).attr('filter'));
            jQuery.get('getFilter.php', { 'action': 'save', 'name': jQuery('#new-filter-name').val(),
                                          'value': jQuery(this).attr('filter').replace(/\s/g,'') }, function(data) {
                                              console.log(JSON.stringify(data));
                                              getAllFilters( jQuery('#new-filter-name').val() );
                                          });
        });
        jQuery('#delete-filter-button').on('click', function() {
            console.log("delete the current filter " + jQuery('#new-filter-name').val() + " " + jQuery(this).attr('filter'));
            jQuery.getJSON('getFilter.php', { 'action': 'delete', 'name': jQuery('#new-filter-name').val() }, function(data) {
                console.log("Delete the data " + JSON.stringify(data));
                jQuery('input.inputmeasures').val("");
                getAllFilters( "Predefined filters" );
                // TODO: clear the Yeah and Nay 
            });
        });
        
        jQuery('#save-filter-box').modal('show');
        jQuery('#save-filter-button').attr('filter', jQuery('.inputmeasures').val());
        jQuery('#new-filter-name').val(jQuery('.selectpickerS').val());
        
        //alert('not implemented yet, would have to store this as a filter');  
    });
}

function getVariablesFromSearch( search ) {
    var searchTerms = [];
    try {
        searchTerms = search.match(/[\"$]*[A-Za-z0-9_\.]+[\"\ ]*?/g).map(function(v){ return v.replace(/[\"\$]/g,''); });
    } catch(e) {};
    // create unique list of variables
    searchTerms = searchTerms.sort();
    for (var i = 1; i < searchTerms.length; i++) {
        if (searchTerms[i] == searchTerms[i-1]) {
            searchTerms.splice(i,1);
            i--;
        }
    }
    
    var languageKeywords = [ "has", "not", "and", "or", "visit", "numVisits" ];
    for (var i = 0; i < searchTerms.length; i++) {
        var idx = languageKeywords.indexOf(searchTerms[i]);
        if ( idx !== -1 || searchTerms[i] == +searchTerms[i] ) {
            searchTerms.splice(i, 1);
            i--; // check same position again because we removed one entry
        }
    }
    
    searchTermsAll = searchTerms.slice(0);
    return searchTermsAll;
}

function changeSearch() {
    toggleFamilyViewOn = false;
    jQuery('.loading').show();
    // do a partial load of only the variables of interest (overwrite allMeasures)
    var requiredVariables = [ "gender", "src_subject_id", "eventname" ];
    
    // get the variables from the searchTerm
    var search = jQuery('.inputmeasures').val();
    var searchTerms = [];
    try {
        searchTerms = search.match(/[\"$]*[A-Za-z0-9_\.]+[\"\ ]*?/g).map(function(v){ return v.replace(/[\"\$]/g,''); });
    } catch(e) {};
    // create unique list of variables
    searchTerms = searchTerms.sort();
    for (var i = 1; i < searchTerms.length; i++) {
        if (searchTerms[i] == searchTerms[i-1]) {
            searchTerms.splice(i,1);
            i--;
        }
    }
    
    var languageKeywords = [ "has", "not", "and", "or", "visit", "numVisits" ];
    for (var i = 0; i < searchTerms.length; i++) {
        var idx = languageKeywords.indexOf(searchTerms[i]);
        if ( idx !== -1 || searchTerms[i] == +searchTerms[i] ) {
            searchTerms.splice(i, 1);
            i--; // check same position again because we removed one entry
        }
    }
    
    searchTermsAll = searchTerms.slice(0);
    searchTermsAll.push.apply(searchTermsAll, requiredVariables);
    // make sure we load all of them
    var promises = [];
    for (var i = 0; i < searchTermsAll.length; i++) {
        if (typeof allMeasures[searchTermsAll[i]] === 'undefined') {
            var p = addOneMeasure(searchTermsAll[i]);
            if (p !== null)
                promises.push(p);
        }
    }
    // wait for all the measures to come back before we continue
    jQuery.when.apply(jQuery, promises).then(function() {
        console.log("now we can continue with our work");
        // now we know what variables are known, lets filter searchTerms again
        var nst = [];
        for (var i = 0; i < searchTerms.length; i++) {
            if (typeof allMeasures[searchTerms[i]] !== 'undefined')
                nst.push(searchTerms[i]);
        }
        searchTerms = nst;
        jQuery('.loading').hide();    
        parse();
        jQuery('.spot').remove();
        try {
            createTermInfo(searchTerms);
        } catch(e) {};
        // create the output for this stage
        // check if output exists?
        if (jQuery('#start div .dataHere').parent().next().next().children(':first').find('.yes').length == 0) {
            var newDParent = jQuery('#start div .dataHere').parent().parent();
            var newDiv = document.createElement("div");
            jQuery(newDiv).addClass("row").css('margin-top', '-10px');
            if (jQuery('.yes').length == 0) {
                var yes = document.createElement("div");
                jQuery(yes).addClass("col-6");
                jQuery(yes).addClass("yes");
                //createBlock(yes);
                // fill this block
                
                jQuery(newDiv).append(yes);
                var no = document.createElement("div");
                jQuery(no).addClass("col-6");
                 jQuery(no).addClass("no");
                //createBlock(no);
                // fill this block
                
                jQuery(newDiv).append(no);

                jQuery(newDParent).append("<div class=\"row\"><div class=\"sectionTitle col-12\">Result of the current restriction<span id='fam-sort'></span><div class=\"float-right\" style=\"margin-top: -5px;\">" + " <button class=\"toggle-stats btn btn-sm btn-dark\" title=\"Toggle view of Table 1.\" data-target=\"#table-1-box\" data-toggle=\"modal\">Table 1</button>" + "</div></div></div>");

                jQuery(newDParent).append(newDiv);
            }
        }
        jQuery('.loading').hide();
        
    }, function() {
        console.log("Error waiting for promises...");
    });     
}

// array of array in data
function displayData(data, where) {
	jQuery(where).children().remove();
	str = '<div class="datas front face">';
	let str_later = '';
	//str += '<button class=\"btn-toggle-stats toggle-stats btn btn-sm btn-dark\">Table 1</button>';
	max_per_page = 1500
	hide_elements = 0
	if(data.length < max_per_page){
		max = 0
	}else{
		max = Math.ceil(data.length / max_per_page) 
	}
	for (var i = 0; i < data.length; i++) {
		if(Math.floor(Math.random() * Math.floor(max)) == 0){
			str = str + '<div class="data" SubjID="' + data[i][idxSubjID] + 
				'" light ="' + "off" +
				'" VisitID="' + data[i][idxVisitID] + 
				'" StudyDate="' + data[i][idxStudyDate] + 
				'" data-toggle="tooltip" title="SubjID: ' + data[i][idxSubjID] + ', VisitID: ' + data[i][idxVisitID] + (typeof data[i][idxStudyDate]=='undefined'?"":', StudyDate: ' + data[i][idxStudyDate]) + '">' + "" + '</div>';
		} else {
			str_later = str_later + '<div class="data" SubjID="' + data[i][idxSubjID] +
				'" light ="' + "off" +
                                '" VisitID="' + data[i][idxVisitID] +
                                '" StudyDate="' + data[i][idxStudyDate] +
                                '" data-toggle="tooltip" title="SubjID: ' + data[i][idxSubjID] + ', VisitID: ' + data[i][idxVisitID] + (typeof data[i][idxStudyDate]=='undefined'?"":', StudyDate: ' + data[i][idxStudyDate]) + '">' + "" + '</div>';
			hide_elements += 1
		}
	}
	str = str + '</div>';
	str = str + '<div class="back face center"></div>';
	// str = str + '<button class=\"btn-toggle-stats toggle-stats btn btn-sm btn-dark\">Table 1</button>';

        jQuery(where).append(str);
        if (hide_elements > 0)
           jQuery(where).find(".front").append("<br><button class='btn btn-sm btn-primary'>Show all "+ hide_elements.toLocaleString() +" items</button>");
	jQuery(where).find(".front").find("button").on("click",function(){
		jQuery(where).find(".front").find("button").remove()
		jQuery(where).find(".front").find("br").remove()
		jQuery(where).find(".front").append(str_later)
		zoomCalculate()
	})
	//jQuery(where).on('click', '.data', function(event) {
	//   showInfoWindow(event, this);
	//});
}

function showInfoWindow(event, t) {
  var subjid = jQuery(t).attr('SubjID');
  var visitid = jQuery(t).attr('VisitID');
  var studydate = jQuery(t).attr('StudyDate');
  var title = jQuery(t).find('.spot').attr('Title');

  // create a div that we want to display inside a popup
  var popup = document.createElement('div');
  // create a unique ID for each div we create as a popup
  var numRand = Math.floor(Math.random() * 1000);
  popup.setAttribute('id', 'popup' + subjid + visitid);
  popup.className = 'highslide-html-content';

  var header = document.createElement('div');
  header.className = 'highslide-header';
  popup.appendChild(header);
  var headerList = document.createElement('ul');
  header.appendChild(headerList);
  var entry = document.createElement('li');
  headerList.appendChild(entry);
  entry.className = 'highslide-close';
  var closeLink = document.createElement('a');
  entry.appendChild(closeLink);
  closeLink.setAttribute('href', '#');
  closeLink.setAttribute('title', '{hs.lang.closeTitle}');
  closeLink.setAttribute('onclick', 'return hs.close(this)');
  var closeLinkSpan = document.createElement('span');
  closeLink.appendChild(closeLinkSpan);
  closeLinkSpan.innerHTML = '{hs.lang.closeText}';

  var popupBody = document.createElement('div');
  popupBody.className = 'highslide-body';
  popupBody.setAttribute('margin-top', '30px');
  popup.appendChild(popupBody);
  var popupBodyDiv = document.createElement('div');
  //popupBodyDiv.setAttribute('style', 'float: right; width: 110px; margin: 4px;');
  popupBody.appendChild(popupBodyDiv);
  var can = document.createElement('div');
  popupBodyDiv.appendChild(can);
  can.setAttribute('id', 'sliceCanvas' + subjid + visitid);
  jQuery(can).append("<br/><span>SubjID:" + subjid + "</span><br/>");
  jQuery(can).append("<span>VisitID:" + visitid + "</span><br/>");
  jQuery(can).append("<span>StudyDate:" + studydate + "</span><br/>");
  jQuery(can).append("<span>" + title + "</span><br/>");
  document.getElementById('place-for-popups').appendChild(popup);
  var te = document.createElement('div');
  te.setAttribute('id', 'text' + subjid + visitid);
  var txtNode = document.createTextNode("");

  te.appendChild(txtNode);
  popupBody.appendChild(te);
  var footer = document.createElement('div');
  footer.className = 'highslide-footer';
  popup.appendChild(footer);
  var span = document.createElement('span');
  span.className = 'highslide-resize';
  span.setAttribute('title', '{hs.lang.resizeTitle}');
  footer.appendChild(span);

  hs.htmlExpand(null, {
    pageOrigin: {
      x: event.pageX,
      y: event.pageY
    },
    contentId: 'popup' + subjid + visitid,
    headingText: 'Subject info', // + ' (' + gender + ')',
    width: 310,
    height: 190
  });
 }

 function createTermInfo( searchTerms ) {
   // look through allMeasures
   var infoStr = "";
   jQuery('#info').html(infoStr);
   searchTerms.forEach( function(t) {

     var idWhat = -1;
     for (var i = 0; i < header.length; i++) {
       if (t == header[i]) {
         idWhat = i;
         break;
       }
     }
     if (idWhat == -1) {
       infoStr = infoStr + "<div class=\"info\"><span>"+t+" is unknown</span></div>";      
       return;
     }

     var mmin = +allMeasures[header[idWhat]][0];
     var mmax = mmin;
     if (isNaN(mmin)) {
        mmin = allMeasures[header[idWhat]][0];
        mmax = "";
        // search for the next entry
        for (var i = 1; i < allMeasures['src_subject_id'].length; i++) {
            if ( (allMeasures[header[idWhat]][i] !== "" && allMeasures[header[idWhat]][i] !== null) && allMeasures[header[idWhat]][i] !== mmin) {
              mmax = allMeasures[header[idWhat]][i]; // just show the first two as examples 
              break;
          }
        }
     } else {
         for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
             if (!isNaN(allMeasures[header[idWhat]][i])) {
                 if (mmin > allMeasures[header[idWhat]][i])
                     mmin = +allMeasures[header[idWhat]][i];
                 if (mmax < allMeasures[header[idWhat]][i])
                     mmax = +allMeasures[header[idWhat]][i];
             }
         }
         mmin = parseFloat(mmin).toFixed(2);
         mmax = parseFloat(mmax).toFixed(2);
     }
       sc_min = getColorForMeasure(t, mmin);
       sc_max = getColorForMeasure(t, mmax);

       infoStr = infoStr + "<div class=\"info\"><span class=\"var-name\">" + t + "</span>:" +
           "<div class=\"spot " + sc_min + "\"></div><span> " + mmin.toString() + "</span>..." +
           "<span>" + mmax.toString() + "</span>" + " <div class=\"spot " + sc_max + "\"></div>" +
           "</div>";
   });
   jQuery('#info').html(infoStr);
 }

function parse() {
    jQuery('.dataHere').hide();
    jQuery('#dataHereTitle').hide();
    // delete the dataHere block
    jQuery('.dataHere').children().remove();
    // try peg library
    // we will apply the rules to each data entry and generate an output array
    var searchTerm = jQuery('.inputmeasures').val();
    jQuery('.loading').show();
    jQuery.get('js/grammar_vectorized.txt?_=112', function(data) {
        var parser;
        try {
            parser = PEG.buildParser(data);
        } catch(e) {
            alert('Parser is invalid: ' + e);
            jQuery('.loading').hide();
        }
        var yes = [];
        var no = [];
        // Do a single vectorized parse step (should speed things up).
        // The return can be a scalar as in has(age).
        var res = [];
        try {
            res = parser.parse(searchTerm);
        } catch(e) {
            jQuery('.loading').hide();
            alert("Error: Invalid filter, please check your syntax. Detailed error message: " + e.message);
            return false;
        }           
        for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
            var d = Array.apply(null, new Array(header.length)).map(function(){return 0;});
            for (var j = 0; j < header.length; j++) {
                d[j] = allMeasures[header[j]][i];
            }
            var tf = false;
            if (res.constructor === Array && res.length == allMeasures['src_subject_id'].length) {
                tf = res[i];
            } else {
                tf = res;
            }
            
            if (tf === true) {
                yes.push(d);
            } else {
                no.push(d);
            }
        }
        console.log('number of yes/no: ' + yes.length + " " + no.length);
        displayData(yes, ".yes");
        displayData(no, ".no");
        
        // add Yea and Nay fields
        var yea = jQuery(document.createElement("div")).addClass("Yea");
        var nay = jQuery(document.createElement("div")).addClass("Nay");
        jQuery('.yes').append(yea);
        jQuery('.no').append(nay)
        
        var SubjIDIDX = header.indexOf("src_subject_id");
        var VisitIDIDX = header.indexOf("eventname");
        if (SubjIDIDX == -1) {
            alert("Error: could not find a src_subject_id entry");
        }
        
        var yesSubjects = [];
	var yesDictEvents = {}
        for(var i = 0; i < yes.length; i++) {
            if (VisitIDIDX > -1) {
                yesSubjects.push([ yes[i][SubjIDIDX], yes[i][VisitIDIDX] ]); // append the SubjID and the VisitID
            } else {
                yesSubjects.push( yes[i][SubjIDIDX] ); 
            }
	    if (typeof no[i] !== 'undefined' && typeof no[i][VisitIDIDX] !== 'undefined' && no[i][VisitIDIDX]){ 
	    	if(!yesDictEvents[yes[i][VisitIDIDX]]){
	    		yesDictEvents[yes[i][VisitIDIDX]] = 0
	    	}
	    	yesDictEvents[yes[i][VisitIDIDX]] += 1
	    }
        }
        yesSubjects = jQuery.unique(yesSubjects);
        
	var numYesSubjects = jQuery.unique(yesSubjects.map(function(e) { if (e.length == 2) return e[0]; else return e; })).length;
        
        var noSubjects = new Array();
	var noDictEvents = {};
        for(var i = 0; i < no.length; i++) {
            if (VisitIDIDX > -1) {
                noSubjects.push([ no[i][SubjIDIDX], no[i][VisitIDIDX] ]);
            } else {
                noSubjects.push( no[i][SubjIDIDX] );
            }
	    if (typeof no[i] !== 'undefined' && typeof no[i][VisitIDIDX] !== 'undefined' && no[i][VisitIDIDX]){
	    	if(!noDictEvents[no[i][VisitIDIDX]]){
	    		noDictEvents[no[i][VisitIDIDX]] = 0
	    	}
	    	noDictEvents[no[i][VisitIDIDX]] += 1
	    }
        }
        noSubjects = jQuery.unique(noSubjects); // we can have the same subject with multiple VisitIDs, but together they should be unique
        var numNoSubjects = jQuery.unique(noSubjects.map(function(e) { if (e.length == 2) return e[0]; else return e; })).length;
        
        // we should get a key for this selection (either Yea or Nay)
        // lets make the key dependent on the search string - will provide us with less files to worry about
        var uniqueIDY = hex_md5(project_name + jQuery('.inputmeasures').val().replace(/\s/g,'') + "YES").slice(-4);
        //var uniqueIDY = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
        var uniqueIDN = hex_md5(project_name + jQuery('.inputmeasures').val().replace(/\s/g,'') + "NO").slice(-4);
        //var uniqueIDN = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);


	var yesEvents = "<hr style=\"border-top-color: white; margin-top: 0.5rem; margin-bottom: 0.2rem;\">";
	var yesDictList = []
	for (var event_it in yesDictEvents){
	    yesDictList.push(event_it)
	}
	yesDictList.sort(function(a,b){ 
	    if(a.indexOf("baseline") > -1){
		return -1
	    }
	    if(b.indexOf("baseline") > -1){
                return 1
            }
	    a_score =  +a.split("_")[0];
	    b_score =  +b.split("_")[0];
	    if(a.indexOf("year") > -1){
		a_score = 12 * a.split("_")[0]
	    }
	    if(b.indexOf("year") > -1){
                b_score = 12 * b.split("_")[0]
            }
	    return a_score - b_score
	})

 	for (var event_it_id in yesDictList){	
	    event_it = yesDictList[event_it_id];
	     yesEvents += "<small style=\"display: block;\"><span class=\"name\">" + event_it.replace("_arm_1","") + ":</span><span class=\"number\">" + yesDictEvents[event_it].toLocaleString() + "</span></small>";
	}
	yesEvents += "";
        if (yes.length > 0) {
            jQuery('.Yea').html("Yea: " + yes.length.toLocaleString() + "<br/><small title=\"Use this key to reference the set of subjects for which the filter is true.\">key: #" +
                                uniqueIDY + "</small>").attr('title', yes.length.toLocaleString() + ' sessions for which the filter "' + uniqueIDY + '" is true (#subjects: '+ numYesSubjects+')');
	    
	    jQuery('.Yea').append(yesEvents)
	    
            jQuery('.Yea').draggable();
        }
	    
	var noEvents = "<hr style=\"border-top-color: white; margin-top: 0.5rem; margin-bottom: 0.2rem;\">";
	var noDictList = []
	for (var event_it in noDictEvents){
	    noDictList.push(event_it)
	}
	noDictList.sort(function(a,b){ 
	    if(a.indexOf("baseline") > -1){
		return -1
	    }
	    if(b.indexOf("baseline") > -1){
                return 1
            }
	    a_score =  +a.split("_")[0];
	    b_score =  +b.split("_")[0];
	    if(a.indexOf("year") > -1){
		a_score = 12 * a.split("_")[0]
	    }
	    if(b.indexOf("year") > -1){
                b_score = 12 * b.split("_")[0]
            }
	    return a_score - b_score
	})

 	for (var event_it_id in noDictList){	
	    event_it = noDictList[event_it_id];
	    noEvents += "<small style=\"display: block;\"><span class=\"name\">" + event_it.replace("_arm_1","") + ":</span><span class=\"number\">" + noDictEvents[event_it].toLocaleString() + "</span></small>";
	}
	noEvents += ""

        if (no.length > 0) {
            jQuery('.Nay').html("Nay: " + no.length.toLocaleString()).attr('title', no.length.toLocaleString() + ' sessions for which the filter "' + uniqueIDN + '" is false (#subjects: '+ numNoSubjects+')');
	    jQuery('.Nay').append(noEvents)
            jQuery('.Nay').draggable();
        }
        // store this as subset
        jQuery.ajax({
            type: "POST",
            url: 'saveAsSubset.php',
            data: {
                project_name: project_name,
                key: uniqueIDY,
                set: yesSubjects,
                code: jQuery('.inputmeasures').val().replace(/\s/g,''),
                which: 'yes'
            }
        }).done(function(msg) {
            //alert(msg);
            console.log("after store this subset Yes");
        }).fail(function(msg) {
            alert('error');
            jQuery('.loading').hide();
        });
        
/*        jQuery.ajax({
            type: "POST",
            url: 'saveAsSubset.php',
            data: {
                project_name: project_name,
                key: uniqueIDN,
                set: noSubjects,
                code: jQuery('.inputmeasures').val().replace(/\s/g,''),
                which: 'no'
            }
        }).done(function(msg) {
            // alert(msg);
            console.log("after store this subset No");
        }).fail(function(msg) {
            alert('hi ' + msg);
            jQuery('.loading').hide();
        }); */
        
        var search = jQuery('.inputmeasures').val();
        var variables = [];
        try {
            variables = search.match(/[\"\$]*[A-Za-z0-9_\.]+[\"\ ]*?/g).map(function(v){ return v.replace(/[\"\$]/g,''); });
        } catch(e) {};
        
        // create unique list of variables
        variables = variables.sort();
        for (var i = 1; i < variables.length; i++) {
            if (variables[i] == variables[i-1]) {
                variables.splice(i,1);
                i--;
            }
        }
        
        var languageKeywords = [ "has", "not", "and", "or", "visit", "numVisits", "unique", "quantile" ];
        for (var i = 0; i < variables.length; i++) {
            var idx = languageKeywords.indexOf(variables[i]);
            if ( idx !== -1 || variables[i] == +variables[i]) {
                variables.splice(i, 1);
                i--; // check same position again because we removed an entry
            }
        }
        
        if (variables.length == 0) {
            variables.push("src_subject_id");
        }
        variables.forEach( function(v) { 
            highlight('.yes', v);
        });
        variables.forEach( function(v) { 
            highlight('.no', v);
        });
        jQuery('.loading').hide();
        setZoom(zoomFactor);
    });
}

var disableLocalStorage = false;

// can we store data locally?
function storageAvailable(type) {
    if (disableLocalStorage)
        return false;

    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
}

function getColorForMeasure( what, value ) {
    var valueAr = {}; // get the unique values from this array
    if (isNumber(value)) {
        for (var i = 0; i < allMeasures[what].length; i++) {
            var k = parseFloat(allMeasures[what][i]).toFixed(2);
            valueAr[k] = 1;
        }
    } else {
        for (var i = 0; i < allMeasures[what].length; i++) {
            var k = allMeasures[what][i];
            valueAr[k] = 1;
        }
    }
    // come up with a color code for this measure, sort and use colormap
    valueAr = Object.keys(valueAr);

    // how do we need to sort? alphabetic or by number?
    if (valueAr.length > 0 && isNumber(valueAr[0]))
        valueAr.sort(function(a,b) { return a-b; });
    else
        valueAr.sort(); // use alphabetic sorting

    var v = valueAr.indexOf(""+value) / (valueAr.length - 1);
    var col = parseInt(8 * v); // goes from 0 to valueAr.length
    return "q" + col + "-9";
}

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
    
    // maybe this measure can be copied from the localStorage? In that case we don't have to transfer it to the client a second time
    if (storageAvailable('localStorage')) {
        var dataFromStore = localStorage.getItem(meas);
        if (dataFromStore) {
            allMeasures[meas] = JSON.parse(dataFromStore);
            if (header.indexOf(meas) === -1)
                header.push(meas);

            // make sure we have src_subject_id and eventname as well
            if (Object.keys(allMeasures).indexOf('src_subject_id') == -1 || allMeasures['src_subject_id'].length == 0) {
                var dataFromStore = localStorage.getItem('src_subject_id');
                if (dataFromStore) {
                    allMeasures['src_subject_id'] = JSON.parse(dataFromStore);
                    if (header.indexOf('src_subject_id') === -1)
                        header.push('src_subject_id');
                }            
            }
            if (Object.keys(allMeasures).indexOf('eventname') == -1 || allMeasures['eventname'].length == 0) {
                var dataFromStore = localStorage.getItem('eventname');
                if (dataFromStore) {
                    allMeasures['eventname'] = JSON.parse(dataFromStore);
                    if (header.indexOf('eventname') === -1)
                        header.push('eventname');
                }
            }
            return Promise.resolve();
        }
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
        // store this column in the localStorage
        if (storageAvailable('localStorage')) {
	    // any store can fail if we have used up all the memory (5MB per site)
	    try {
		if (typeof allMeasures['src_subject_id'] !== 'undefined')
                    localStorage.setItem('src_subject_id', JSON.stringify(allMeasures['src_subject_id']));
		if (typeof allMeasures['eventname'] !== 'undefined')
                    localStorage.setItem('eventname', JSON.stringify(allMeasures['eventname']));
		localStorage.setItem(meas, JSON.stringify(allMeasures[meas]));
	    } catch (e) {
		console.log("Warning: Quota probably exceeded, no more values will be cached.");
	    }
        }
    });
}

// todo: save the zoom factor in a session variable
var zoomFactor = 100;
function setZoom( factor ) {
    jQuery('.datas').css('zoom', factor+"%");
    zoomFactor = factor;
}

var toggleFamilyViewOn = false;
function toggleFamilyView() {
    if (toggleFamilyViewOn)
        return; // only do this once
    
    toggleFamilyViewOn = true;
    jQuery('#fam-sort').text(" (sorted by family)");
    
    // console.log('sort all entries into different sites/families/groups');
    // use allMeasures['rel_family_id'] and allMeasures['rel_group_id']

    // first group by first measure
    firstMeasure = 'rel_family_id';

    // secondarily transform by
    secondMeasure = 'rel_group_id'; 

    var pills = jQuery('div.yes div.data');

    // create div's for the firstMeasure (sort by rel_family_id)
    var pill_map = [];
    for (var i = 0; i < pills.length; i++) {
        var x = pills[i];
        var pGUID = jQuery(x).attr('subjid');
        var pos = allMeasures['src_subject_id'].indexOf(pGUID);
        if (pos > -1) {
            var key = allMeasures['rel_family_id'][pos];
            var group = allMeasures['rel_group_id'][pos];
            jQuery(x).attr('rel_group_id', group);
            pill_map[key] = pill_map[key] || [];
            pill_map[key][group] = pill_map[key][group] || [];
            pill_map[key][group].push(x);
        }
    }

    // use mansonry to map everything to .datas
    for (var box in pill_map) {
        numPills = 0;
        for (var group in pill_map[box]) {
            for (var pill in pill_map[box][group]) {
                numPills++;
            }
        }
        
        // create a new div
        var c = jQuery("<div class='masonry-layout__panel'></div>");
        if (numPills > 1) {
            jQuery(c).addClass('link1');
        }
        jQuery(c).attr('rel_family_id', box);
        // we should also group by group

        for (var group in pill_map[box]) {
            var d = jQuery('<div class="masonry-layout__group"></div>');
            var numInGroup = Object.keys(pill_map[box][group]).length;
            if (numInGroup > 1 /*&& numInGroup < numPills*/) {
                //jQuery(d).addClass('link'+(+group+1));
                // might be ok to use link2 only
                jQuery(d).addClass('link2');
            }
            jQuery(d).attr('group', group);
            var count = 0;
            for (var pill in pill_map[box][group]) {
                if (count < numInGroup)
                    jQuery(pill_map[box][group][pill]).css('margin-right', '2px');
                else
                    jQuery(pill_map[box][group][pill]).css('margin-right', '0px');
                d.append(pill_map[box][group][pill]);
                count++;
            }
            jQuery(c).append(d);
        }
        if (numPills > 1)
            jQuery('div.yes div.datas').append(c);
        else
            jQuery('div.yes div.datas').prepend(c);
    }

    
}

jQuery(document).ready(function() {
    jQuery('.project_name').text(project_name);
    createBlock('#start');
    getAllFilters();
    jQuery('select.selectpickerS').select2({ width: '100%' }); 
    jQuery('#dataHereTitle').hide();
    // don't react to change, we will get a change on loosing focus, only react to hitting the enter key
    jQuery('.inputmeasures').on('keypress', function(e) {
        if (e.keyCode == 13)
            changeSearch();
    });
    jQuery('#runFilter').on('click', function() {
        var text = jQuery('.inputmeasures').val();
        if (text == "") {
            alert("No filter selected. Start by either selecting a predefined filter from the drop-down, or by typing in a new filter.");
            return;
        }
        changeSearch();
    });
    jQuery(document).on('click touchstart', '.datas', function() {
        toggleFamilyView();
    });

    jQuery('#start').on('click', 'button.toggle-stats', function() {

        jQuery('.loading').show();
        jQuery('#table-1-place').children().remove();
	// rotate the div to show the back
	/* var t = jQuery('div.yes');
	if (t.css('transform') != "none") {
	    console.log("delete animation again");
	    t.css('transform', '');
	    t.find('div.datas').show();
	    t.find('div.Yea').show();
	    return;
	}
	console.log("set animation");
	// apply rotate css code
	jQuery('div.yes').parent().css('perspective', '10000px');
	jQuery('div.yes').parent().css('perspective-origin', '50% 50%');
	jQuery('div.yes .face.back').css('width', jQuery('div.yes div.datas').width());
	jQuery('div.yes .face.back').css('height', jQuery('div.yes div.datas').height());
	jQuery('div.yes .face.back').css('zoom', jQuery('div.yes div.datas').css('zoom'));
	setTimeout(function() {
	    t.find('div.datas').hide();
	    t.find('div.Yea').hide();
	}, 500);

	t.css('transform', 'rotateY(180deg)'); */

	var uniqueIDY = hex_md5(project_name + jQuery('.inputmeasures').val().replace(/\s/g,'') + "YES").slice(-4);
        // here we cannot use allMeasures because that contains measures from runs before
        var usedMeasures = getVariablesFromSearch( jQuery('.inputmeasures').val() );
	var okKeys = usedMeasures.filter(function(a) {
	    if (a !== "src_subject_id" && a !== "abcd_site" && a != "rel_family_id" && a != 'rel_group_id' && a != "gender")
		return a;
	});
	jQuery.getJSON('getTable1.php', { 'value': okKeys.join(","),
					  'file': 'filterSets_' + project_name +'_'+ uniqueIDY + '.json' }, function(data) {

          jQuery('#table-1-place').html(data.join("").split("( ").join("("));

          jQuery('#table-1-place').find('table').css('margin-left', 'auto');
	  jQuery('#table-1-place').find('table').css('margin-right', 'auto');
	  jQuery('#table-1-place').find('table').css('font-size', '1rem');
	  jQuery('#table-1-place').find('table').css('line-height', '1.5');

	    
	  jQuery('#table-1-place').find('td').css('border-bottom-color', 'white');
          jQuery('.loading').hide();
                                              
          /*jQuery('div.yes .face.back').html(data.join("").split("( ").join("("));

	    jQuery('div.yes .face.back').find('table').css('margin-left', 'auto');
	    jQuery('div.yes .face.back').find('table').css('margin-right', 'auto');
	    jQuery('div.yes .face.back').find('table').css('font-size', '1rem');
	    jQuery('div.yes .face.back').find('table').css('line-height', '1.5');
	    

	    jQuery('div.yes .face.back').find('td').css('border-bottom-color', 'white'); */

	});
	
    });
    
    setTimeout(function() { addOneMeasure('age'); addOneMeasure('rel_family_id'), addOneMeasure('rel_group_id'); addOneMeasure('abcd_site'); }, 0);
});


function zoomCalculate(){
        
        var search = jQuery('.inputmeasures').val();
        var variables = [];
        try {
            variables = search.match(/[\"\$]*[A-Za-z0-9_\.]+[\"\ ]*?/g).map(function(v){ return v.replace(/[\"\$]/g,''); });
        } catch(e) {};
        
        // create unique list of variables
        variables = variables.sort();
        for (var i = 1; i < variables.length; i++) {
            if (variables[i] == variables[i-1]) {
                variables.splice(i,1);
                i--;
            }
        }
        
        var languageKeywords = [ "has", "not", "and", "or", "visit", "numVisits", "unique", "quantile" ];
        for (var i = 0; i < variables.length; i++) {
            var idx = languageKeywords.indexOf(variables[i]);
            if ( idx !== -1 || variables[i] == +variables[i]) {
                variables.splice(i, 1);
                i--; // check same position again because we removed an entry
            }
        }
        
        if (variables.length == 0) {
            variables.push("src_subject_id");
        }
        variables.forEach( function(v) { 
            highlight('.yes', v);
        });
        variables.forEach( function(v) { 
            highlight('.no', v);
        });
        jQuery('.loading').hide();
        setZoom(zoomFactor);

}
