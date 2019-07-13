var filters = null;
var allMeasures = { "src_subject_id": [], "eventname": [] };
var idxSubjID = 0;
var idxVisitID = 1;
var idxStudyDate = -1;
var header = [ "src_subject_id", "eventname" ];
var classesForDrugs = {};

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
        jQuery('.spinner-text').html("Access ABCD measure: " + meas);
        var k  = Object.keys(allMeasures);
        k.splice(k.indexOf('src_subject_id'),1);
        k.splice(k.indexOf('eventname'),1);
        var ids    = data[0]; // each of these are arrays
        var event  = data[1];
        var v = null;
        if (data.length > 2 && data[2] != null) {
            
            v = data[2];
            // ignore all measures but the first
            /*var blendout = 6000;
            for (var i = 0; i < v.length; i++) {
                if (v[i] !== "") {
                    if (blendout == 0) {
                        v[i] = "";
                    } else {
                        blendout--;
                    }
                }
            }*/
            
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
                    allMeasures[k[j]][lastidx] = null;
                }
            }
        }
    });
}

// we need queue of requests to rxclass to prevent more than 100 per second
var requestQueue = [];
var requestQueuePromises = [];
var requestQueueDone = jQuery.Deferred(); // this promise will be resolved if the queue is empty
function startQueue() {
    if (requestQueue.length == 0) {
        // finish the promise
        requestQueueDone.resolve(); // indicate that we are done
        return; // don't call timeout again
    }
    // run this one call
    medNumber = requestQueue[0]['medNumber'];
    medName = requestQueue[0]['medName'];
    num = requestQueue[0]['num'];
    var promise = ((function(medNumber, medName, num) {
        return jQuery.getJSON('https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui?rxcui='+medNumber+'&relaSource=ATC', function(data) {
            jQuery('.spinner-text').html("retrieve class by rxcui: " + medNumber + " (" + requestQueue.length + ")");
            data['ABCDNum'] = num;
            data['MedName'] = medName;
            if (medNumber == 'NA') {
                console.log("bla");
            }
            classesForDrugs[medNumber] = data;
            if (typeof(Storage) !== "undefined") { // keep this around for later
		try {
                    window.localStorage.setItem("medNumber_" + medNumber, LZString.compress(JSON.stringify(data)));
		} catch (e) {
		    // we will fill up the localStorage with ABCD, in that case don't try to store but continue to load the data
		}
            }
            return true;
        });
    })(medNumber, medName, num));
    jQuery.when(promise).then(function() {
        // remove this entry and start again with the next one after some timeout
        var not_needed_anymore = requestQueue.shift();
        // do we have the next request item in the cache?
        if (typeof(Storage) !== "undefined") {
            checkNext = true;
            while (checkNext && requestQueue.length > 0) {
                if (typeof requestQueue[0]['medNumber'] == 'undefined')
                    continue; // the deferred promise
                medNumber = requestQueue[0]['medNumber'];
                var data = LZString.decompress(window.localStorage.getItem("medNumber_" + medNumber));
                if (typeof data !== 'undefined' && data != "" && data !== null) {
                    classesForDrugs[medNumber] = JSON.parse(data);
                    not_needed_anymore = requestQueue.shift();
                } else {
                    checkNext = false;
                }
            }
        }
        
        setTimeout(function() {
            startQueue();
        }, 20); // time limiter for request
    });
}

var allMeds = {};
var tree = [];
var vals = {};
var pGUIDsPerMed = {};
var listOfAllclassIds = {};
var result = {}; // stores the tree with children nodes

function pullRXNORM() {
    
    jQuery('.spinner-text').html("update RxNorm cache...");
    var meds = Object.keys(allMeds);
    var allMeds2 = {}; // speedup lookup by creating hash
    requestQueueDone = jQuery.Deferred();
    var promises = [ requestQueueDone ];
    // we need to use our queue here to stop spamming the service
    for (var i = 0; i < meds.length; i++) {
        var medNumber = meds[i].split(" ")[0];
        var medName   = meds[i].split(" ").splice(1).join(" ");
        var num = allMeds[meds[i]];
        // now lookup the category for this medication
        allMeds2[medNumber] = { 'name': medName, 'num': num };
        requestQueue.push({ 'medNumber': medNumber, 'num': num, 'medName': medName });
    }
    startQueue(); // will run one pull at a time from rxclass and wait for it to finish before the next call
    
    // lets ask for the whole graph of 0 as well
    promises.push((function(classid) {
        return jQuery.getJSON('https://rxnav.nlm.nih.gov/REST/rxclass/classTree.json?classId=' + classid, function(data) {
            tree = data;
            return true;
        }).fail(function(a) {
	    console.log("pulling one class id failed!");
	});
    })(0));
    
    var ancestorGraphs = {};
    var classStrings = {};
    var notInHierarchy = {};
    jQuery.when.apply(jQuery, promises).then(function() {
        // what are all the classes that are in the tree 0?
        listOfAllclassIds = {};
        function getAllClassIds( tree ) {
            if (typeof tree['rxclassMinConceptItem'] !== 'undefined') {
                listOfAllclassIds[tree['rxclassMinConceptItem']['classId']] = tree['rxclassMinConceptItem']; // not a copy!
            }
            if (typeof tree['rxclassTree'] !== 'undefined') {
                // down the hole
                for (var i = 0; i < tree['rxclassTree'].length; i++) {
                    getAllClassIds( tree['rxclassTree'][i] );
                }
            }
            return;
        }
        getAllClassIds( tree ); // put all the different existing classIds into one associative array
        jQuery('.spinner-text').html("class IDs done...");
        
        // ok, should have now the drug classes in classesForDrugs
        var keys = Object.keys(classesForDrugs);
        var promises = [];
        for (var i = 0; i < keys.length; i++) {
            var drugClassArray = classesForDrugs[keys[i]];
            var ABCDNum = -1;
            if (typeof classesForDrugs[keys[i]]['ABCDNum'] !== 'undefined')
                ABCDNum = classesForDrugs[keys[i]]['ABCDNum'];
            if (typeof drugClassArray['rxclassDrugInfoList'] === 'undefined') {
                if (typeof notInHierarchy[keys[i]] === 'undefined')
                    notInHierarchy[keys[i]] = classesForDrugs[keys[i]]['ABCDNum'];
                else
                    notInHierarchy[keys[i]] += classesForDrugs[keys[i]]['ABCDNum'];             
                continue;
            }
            if (typeof drugClassArray['rxclassDrugInfoList']['rxclassDrugInfo'] === 'undefined') {
                if (typeof notInHierarchy[keys[i]] === 'undefined')
                    notInHierarchy[keys[i]] = classesForDrugs[keys[i]]['ABCDNum'];
                else
                    notInHierarchy[keys[i]] += classesForDrugs[keys[i]]['ABCDNum'];             
                continue;
            }
            drugClassArray = drugClassArray['rxclassDrugInfoList']['rxclassDrugInfo'];
            foundDrug = false;
            // does this ever work????
            for ( var j = 0; j < drugClassArray.length; j++) { // this array can contain the same classId several times - we only want to add to one of them
                var concept = drugClassArray[j]['minConcept'];
                var cl = drugClassArray[j]['rxclassMinConceptItem'];
                if (concept['rxcui'] !== keys[i])
                    continue; // reject concept that does not have our rxcui

                // instead of the tree just check if the classId is in the tree
                if (typeof listOfAllclassIds[cl['classId']] !== 'undefined') {
                    // ok, this class Id is in the tree, store the number of medications found here
                    if (typeof listOfAllclassIds[cl['classId']]['ABCDNum'] !== 'undefined') {
                        listOfAllclassIds[cl['classId']]['ABCDNum'] += ABCDNum;
                        foundDrug = true;
                    } else {
                        listOfAllclassIds[cl['classId']]['ABCDNum'] = ABCDNum;
                        foundDrug = true;
                    }
                    break; // only use the first concept, otherwise we would count ABCDNum several times
                }
            }
            // we could have multiple classes related to this drug, instead of selecting the first we should allow the user
            // to select alternatives
            if (foundDrug == false) { // this always seems to work
                //console.log("did not find the rxui " + cl['classId'] + ", add first class");
                // lets find alternative classes
                var alternates = [];
                for (var j = 0; j < drugClassArray.length; j++) {
                    var cl = drugClassArray[j]['rxclassMinConceptItem'];
                    if (alternates.indexOf(cl['classId']) == -1)
                        alternates.push(cl['classId']);
                }
                if (alternates.length == 1) {
                    // does not make sense to show
                    alternates = [];
                }
                
                // just add it to the first class
                var concept = drugClassArray[0]['minConcept'];
                var cl = drugClassArray[0]['rxclassMinConceptItem'];
                if (typeof listOfAllclassIds[cl['classId']] !== 'undefined') {
                    if (typeof listOfAllclassIds[cl['classId']]['ABCDNum'] == 'undefined') {
                        listOfAllclassIds[cl['classId']]['ABCDNum'] = ABCDNum;
                    } else {
                        listOfAllclassIds[cl['classId']]['ABCDNum'] += ABCDNum;
                    }
                    if (typeof listOfAllclassIds[cl['classId']]['children'] == 'undefined') {
                        listOfAllclassIds[cl['classId']]['children'] = [];
                    }
                    // keep track of the drug that caused this entry, should we look for pGUID as well? could be done by adding key to drugClassArray
                    listOfAllclassIds[cl['classId']]['children'].push({ "name": keys[i] + " " + classesForDrugs[keys[i]]['MedName'],
                                                                        'ABCDNum': ABCDNum, 'rxcui': classesForDrugs[keys[i]]['userInput']['rxcui'],
                                                                        "children": [], "alternates": alternates });
                }
            }
        }
        // now we think that the tree contains all the numbers, we need to move them up the tree to the root
        function moveABCDNumUp( tree ) {
            var sumBelow = 0;
            if (typeof tree['rxclassMinConceptItem'] !== 'undefined') {
                if (typeof tree['rxclassMinConceptItem']['ABCDNum'] !== 'undefined')
                    return /* sumBelow = */ tree['rxclassMinConceptItem']['ABCDNum'];
            }
            if (typeof tree['rxclassTree'] !== 'undefined') {
                // down the hole
                for (var i = 0; i < tree['rxclassTree'].length; i++) {
                    sb = moveABCDNumUp( tree['rxclassTree'][i] );
                    sumBelow += sb;
                }
                if (typeof tree['rxclassMinConceptItem'] !== 'undefined')
                    tree['rxclassMinConceptItem']['ABCDNum'] = sumBelow;
            }
            return sumBelow;
        }
        moveABCDNumUp(tree);
        jQuery('.spinner-text').html("Build tree...");
        
        // now we are ready to look at tree and create the children graph from it
        result = { "name": "Medications", "children": [] }; // use global variable
        function createChildren( tree, result ) {
            // delete all the branches that are empty
            var newChild = { "name": "something", "ABCDNum": -1, "children": [] };
            if (typeof tree['rxclassMinConceptItem'] !== 'undefined') {
                if (typeof tree['rxclassMinConceptItem']['ABCDNum'] !== 'undefined') {
                    // add to result
                    newChild['ABCDNum'] = tree['rxclassMinConceptItem']['ABCDNum'];
                    newChild['name']    = tree['rxclassMinConceptItem']['className'];
                    newChild['classId']  = tree['rxclassMinConceptItem']['classId'];
                    // there might be a child here already
                    if (typeof tree['rxclassMinConceptItem']['children'] !== 'undefined') {
                        newChild['children'] = tree['rxclassMinConceptItem']['children'];
                        for (var i = 0; i < newChild['children'].length; i++) {
                            newChild['children'][i]['mark'] = 'drug';
                        }
                    }                    
                    result['children'].push( newChild );
                }
            }
            if (typeof tree['rxclassTree'] !== 'undefined') {
                // down the hole
                for (var i = 0; i < tree['rxclassTree'].length; i++) {
                    var branch = tree['rxclassTree'][i];
                    if (typeof branch['rxclassMinConceptItem'] !== 'undefined') {
                        if (typeof branch['rxclassMinConceptItem']['ABCDNum'] !== 'undefined') {
                            if (branch['rxclassMinConceptItem']['ABCDNum'] > 0) {
                                // only go down this path if the ABCDNum is larger than 0
                                createChildren( tree['rxclassTree'][i], newChild );
                            }
                        }
                    }
                }
            }
        }
        createChildren( tree['rxclassTree'][0], result );
        // add the vitamins/supplements in
        var total = 0;
        var childs = [];
        for(var key in notInHierarchy) {
            total += notInHierarchy[key];
            childs.push({ 'name': classesForDrugs[key]['userInput']['rxcui'] + " " + classesForDrugs[key]['MedName'],
                          "ABCDNum": notInHierarchy[key], 'rxcui': classesForDrugs[key]['userInput']['rxcui'],
                          'mark': 'no-drug' });
        }
        result['children'].push({ 'name': 'Not a drug', "ABCDNum": total, "children": childs });
        console.log("we got " + total + " non-drug medications");

        // lets add the participants ids into the tree at the leave nodes, use allMeasures and filter for the entries that have values, create
        // an array of all the pGUIDs that have a value
        pGUIDsPerMed = {};
        var ks = Object.keys(allMeasures).filter(function(a) { if (a !== "src_subject_id" && a !== "eventname") return true; return false; });
        for (var i = 0; i < ks.length; i++) { // for each measure create an array of pGUIDs that have that medication listed
            allMeasures[ks[i]].map(function(v,i) {
                if (v !== "" && v !== null) {
                    // store src_subject_id and eventname
                    if (typeof pGUIDsPerMed[v] == 'undefined') {
                        pGUIDsPerMed[v] = [];
                    }
                    var found = false;
                    var subj = allMeasures['src_subject_id'][i];
                    var event = allMeasures['eventname'][i];
                    for (var j = 0; j < pGUIDsPerMed[v].length; j++) {
                        if (pGUIDsPerMed[v][j][0] == subj && pGUIDsPerMed[v][j][1] == event) {
                            found = true;
                            pGUIDsPerMed[v][j][2] = pGUIDsPerMed[v][j][2] + 1; // remember that we have this one again, not used for now
                            break;
                        }                        
                    }
                    if (!found) {
                        // we will have a src_subject_id, eventname, and number of occurances
                        pGUIDsPerMed[v].push( [ allMeasures['src_subject_id'][i], allMeasures['eventname'][i], 1 ] );
                    }
                }
            });
        }
        // now walk through the whole tree and see if any of the nodes is a leave in our array list
        // var ks2 = Object.keys(pGUIDsPerMed);

        // add to search field
        var searchOptionCache = [];
        function addSearchOptions(node) {
            if (typeof node['name'] == 'undefined')
                return;
            // we can do this only if we have a true drug the drug classes don't have a number
            var n = "";
            if (typeof node['mark'] == 'undefined') {
                n = node['name'];
            } else {
                n = node['name'].split(" ").splice(1).join(" ");
            }
            
            if (searchOptionCache.indexOf(n) == -1) {
                jQuery('#select-search-select').append('<option value="'+ n + '" num="' + node['ABCDNum'] + '">' + n + '</option>');
                searchOptionCache.push(n);
            }
            if (typeof node.children == 'undefined')
                return; 
            for (var i = 0; i < node.children.length; i++) {
                addSearchOptions(node.children[i]);
            }
        }
        jQuery('#select-search-select option').remove();
        addSearchOptions( result );
        var selectList = jQuery('#select-search-select option');
        selectList.sort(function(a,b) {
            var x = jQuery(a).attr('num');
            if (typeof x == 'undefined')
                x = 0;
            var y = jQuery(b).attr('num');
            if (typeof y == 'undefined')
                y = 0;
            
            return y - x;
        });
        jQuery('#select-search-select').html(selectList);
        jQuery('#select-search-select').trigger('change');

        //jQuery(".select2-selection__arrow").children().remove().append("<span class='caret'></span>");
//            .addClass("material-icons")
 //           .html("arrow_drop_down");

        // we should calculate here the alternative ABCDNum - the number of children that have reported this drug
        // add add that number to result
        addNumPGUIDs( result );
        
        // now display result using dnTree
        jQuery('.spinner-text').html("Render...");
        drawMedicationTree( result );
        jQuery('.loading').hide();
    });
}

function addNumPGUIDs ( n ) {
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
        n['ABCDNum2'] = Object.keys(r).length;
        return r;
    }
    var result = {};
    for (var i = 0; i < n['children'].length; i++) {
        var res = addNumPGUIDs(n['children'][i]);
        n['children'][i]['ABCDNum2'] = Object.keys(res).length;
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
    n['ABCDNum2'] = Object.keys(result).length;
    return result;
}

function getPGUIDEvent( n ) {
    // return all pGUIDs in a dictionary that have taken a drug at this level
    // also return the event name
    if (typeof n['children'] == 'undefined' || n['children'].length == 0) {
        var r = { 'src_subject_id': [], 'eventname': [], 'count': [] };
        if (typeof pGUIDsPerMed[n['name']] !== 'undefined') {
            return pGUIDsPerMed[n['name']].reduce(function(map, obj) {
                var m = obj[0];
                var event = obj[1];
                var num = obj[2];
                var found = false;
                for (var i = 0; i < map['src_subject_id'].length; i++) {
                    if (map['src_subject_id'] == m && map['eventname'] == event) {
                        found = true;
                        map['count'][i]++;
                        break;
                    }
                }
                if (!found) {
                    map['src_subject_id'].push(m);
                    map['eventname'].push(event);
                    map['count'].push(1);
                }
                return map;
            }, r);
        }
        return r;
    }
    var result = { 'src_subject_id': [], 'eventname': [], 'count': [] };
    for (var i = 0; i < n['children'].length; i++) {
        var res = getPGUIDEvent(n['children'][i]);
        // merge with result
        for (var j = 0; j < res['src_subject_id'].length; j++) {
            var m = res['src_subject_id'][j];
            var event = res['eventname'][j];
            var count = res['count'][j];
            var found = false;
            for (var k = 0; k < result['src_subject_id'].length; k++) {
                if (result['src_subject_id'][k] == m && result['eventname'][k] == event) {
                    found = true;
                    result['count'][k]++;
                }
            }
            if (!found) {
                result['src_subject_id'].push(m);
                result['eventname'].push(event);
                result['count'].push(1);
            }                
        }
    }
    return result;
}


function init( s ) {
    if (typeof s == 'undefined')
        s = 'Parent';

    allMeds = {};
    tree = [];
    vals = {};
    classesForDrugs = {};
    
    jQuery("#tree-container").children().remove();
    // also clear out the allMeasures
    var ks = Object.keys(allMeasures);
    for (var i = 0; i < ks.length; i++) {
        if (ks[i] == "src_subject_id" || ks[i] == "eventname")
            continue;
        delete allMeasures[ks[i]];
    }
    
    // what set of measures?
    jQuery('.loading').show();
    jQuery('.spinner-text').html("Start collecting measures...");
    
    // lets pull measures for this project
    //measures = Array.apply(null, Array(14)).map(function(x,i) { return "pls1_med" + (i+1) + "_rxnorm"; });
    //measures2 = Array.apply(null, Array(14)).map(function(x,i) { return "med_otc_" + (i+1) + "_rxnorm_p"; });

    // everything with rxnorm in the element name
    var aM = {
        "Parent":  [
            "devhx_8_rxnorm_med2_p",         "devhx_8_rxnorm_med3_p",
            "devhx_9_med1_rxnorm_p",         "devhx_9_med2_rxnorm_p",
            "devhx_9_med2_rxnorm_dk_p",      "devhx_9_med3_rxnorm_p",
            "devhx_9_med4_rxnorm_p",         "devhx_9_med5_rxnorm_p"
        ],
        "Child": [
            "su_pls1_med1_rxnorm",           "su_pls1_med2_rxnorm",
            "su_pls1_med3_rxnorm",           "su_pls1_med4_rxnorm",
            "su_pls1_med5_rxnorm",           "su_pls2_med1_rxnorm",
            "su_pls2_med2_rxnorm",           "su_pls2_med3_rxnorm",
            "su_pls2_med4_rxnorm",           "su_pls2_med5_rxnorm",
            "su_pls2_med6_rxnorm",           "devhx_8_rxnorm_med1_p",                   
            "medinv_plus_rxnorm_med1_p",     "medinv_plus_rxnorm_med2_p",
            "medinv_plus_rxnorm_med3_p",     "medinv_plus_rxnorm_med4_p",
            "medinv_plus_rxnorm_med5_p",     "medinv_plus_rxnorm_med6_p",
            "medinv_plus_rxnorm_med7_p",     "medinv_plus_rxnorm_med8_p",
            "medinv_plus_rxnorm_med9_p",     "medinv_plus_rxnorm_med10_p",
            "medinv_plus_rxnorm_med11_p",    "medinv_plus_rxnorm_med12_p",
            "medinv_plus_otc_med1_rxnorm_p", "medinv_plus_otc_med2_rxnorm_p",
            "medinv_plus_otc_med3_rxnorm_p", "medinv_plus_otc_med4_rxnorm_p",
            "medinv_plus_otc_med5_rxnorm_p", "medinv_plus_otc_med6_rxnorm_p",
            "medinv_plus_otc_med7_rxnorm_p", "su_pls2_med1_rxnorm_p",
            "su_pls2_med2_rxnorm_p",         "su_pls2_med3_rxnorm_p",
            "su_pls2_med4_rxnorm_p",         "su_pls2_med5_rxnorm_p",
            "su_pls3_med1_rxnorm_p",         "su_pls3_med2_rxnorm_p"
        ]
    };
    measures = aM[s];
    
    //measures = [  "su_pls1_med1_rxnorm" ];
    measures2 = [];
    
    var promises = [];
    for (var i = 0; i < measures.length; i++) {
        promises.push(addOneMeasure(measures[i]));
    }
    for (var i = 0; i < measures2.length; i++) {
        promises.push(addOneMeasure(measures2[i]));
    }
    jQuery.when.apply(jQuery, promises).then(function() {
        console.log('ok, done with pulling measures');
        // what is the list of all medications?
        var meas = Object.keys(allMeasures);
        for (var i = 0; i < meas.length; i++) {
            if (meas[i] == "src_subject_id" || meas[i] == "eventname") {
                continue;
            }
	    if (typeof allMeasures[meas[i]] == 'undefined' || allMeasures[meas[i]] == null) {
                console.log("error in reading " + meas[i] + " data in cache...");
                continue;
            }
            for (var j = 0; j < allMeasures[meas[i]].length; j++) {
                if (allMeasures[meas[i]][j] == "" || allMeasures[meas[i]][j] == "NA" || allMeasures[meas[i]][j] == "Don't know")
                    continue;
                if (typeof allMeds[allMeasures[meas[i]][j]] === 'undefined')
                    allMeds[allMeasures[meas[i]][j]] = 1;
                else
                    allMeds[allMeasures[meas[i]][j]]++;             
            }
        }
        console.log("found " + Object.keys(allMeds).length + " different medications.");
        
        // now calculate the correct data representation
        pullRXNORM();
    });    
}

function getAllFilters(default_value) {
    jQuery.getJSON('/applications/Filter/getFilter.php', function(data) {
        filters = data;
        jQuery('#existingFilters').children().remove();

        // add the null filter first
        for (var i = 0; i < filters.length; i++) {
            var optGrp = document.createElement('optgroup');
            jQuery(optGrp).attr('label', filters[i]["name"]);
            jQuery('#existingFilters').append(optGrp);
            for (var j = 0; j < filters[i]["rules"].length; j++) {
                var mdcode = hex_md5(project_name + filters[i]["rules"][j]["func"].replace(/\s/g,'') + "YES").slice(-4);
                jQuery(optGrp).append('<option value = "'+ '/var/www/html/data/ABCD/Filter/data/filterSets_'+project_name +'_'+ mdcode+'.json">' + filters[i]["rules"][j]["name"] + '</option>');
            }
        }
        jQuery('#existingFilters').val(default_value);
        jQuery('#existingFilters').select2({placeholder: "Filter participants",  allowClear: true });
        // not needed to save speed
        // jQuery('#existingFilters').val('/var/www/html/data/ABCD/Filter/data/filterSets_ABCD_3fb4.json').trigger('change')        
    });
}


jQuery(document).ready(function() {
    jQuery('.project_name').text(project_name);
    jQuery('#select-search-select').select2({
        theme: "material"
    });

    // populate filter drop-down
    getAllFilters("All");

    jQuery('#existingParticipants').on('change', function() {
        var nv = jQuery(this).val();
        
    });
    
    jQuery('#create-new-score-button').on('click', function() {
        // announce this as a new variable in DEAP (use the Scores/getScores.php script)
        var vname_orig = jQuery('#select-search-select option:selected').attr('value');
        var data = { 'src_subject_id': [], 'eventname': [] };
        // create this information given the currently selected node
        // first find the location in the tree
        function findNodesInTree( name, tree ) {
            if (tree['name'] == name) {
                return [ tree ];
            }
            if (typeof tree['children'] == 'undefined' || tree['children'].length == 0)
                return [];
            var nodes = [];
            for (var i = 0; i < tree['children'].length; i++) {
                var node = findNodesInTree(name, tree['children'][i]);
                if (node.length > 0) {
                    for (var j = 0; j < node.length; j++) {
                        nodes.push(node[j]);
                    }
                }
            }
            return nodes;
        }
        var nodes = findNodesInTree( vname_orig, result );

        if (nodes.length == 0) {
            console.log("error");
            return;
        }
        var data = getPGUIDEvent( nodes[0] );
        // ok, that data contains all the pGUID and events that have this medication, set them to value = 1/use
        data[vname_orig] = [];
        for (var i = 0; i < data['src_subject_id'].length; i++) {
            data[vname_orig].push("use");
        }
        // add the other participants with a value of 0/no-use (but only for events that have been returned)
        var eventList = {};
        eventList = data['eventname'].reduce( function (eventlist, a) { eventList[a] = 1; return eventList; } );
        eventList = Object.keys(eventList);
        for (var i = 0; i < eventList.length; i++) {
            var event = eventList[i];
            for (var j = 0; j < allMeasures['src_subject_id'].length; j++) {
                // make sure we have all these subjects
                var m = allMeasures['src_subject_id'][j];
                // check if we have this m, event already
                var found = false;
                for (var k = 0; k < data['src_subject_id'].length; k++) {
                    if (data['src_subject_id'][k] == m && data['eventname'][k] == event) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    // add this entry
                    data['src_subject_id'].push( m );
                    data['eventname'].push( event );
                    data[vname_orig].push( "no-use" );
                }
            }
        }
        
        // sanitize the name
        vname = "meduse_" + vname_orig.toLowerCase().replace(/ /g, "_").replace(/[^a-z_]+/g, '');
        temp  = {};
        temp["name"]        = vname;
        temp["description"] = "Medication category: " + vname_orig;
        temp["permission"]  = "private";
        temp["content"]     = "<p>This score has been created using the medUse application. To edit this score " +
                                             "open the <a href='/applications/medications/'>medUse</a> application.</p>";
        if (typeof nodes[0]['classId'] !== 'undefined') {
            temp["content"] = temp['content'] + "<p>The score has been derived from the ATC classification <i>" + nodes[0]['name'] + "</i> (" + nodes[0]['classId'] + ") and codes all participants with \"use\" that have at least one reported medication use in this category and \"no-use\" otherwise.</p>";
        }
        if (typeof nodes[0]['rxcui'] !== 'undefined') {
            temp["content"] = temp['content'] + "<p>The score has been derived from the RxNorm classification <i>" + nodes[0]['name'] + "</i> (" + nodes[0]['rxcui'] + ") and codes all participants with \"use\" that have at least one reported medication use in this category and \"no-use\" otherwise.</p>";
        }
        temp["content"] = JSON.stringify(temp["content"]);
        
        temp["action"]      = "save";
        temp_data = { "src_subject_id": data["src_subject_id"],
                      "eventname": data["eventname"]
                    };
        temp_data[vname] = data[vname_orig];
        // temp_data[vname] = data[vname]
        temp["data"]        = JSON.stringify(temp_data);
        temp["source"] = "medications" // an indicator for stop score calculation.

        jQuery.post("/applications/Scores/getScores.php",temp).done(function(data) {
            alert("Score has been created.");
            console.log(data);
        });        
    });
    
    jQuery('.control-down').on('click', function() {
        // this might not work in every browser!
        var e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, keyCode: 40, which: 40, key : 40, char : 40, shiftKey : false});
        d3.select('body').node().dispatchEvent(e);        
    });
    
    jQuery('.control-up').on('click', function() {
        var e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, keyCode: 38, which: 38, key : 38, char : 38, shiftKey : false});
        d3.select('body').node().dispatchEvent(e);
    });

    jQuery('.control-left').on('click', function() {
        var e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, keyCode: 37, which: 37, key : 37, char : 37, shiftKey : false});
        d3.select('body').node().dispatchEvent(e);
    });
    
    jQuery('.control-right').on('click', function() {
        var e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, keyCode: 39, which: 39, key : 39, char : 39, shiftKey : false});
        d3.select('body').node().dispatchEvent(e);
    });
        
    jQuery('#select-medication-group a').on('click', function() {
        // switch to this medication group instead
        var key = jQuery(this).attr('value');
        init(key);
        jQuery('#select-medication-group a').removeClass('active');
        jQuery(this).addClass('active');
        jQuery('#group-indicator').html(key);
    });

    init('Child');
    jQuery('#group-indicator').html('Child');    
});
