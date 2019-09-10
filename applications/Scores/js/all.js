var DataFrame = dfjs.DataFrame;
var data = null;
var disableLocalStorage = false;
var upload_spreadsheet_obj = {};

var temp_dict = null
/*
    $('input[type="file"]').click(function(e){
    })
    */
$('input[type="file"]').change(function(e){
  $(".code-output").remove()
  $('.card-option-upload-spreadsheet .card-title').append('<div class="lds-ring load-part"><div></div><div></div><div></div><div></div></div>')

  var file = e.target.files[0];
  //magic number need to be changed 
  var default_rows = 27369
  if (file) {
    var fileName = e.target.files[0].name;
    $.get( "../../data/ABCD/data_uncorrected/ABCD_datadictionary01.csv", function( data_dict ) {
      $.get("../../data/ABCD/Scores/Template.csv", function(data_template){
        temp_dict = data_template
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
          parsed_file =  evt.target.result.split("\n").map(CSVtoArray)

	  try{
	  // correrct the data format as non-catagorical if the distinct value more than 10
	  var new_variable_list = parsed_file[0].slice(2);
	  var distinct_dict = {};
	  var MAX_LENGTH_CATA = 10;
	  for(let it_var = 0; it_var < new_variable_list.length; it_var++){
	      var real_id = it_var + 2;
	      var var_name_temp = new_variable_list[real_id];
	      if(!distinct_dict[var_name_temp]){
	   	distinct_dict[var_name_temp] = new Set([]);
	      }
	      for(var it_row = 1; it_row < parsed_file.length; it_row++){
	      	distinct_dict[var_name_temp].add(parsed_file[it_row][real_id]);
	      }
	      if(distinct_dict[var_name_temp].size > MAX_LENGTH_CATA){
	      	for(var it_row = 1; it_row < parsed_file.length; it_row++){
                  parsed_file[it_row][real_id] = parsed_file[it_row][real_id] == "" ? NaN : parseFloat(parsed_file[it_row][real_id]); 
                }
	      }	
	  }
	  } catch (error) {
	     console.log(error);
	  }	
          if(parsed_file[parsed_file.length -1].length == 0){
            parsed_file.splice(-1,1)
          }
          variables = parsed_file[0];
          number_of_rows = parsed_file.length;
          index_of_rows = parsed_file.map(function(a,b){if(a!= "") return "\""+ a[0]+"\",\""+a[1]+"\""})
            


          console.log(parsed_file[0]);

          content = "Uploaded a "+(number_of_rows )+ " x " 
            +(variables.length)+ " spreadsheet. <br>"

          if( !(variables.indexOf("src_subject_id") >= 0 && variables.indexOf("eventname") >= 0)){
            content += "<div style='color:red'> [ERROR] Missing primary keys: <code>src_subject_id</code> and <code>eventname</code> </div>"
          }
          if( number_of_rows != default_rows){
            content += "<div style='color:red'> [ERROR] Particiapnts record number does not match. Number of rows must be "+ default_rows +". </div>"
          } 


          apd = "";
          apd_num = 0;
          original_exist = ""
          original_exist_num = 0;
          new_row = ""
          for(item in variables ){
            if(variables[item] != "src_subject_id" && variables[item] != "eventname"){
              if(data_dict.indexOf("\n\""+variables[item]+"\",") >= 0){
                console.log("check1")
                original_exist += (original_exist== ""? "" : ", ")+variables[item]
                original_exist_num++
              } else{
                apd += (apd == ""? "" : ", ")+variables[item]
                apd_num++
              }
            }     
          }

          for(item in index_of_rows){
            if(!(temp_dict.indexOf(index_of_rows[item])>=0)){
                new_row = "[ERROR] " + index_of_rows[item] + " does not exist in the database. New row added.\n"
                break
            }
          }
          // original variables detected 
          if(original_exist != ""){
            content += "<div style='color:red'> [ERROR] "+ original_exist_num +" Overlapping columns existed in database: <code style='color:black;max-height:150px'>"+( original_exist.length > 150 ? original_exist.substring(0, 150)+"......" : original_exist) +"</code></div>"
          }
          // new variables detected
          if(apd == ""){
            content += "<div style='color:red'> [ERROR] Missing new columns. </div>"
          } else {
            content += "<div style='color:green'>"+apd_num+" New columns detected: <code style='color:black; max-height:150px'>"+( apd.length > 150 ? apd.substring(0, 150)+"......": apd)+"</code></div>"
          }
          if(new_row !=""){
            content += "<div style='color:red'>" + new_row +"</div>"
          }

          if(content.indexOf("ERROR") < 0){
            upload_spreadsheet_obj = {}
            for( row = 1 ; row < parsed_file.length; row++){
              for(item in variables){
                if(!upload_spreadsheet_obj[variables[item]])
                  upload_spreadsheet_obj[variables[item]] = [];
                upload_spreadsheet_obj[variables[item]].push(parsed_file[row][item]);
              }

            }
            content += "<div style='color:green'> Upload successful! Ready to add. </div>"
          }else{
            content += "<div style='color:red'> Please fix ERRORs above and try again. </div>"
          }
          $new = $("<div class = 'code-output' style = 'display:none;'>"+content+"</div>");
          $(".card-list").append($new.show('fast'));
          $(".load-part").remove();
        }
        reader.onerror = function (evt) {
          console.log("error reading file");
        }
      })
    });
  }


  $('.custom-file-label').html(fileName);
});

$('.card').click(function(){
  $('.card').removeClass("text-white").removeClass("bg-primary");
  $(this).toggleClass("text-white").toggleClass("bg-primary");
});

$("#uploading-form").submit(function (event) {
  event.preventDefault();

  /*
      $.ajax({
        url: 'add_spreadsheet.php',
        type: 'POST',
        data: formData,
        //async: false,
        cache: false,
        contentType: false,
        processData: false,
        success: function (returndata) {
        $("#productFormOutput").html(returndata);
        alert(formData);
        },
        error: function(){
            alert("error in ajax form submission");
        }
      });
      */
        return false;
      }); 
function CSVtoArray(text) {
  var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
  var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
  // Return NULL if input string is not well formed CSV string.
  if (!re_valid.test(text)) return null;
  var a = [];                     // Initialize array to receive values.
  text.replace(re_value, // "Walk" the string using replace with callback.
    function(m0, m1, m2, m3) {
      // Remove backslash from \' in single quoted values.
      if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
      // Remove backslash from \" in double quoted values.
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
      else if (m3 !== undefined) a.push(m3);
      return ''; // Return empty string.
    });
  // Handle special case of empty last value.
  if (/,\s*$/.test(text)) a.push('');
  return a;
};
// use data as a dataframe
MathJax.Hub.Config({
  tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
});
var QUEUE = MathJax.Hub.queue;

function customMarkdownParser( text) {
  return text;
}

// pull a new variable into the current workspace
function use(v) {
  var promisses = [];
  if (v.constructor !== Array) {
    v = [v];
  }
  // get list of real variables (if v contains a string, use that as the variable name, if it contains a regular expression, match and get a list of all matching items)
  var itemsToUse = matchInArray(analysis_names, v);
  if (itemsToUse.length > 100) {
    alert("Error: One of your use() calls matches more than 100 items in our data dictionary. Please reduce the number of matches.");
    return;
  }

  for ( m in itemsToUse ) {
    var p = addOneMeasure(itemsToUse[m], compute_block_id);
    // lets add an error handler for this promisse
    (function( measure, compute_block_id ) {
      p.then(function(ok) {
        // check if we have the variable now
        if (Object.keys(allMeasures).indexOf(measure) == -1) {
          // this promise did not result in the loaded measure, show error message to user
          var cons = jQuery('#'+compute_block_id).parent().parent().find('.console'); 
          var before = jQuery(cons).html();
          var after = before + "Promise Error: unknown variable <span style='color:blue'>" + measure + "</span><br>";
          jQuery(cons).html(after);
          // stop the loader
          jQuery('#'+compute_block_id).parent().parent().find('.loader').remove();
        }
      });
    })(itemsToUse[m], compute_block_id);
    promisses.push(p);
  }
  // lets add a handler for errors to our promises (copy error messages to screen)

  return promisses;
}

var allMeasures = { "src_subject_id": [], "eventname": [] };
var header = [ "src_subject_id", "eventname" ];
var output_always_list = ["src_subject_id", "eventname"];
var output_vlist = {};
// some variables are not measures (like "M"), only try to pull those once and remember them to be bad
var noMeasureList = ["M", "F"];
var measuresPerBlock = {};
var analysis_names = []
var debug_deffered = null;
loadAnalysisNames();

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


// pull only the data we need (allMeasures as a dictionary of columns)
function addOneMeasure( meas, vname ) {

  if (typeof vname === 'undefined') {
    vname = "no-block";
  }

  console.log("Loading: " + meas);

  jQuery(document.getElementById(vname+'-table')).find(".loader").remove();
  if (jQuery(document.getElementById(vname+'-table')).find(".console").length == 0){
    jQuery(document.getElementById(vname+'-table')).html($("<div class = 'console'></div>"))
  }
  jQuery(document.getElementById(vname+'-table')).find(".console").append("loading variable: <span style='color:blue'>"+ meas +"</span><br>");


  // maybe this measure is already in allMeasures?
  if (Object.keys(allMeasures).indexOf(meas) > -1) {
    if (! (vname  in measuresPerBlock)) {
      measuresPerBlock[vname] = [];
    }
    measuresPerBlock[vname].push(meas);
    return Promise.resolve(); // nothing needs to be done, measure exists already
  }
  if (noMeasureList.indexOf(meas) > -1) {
    return Promise.resolve(); // nothing can be done, its a no-measure
  }

  // maybe this measure can be copied from the localStorage? In that case we don't have to transfer it to the client a second time
  if (storageAvailable('localStorage')) {
    var dataFromStore = localStorage.getItem(meas);
    if (dataFromStore) {
      allMeasures[meas] = JSON.parse(dataFromStore);
      if (! (vname  in measuresPerBlock)) {
        measuresPerBlock[vname] = [];
      }
      measuresPerBlock[vname].push(meas);

      // make sure we have src_subject_id and eventname as well
      if (Object.keys(allMeasures).indexOf('src_subject_id') == -1 || allMeasures['src_subject_id'].length == 0) {
        var dataFromStore = localStorage.getItem('src_subject_id');
        if (dataFromStore) {
          allMeasures['src_subject_id'] = JSON.parse(dataFromStore);
        }            
      }
      if (Object.keys(allMeasures).indexOf('eventname') == -1 || allMeasures['eventname'].length == 0) {
        var dataFromStore = localStorage.getItem('eventname');
        if (dataFromStore) {
          allMeasures['eventname'] = JSON.parse(dataFromStore);
        }
      }
      return Promise.resolve();
    }
  }

  // ask the system to return this measure and add it to allMeasures (if it does not exist already)
  return jQuery.getJSON('/applications/Filter/runR.php', { 'value': meas }, function(data) {
    console.log("compute_block_id in runR is : " + vname + " loading: " + meas);

    // add the current meas to compute_block_id in measuresPerBlock
    if (! (vname  in measuresPerBlock)) {
      measuresPerBlock[vname] = [];
    }
    measuresPerBlock[vname].push(meas);

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
      if (typeof allMeasures['src_subject_id'] !== 'undefined')
        localStorage.setItem('src_subject_id', JSON.stringify(allMeasures['src_subject_id']));
      if (typeof allMeasures['eventname'] !== 'undefined')
        localStorage.setItem('eventname', JSON.stringify(allMeasures['eventname']));
      localStorage.setItem(meas, JSON.stringify(allMeasures[meas]));
    }
  })/*.done(function() {
        console.log( "second success "+meas );
    }).fail(function() {
        console.log( "error" );
    }).always(function() {
        console.log( "complete" );
    })*/;
}

function json_to_table(json,vname){
  if(!vname) return;
  var html = '<div style = "font-size: 0.75em;max-height: 250px;overflow:auto;"><table class="table-sm table table-striped">';
  html += '<thead><tr>';
  var flag = 0;
  //only display 100 rows for checking
  var rows = 100;
  //"src_subject_id", "eventname"
  var keys = Object.keys(json);
  for (var i = keys.length-1; i >= 0; i--) {
    var value = json[keys[i]];
    var index = keys[i];
    if (index == "src_subject_id" || index == "eventname" ||  (typeof measuresPerBlock[vname] !== 'undefined' && measuresPerBlock[vname].indexOf(index) >= 0) || index == vname) {
      html += '<th>'+index+'</th>';
    }
  }
  data = [];


  for (index = 0; index < rows; index++){
    temp = {};
    for (var i = keys.length-1; i >= 0; i--) {
      var k = keys[i];
      // for (keys in json) {
      temp[k] = json[k][index];
    }
    if(!$.isEmptyObject(temp))data.push(temp);
  }
  //numeric variable largetst 5 and smallest 5 includeing null #9 
  temp_json = json;
  temp_json["index"] = Array.apply(null, {length: json[keys[0]].length}).map(Number.call, Number)
  temp_json["index"].sort(function(a,b){
    return temp_json[keys[keys.length-1]][a] > temp_json[keys[keys.length-1]][b] ? 1:-1;
  })
  uniqueItems = Array.from(new Set(temp_json[keys[keys.length-1]]));
  if(uniqueItems.length > 10){
    number_on_top = 5;
    for(index = 0; index < number_on_top || number_on_top>=temp_json["index"].length/2; index++){
      temp = {};
      rel_index = temp_json["index"][index];
      for (var i = keys.length-1; i >= 0; i--) {
        var k = keys[i];
        // for (keys in json) {
        temp[k] = temp_json[k][rel_index];
      }
      if(!$.isEmptyObject(temp))data.push(temp);
    }
    for(index = 0; index < number_on_top || number_on_top>=temp_json["index"].length/2; index++){
      temp = {};
      rel_index = temp_json["index"][temp_json["index"].length - number_on_top + index];
      for (var i = keys.length-1; i >= 0; i--) {
        var k = keys[i];
        // for (keys in json) {
        temp[k] = temp_json[k][rel_index];
      }
      if(!$.isEmptyObject(temp))data.push(temp);
    }
  } else {
    // catagorical cases 
    item_list = []
    for(uniq_item in uniqueItems){
      item_list.push(temp_json[keys[keys.length-1]].indexOf(uniqueItems[uniq_item]));
    }
    for(index = 0; index < item_list.length; index++){
      temp = {};      
      rel_index = item_list[index];
      for (var i = keys.length-1; i >= 0; i--) {
        var k = keys[i];    
        // for (keys in json) {
        temp[k] = temp_json[k][rel_index];
      }               
      if(!$.isEmptyObject(temp))data.push(temp);
    }
  }


  //console.log(data);
  if (data.length == 0)
    return "";  
  html += '</thead></tr><tbody>';
  $.each(data, function(index, value){
    html += '<tr>';
    $.each(value, function(index2, value2) {
      if (index2 == "src_subject_id" || index2 == "eventname" ||
        (typeof measuresPerBlock[vname] !== 'undefined' && measuresPerBlock[vname].indexOf(index2) >= 0) || index2 == vname  ){
        html += '<td>'+value2+'</td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function add_new_recipe() {
  if ($(".card-option-upload-spreadsheet").hasClass("bg-primary")){
    if ($(".code-output").html().indexOf("ERROR")>=0){
      return;
    }
    for (key in upload_spreadsheet_obj){
      if (key != "src_subject_id" && key != "eventname"){
        announce_spreadsheet(key,upload_spreadsheet_obj);
      }
    }
    setTimeout(function(){ location.reload(); }, 5000);
  } else if (jQuery(".card-option-medication-use").hasClass("bg-primary")) {
      // open the medication use browser
      window.open("/applications/medications/", "_medications");

  } else {
    insert_recipe_block( { "user": user_name, "permission": "public" }, true );
  }
}
add_count = 0;
function announce_spreadsheet(vname,data){
  temp = {};
  temp["name"]        = vname;
  temp["description"] = "";
  temp["permission"]  = "private";
  temp["content"] = "Variables extended by spreadsheet upoloading, please provide calculation detail this section.";
  temp["action"]      = "save";
  temp_data = {"src_subject_id": upload_spreadsheet_obj["src_subject_id"], 
    "eventname": upload_spreadsheet_obj["eventname"]};
  temp_data[vname] = data[vname]
  temp["data"]        = JSON.stringify(temp_data);
  temp["source"] = "spreadsheet" // an indicator for stop score calculation. 

  $.post("getScores.php",temp).done(function(data) {
    console.log(data)
  });
}

//save a measure during user code excution
function announce(vname,label,data){
  temp = {};
  temp["name"]        = vname; 
  //temp["description"] = bootstrap_texarea_description.find("input").val();
  temp["description"] = "";
  temp["permission"]  = "public";
  temp["content"]     = "";
  //temp["content"]     = JSON.stringify(simplemde.value());
  temp["action"]      = "save";
  if (data.listColumns().indexOf(vname) > -1) {
    temp["data"]      = data.select("src_subject_id", "eventname", vname).toJSON();
  } else {
    alert("cannot find: " + vname);
    return;
  }
  priv = jQuery(document.getElementById(vname+"-input")).parent().parent().find('.private-public').is(':checked');
  if (priv) {
    temp['permission'] = "private";
  }

  //Missing the scores sit self;
  $.post("getScores.php",temp).done(function(data) {
    console.log(data)
  });

}


function _update(text, table_location, vname, hist_location) {
  'use strict';
  var ar = text.split(/[\#]+/);
  console.log("Excuting code (_update):"+vname); 

  // for each of the sections now evaluate the data
  for (var i = 0; i < ar.length; i++) {
    // find the code
    var code = ar[i].split(/```/g);
    //append code section
    var excute_code = "";
    var co = null;
    var retVal = 0;
    for (var j = 1; j < code.length; j+=2) {
      // parse code[j] to see what variables 
      excute_code = excute_code + code[j] + "\n";
    }
    var data = new DataFrame( allMeasures );
    var namesBefore = new Set(data.listColumns());
    //console.log("found some code here:" + JSON.stringify("compute_block_id = \"" + vname + "\";\n" + code[j]+"\n return data;"));
    // we can execute this code now to fill in the values (pull, compute, push)
    // Question: in co access for data as a 1-level-up variable is not working, must use a return structure, maybe there is a better way?
    try {
      co = new Function('data', "compute_block_id = \"" + vname + "\";\n" + excute_code+"\n return data;");
      console.log("var compute_block_id = \"" + vname + "\";\n" + excute_code+"\n return data;")
      data = co(data);
    } catch (err) {
      if (err instanceof EvalError) {
        alert("EvalError, incorrect syntax in " + execute_code);
      }
      console.log(err);
      console.log(vname);
      jQuery(document.getElementById(vname+'-table')).find(".loader").remove();
      jQuery(document.getElementById(vname+'-hist')).find(".loader").remove();
      jQuery(document.getElementById(vname+'-table')).html("");
      jQuery(document.getElementById(vname+'-hist')).html("");
      if (jQuery(document.getElementById(vname+'-table')).find(".console-warning").length == 0){
        jQuery(document.getElementById(vname+'-table')).append($("<div class = 'console-warning'>"))
      }
      jQuery(document.getElementById(vname+'-table')).find(".console-warning").html("<p style= 'color:red'>"+err+"</p>");
    }
    //Update data
    var difference = new Set(data.listColumns());
    var namesExisted = new Set(namesBefore);
    for (var elem of namesExisted) {
      difference.delete(elem);
    }
    var newVars = [...difference];
    for (var k = 0; k < newVars.length; k++) {
      // add the new variables to measuresPerBlock
      if (!(vname in measuresPerBlock)) {
        measuresPerBlock[vname] = []
      }
      measuresPerBlock[vname].push(newVars[k]);
    }
    console.log("got " + difference.size + " new variables (" + [...difference].join(",")+")");
    // does this evaluation create some variables?
    //console.log("data is now: " + JSON.stringify(data));
  }
  //"src_subject_id", "eventname"

  if (vname!= "" && vname && data.dim()[0] != 0){
    if (data.listColumns().indexOf(vname) > -1){
      var temp_json = JSON.parse(data.select("src_subject_id","eventname",vname).toJSON());
      output_vlist[vname] = temp_json;
    } else {
      return;
    }
  }

  if (table_location.html() != "")
    table_location.height( table_location.height());
  if (hist_location.html() != "")
    hist_location.height( hist_location.height());
  if (data.dim()[0] == 0 )
    return;
  table_location.html("");
  $(json_to_table(JSON.parse(data.toJSON()),vname)).appendTo(table_location);
  hist_location.html(""); // remove the timeout circle animation
  var hist_data = JSON.parse(data.toJSON())[vname];
  if (typeof hist_data === 'undefined')
    hist_location.html("<div class='error'>Warning: element name \"" + vname + "\" is not yet defined by this calculation.</div>");
  else
    histogram(hist_data,hist_location);
  //console.log("we found " + ar.length + " sections");
  //return data;
}

// this function is called by the users code and is supposed to create the variables that have been computed
//
// Problem might be that update cannot easily get the compute_block_id. That global variable might be changed by executing
// blocks in parallel.
//
function update(data, compute_block_id) {
  // find all variables to update this block: compute_block_id
  console.log("UPDATE: Compute_block_id is: " + compute_block_id);
  var vname          = compute_block_id;
  var element_type = jQuery("input[value='"+ vname +"']").attr("element-type")
  var table_location = jQuery(document.getElementById(vname+'-table'));
  var hist_location  = jQuery(document.getElementById(vname+'-hist'));

  if (vname !== "" && vname && (element_type == "" || !element_type)) {
    var temp_json = {};
    if (data.listColumns().indexOf(vname) > -1) {
      try {
        temp_json = JSON.parse(data.select("src_subject_id","eventname",vname).toJSON());
      } catch(e) {
        //if (e instanceof NoSuchColumnError) {
        console.log("GOT no such column error: " + e);
        //} else {
        //    console.log("GOT a different error: " + e);
        //}                
      }
    } else {
      // update?
      alert("(in update) cannot find: " + vname + " in this data, only:  " + data.listColumns().join(", "));
      return;
    }
    output_vlist[vname] = temp_json;
  }
  //In case data source is spreadsheet  

    if (element_type == "spreadsheet") {
        temp = {}
        temp["name"] = vname;
        temp["action"] = "read-spreadsheet";
        $.post("getScores.php",temp).done(function(data_rt) {
            table_location.html("");
            hist_location.html(""); 
            jQuery(json_to_table(JSON.parse(data_rt),vname)).appendTo(table_location);
            
            histogram(JSON.parse(data_rt)[vname].filter(function(item){ return !isNaN(item)}),hist_location);
        }); 
        return; 
    } else if (element_type == "medications") {
        temp = {}
        temp["name"] = vname;
        temp["action"] = "read-spreadsheet";
        $.post("getScores.php",temp).done(function(data_rt) {
            table_location.html("");
            hist_location.html(""); 
            jQuery(json_to_table(JSON.parse(data_rt),vname)).appendTo(table_location);
            
            histogram(JSON.parse(data_rt)[vname].filter(function(item){ return !isNaN(item)}),hist_location);
        });
        return;      
    }
    

  if (table_location.html() != "")
    table_location.height( table_location.height() );
  if (hist_location.html() != "")
    hist_location.height( hist_location.height() );

  table_location.html("");
  jQuery(json_to_table(JSON.parse(data.toJSON()),vname)).appendTo(table_location);
  hist_location.html(""); // remove the timeout circle animation
  var hist_data = JSON.parse(data.toJSON())[vname];
  if (typeof hist_data === 'undefined')
    hist_location.html("<div class='error'>Warning: " + vname + " is not yet defined by this calculation.</div>");
  else
    histogram(hist_data,hist_location);
  // console.log("UPDATE we found " + ar.length + " sections");
  //return data;
}

var wto = {};
function parse( text, table_location, vname, hist_location) {

    if (wto[vname])
        clearTimeout(wto[vname]);
    wto[vname] = setTimeout( function() {
        
        var type = jQuery("input[value='"+ vname +"']").attr("element-type");
        if (type == "spreadsheet"){
            update(null, vname);
        } else if (type == "medications") {
            update(null, vname);
        } else {
            _update(text, table_location, vname, hist_location);
        }
    },3000);

}

function histogram(values, hist_location) {
  if (typeof values == 'undefined') {
    // don't show the circle, show an error message
    return;
  }
  console.log(hist_location.attr("id"))
  var formatCount = d3.format(",.0f");
  var margin = {top: 20, right: 10, bottom: 30, left: 50},
    width = hist_location.width() - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;
  var max = d3.max(values);
  var min = d3.min(values);
  var range = max-min;
  min = min - 0.05 * range;
  max = max + 0.05 * range;
  var x = d3.scale.linear()
    .domain([min, max])
    .range([0, width]);
  var data = d3.layout.histogram()
    .bins(x.ticks(20))
  (values);
  var yMax = d3.max(data, function(d){return d.length});
  var yMin = d3.min(data, function(d){return d.length});
  var y = d3.scale.linear()
    .domain([0, yMax])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
  var svg = d3.select(hist_location.get(0)).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var bar = svg.selectAll(".bar")
    .data(data)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
  bar.append("rect")
    .attr("x", 1)
    .attr("width", (x(data[0].dx) - x(0)) - 1)
    .attr("height", function(d) { return height - y(d.y); })
    .attr("fill", "steelblue");
  /*
    bar.append("text")
             .attr("dy", ".75em")
             .attr("y", -12)
             .attr("x", (x(data[0].dx) - x(0)) / 2)
             .attr("text-anchor", "middle")
             .text(function(d) { return formatCount(d.y); });
             */
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
  //.attr("transform", "translate(0," + height +")")
    .call(yAxis);
}

/*
@input: an object contains title, description, and raw md code
        default input = {"name": "placeholder" , "description": "palcehoder", "content":"md code placeholder"}
        */
/*
   @Fangzhou: In order to add the new item to the Ontology use searchTerm2 and provide a GET variable scoresAdd with a uricomponet encoded json object that contains keys for name, description, notes, and aliases=[].
   */
function insert_recipe_block(input, top) {

    var variable_name = (input["name"]? input["name"] : new Date().getTime());

    // sanitize the input in case its not json
    try {
        JSON.parse(input["content"]);
    } catch(err) {
        // assume its text and convert to JSON so that the next step will work
        input['content'] = JSON.stringify(input["content"]);
    }

  var simplemd_initialize_text = input["content"] && JSON.parse(input["content"]) ? JSON.parse(input["content"]) : "Start by entering a unique name as the Element Name of the score. Only lower-case characters, numbers and underscores are allowed. Add a short axis label suitable for a plot legend.\n### Describe the new item\nWhy should the reader be interested in this new item? Describe your rationale to provide it and explain your sources. Start the computation of the new item by listing required existing items, for example age here:\n```\nvar promises = use([\"age\"]);\n```\n\nAdd the calculation of the new measure in another section delimited by three tick marks:\n```\nPromise.all(promises).then( function() {\n  var data = new DataFrame(allMeasures);\n  data = data.map(row => row.set('age_years', row.get('age')/12));\n  update(data, 'age_years');\n});\n```\n";
  var div = $("<div class='recipe-block' tabindex='0' style = 'position:relative;'></div>");
  var fold_head = jQuery("<div class= 'fold-recipe row'></div>").appendTo(div);
  // if we have a description for this item already, show the description as well
  var descr = "";
  if (typeof input['description'] !== 'undefined') {
    descr = "<div class='header-description'>" +  input['description'].slice(0, 60) + "</div>";
    if (input['description'].length > 60) {
      descr = descr + "...";
    }
  }    
  fold_head.html( (typeof variable_name == "number" ? "New score calculation (unsaved)": "<span style='font-size: 70%;'>[" + input['user'] + "]</span> " + variable_name) + descr );
  if (typeof top !== 'undefined' && top) {
    div.insertAfter("#first-item");
  } else {
    div.appendTo(".container-fluid");
  }
  var header = jQuery('<div class="header row" style="display:none"></div>').appendTo(div);

  var div_input = $("<div class = 'col-lg-4'></div>").appendTo(header);
  var div_table = $("<div class = 'col-lg-4' id = '"+variable_name+"-table"+"'></div>").appendTo(header);
  div_table.append('<div class="loader"></div>');
  var div_hist = $("<div class = 'col-lg-4' id = '"+variable_name+"-hist"+"'></div>").appendTo(header);
  div_hist.append('<div class="loader"></div>');

  //name
  var bootstrap_input_name = $(
    '<div class="mb-3 form-group">'+
    //'<div class="input-group-prepend">'+
    //  '<span class="input-group-text" id="inputGroup-sizing-sm">Name</span>'+
    //'</div>'+
    '<label>Element Name (user ' + input['user'] + " - " + input['permission'] + ' score)</label>' +
    '<input type="text" class="form-control element-name" element-type = "'+(input["source"] ? input["source"] : "")+'" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value = "'+(typeof variable_name == "number"?"":variable_name)+'">'+
    '</div>').appendTo(div_input);
  div_input.find("input").change(function(){
    var value_changed = $(this).val();
    div_table.attr("id", value_changed+"-table"); 
    div_hist.attr("id",  value_changed+"-hist");
  });
  //description
  var bootstrap_texarea_description = $(
    '<div class="mb-3 form-group">'+
    //'<div class="input-group-prepend">'+
    //  '<span class="input-group-text" id="inputGroup-sizing-sm">Axis label&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'+
    //'</div>'+
    '<label>Axis label</label>' + 
    '<input type="text" class="axis-label form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value = "'+input["description"]+'">'+
    '</div>').appendTo(div_input);


  bootstrap_texarea_description.find("input").val(input["description"]);
  //md
  var text_area = $('<textarea></textarea>').attr("id", variable_name );
  var text_area_wrapper = $('<div class="col-md-12" style="display:none;padding-top:10px;border-top: 1px solid #CCC;"></div>').append(text_area).appendTo(div);

  var div_operation = $("<div class = 'col-md-12'></div>").appendTo(div),
    del = $('<i style = "right:5px;top:5px;position:absolute;font-size:30px; margin:5px; color: white; display: none;" class="fas fa-times" title="Delete Score"></i>').appendTo(div),
    maximize = $('<button class="btn btn-sm btn-primary header-button" style="right:45px;top:5px;position:absolute;font-size:30px; margin:5px;">open</button>').appendTo(div);
  save     = $('<button type="button" class="btn btn-primary save-button">Save</button>').appendTo(div_input),
    //checkbox = $('<div class="checkbox pull-right" style="margin-top: 7px;"><label><input type="checkbox" class="private-public" value="private"' + ((input['permission']=="private")?"checked":"") + '> Save as private</label></div>').appendTo(div_input);       

    //initialize md;
    // always ask for age first, that will fill in the participant names
    /*
    (function(){
        setTimeout(function() { parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(),div_hist)},0);       
    })(simplemde,div_table,bootstrap_input_name,div_hist);

    (function(){
        setTimeout(function() { parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(),div_hist)},3000);       
    })(simplemde,div_table,bootstrap_input_name,div_hist);
    */

    /*
    setTimeout((function() {
        parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(), div_hist);
    }),3500);
    */
    save.on("click",function() {
      // visualize the save action
      jQuery(this).removeClass('btn-primary').addClass('btn-success').text('saved');
      setTimeout( function() {
        jQuery('button.save-button').removeClass('btn-success').addClass('btn-primary').text('save');
      }, 1000);

      temp = {};
      temp["name"]        = bootstrap_input_name.find("input").val();
      temp["source"] = bootstrap_input_name.find("input").attr("element-type");
      temp["description"] = bootstrap_texarea_description.find("input").val();
      temp["permission"]  = "public";
      temp["content"]     = JSON.stringify(simplemde.value());
      temp["action"]      = "save";

      if(temp["source"] == "spreadsheet" || temp["source"] == ""){
        temp["data"]        = JSON.stringify(output_vlist[bootstrap_input_name.find("input").val()]);
      }

      priv = jQuery(this).parent().find('.private-public').is(':checked');
      if (priv) {
        temp['permission'] = "private";
      }

      temp_data = {};
      //Missing the scores itself
      (function(self) {
        $.post("getScores.php",temp).done(function(data) {
          // did this fail? If not update the title
          data = JSON.parse(data);
          console.log(JSON.stringify(data));
          var user = jQuery(self).closest("div.recipe-block").find('div.fold-recipe span').text();
          if (user == "") {
            user = "[" + user_name + "] ";
          }
          jQuery(self).closest("div.recipe-block").find('div.fold-recipe').html("<span style='font-size: 70%;'>" + user +"</span> " + temp["name"] + "<div class='header-description'>" + temp['description'] + "</div>");
        });
      })(this);
    });
  del.on("click",function() {
    if (!confirm("Are you sure you want to delete scores calculation for " + bootstrap_input_name.find("input").val() ))
      return;
    temp = {};
    temp["name"] = bootstrap_input_name.find("input").val();
    temp["action"] = "delete";

    //Missing the scores sit self;
    $.post("getScores.php",temp).done(function(data){
      console.log(data);
      div.remove();
    });
  });
  var simplemde = null;
  maximize.on("click", function() {
    if (header.is(":visible")) {
      header.fadeOut();
      text_area_wrapper.fadeOut();
      jQuery(header).parent().find('i.fa-times').hide();
      jQuery(header).parent().find('.header-button').text('open');
    } else {
      header.show();
      jQuery(header).parent().find('i.fa-times').show();
      jQuery(header).parent().find('.header-button').text('close');
      text_area_wrapper.show();
      if (simplemde) {
        div.find(".fold-recipe")[0].scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});  
        return;
      }
      simplemde = new SimpleMDE({
        toolbar: false,
        autofocus: false,
        autosave: {
          enabled: true,
          uniqueId: variable_name+Math.random(),
          delay: 1000,
        },
        blockStyles: {
          bold: "__",
          italic: "___"
        },
        element: document.getElementById(variable_name),
        forceSync: true,
        hideIcons: ["guide", "heading"],
        indentWithTabs: false,
        initialValue: simplemd_initialize_text,
        insertTexts: {
          horizontalRule: ["", "\n\n-----\n\n"],
          image: ["![](http://", ")"],
          link: ["[", "](http://)"],
          table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
        },
        lineWrapping: false,
        parsingConfig: {
          allowAtxHeaderWithoutSpace: true,
          strikethrough: false,
          underscoresBreakWords: true,
        },
        placeholder: "Type here...",
        previewRender: function(plainText, preview) {
          preview.innerHTML = this.parent.markdown(plainText);
          var uniqid = Date.now();
          preview.setAttribute('id',uniqid);
          MathJax.Hub.Queue(["Typeset",MathJax.Hub,''+uniqid]);
          return preview.innerHTML;
        },
        promptURLs: true,
        renderingConfig: {
          singleLineBreaks: false,
          codeSyntaxHighlighting: true,
        },
        shortcuts: {
          drawTable: "Cmd-Alt-T"
        },
        showIcons: ["code", "table"],
        spellChecker: true,
        status: false,
        status: ["autosave", "lines", "words", "cursor"], // Optional usage
        status: ["autosave", "lines", "words", "cursor", {
          className: "keystrokes",
          defaultValue: function(el) {
            this.keystrokes = 0;
            el.innerHTML = "0 Keystrokes";
          },
          onUpdate: function(el) {
            el.innerHTML = ++this.keystrokes + " Keystrokes";
          }
        }, {
          className: "toggleDisplay",
          defaultValue: function(el) {
            this.displayMode = 0;
            el.innerHTML = "Cmd-P";
          },
          onUpdate: function(el) {
            if (this.displayMode == 0) {
              el.innerHTML = 'Cmd-P';
            } else {
              el.innerHTML = 'preview';
            }
            //simplemde.togglePreview();
            //this.displayMode = 1;
          }
        }], // Another optional usage, with a custom status bar item that counts keystrokes
        styleSelectedText: false,
        tabSize: 4,
      });

      simplemde.codemirror.on("change", function() {
        // at some point we should save what we have on the server --- if we are connected
        //console.log(simplemde.value());

        // lets parse the text, find out the groups that contain code
        setTimeout(function(){parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(),div_hist)},0);
      });
      jQuery('#display').on('click', 'span.toggleDisplay', function() {
        console.log("got a click on toggle display mode");
      });
      simplemde.codemirror.on("focus", function(){
        console.log("got a focus event to display the editor");
      });

      // start by showing it nicely
      simplemde.togglePreview();
      jQuery('.editor-preview').on('click', function() {
        simplemde.togglePreview();
      });


      div.find(".fold-recipe")[0].scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});  
      setTimeout((function() {
        parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(), div_hist);
      }),0);
    }
  });

  if (typeof top !== 'undefined' && top) {
    jQuery(bootstrap_input_name).find('input').focus();
  }
  if (typeof variable_name == "number"){
    setTimeout( function(){maximize.trigger("click")},100);
  }
}

function checkLogin() {
  jQuery.getJSON('/code/php/loginCheck.php', function(data) {
    //console.log(data);
    if (data['login'] == 0) {
      // logged out, go to login page with this page
      window.location = "//" + window.location.host + "/applications/User/login.php?url=" + window.location.pathname;
    }
  });
}

var simplemde;
jQuery(document).ready(function() {
  jQuery('div.container-fluid').on('keyup', 'input.element-name', function (data) {
    //console.log("typing in input" + jQuery(this).val());
    // sanitize the entered string
    var v = jQuery(this).val();
    var posA = jQuery(this)[0].selectionStart;
    var posZ = jQuery(this)[0].selectionEnd;

    // while typing we should allow some spaces
    v = v.toLowerCase();
    v = v.replace(/[^a-z0-9_]/g, "");
    jQuery(this).val(v);
    jQuery(this).prop('selectionStart', posA);
    jQuery(this).prop('selectionEnd', posZ);
  });

  $.post("getScores.php", {action : "load"}).done(function(data){
    recipes = JSON.parse(data);
    //console.log(recipes);
    for (recipe in recipes) {
      insert_recipe_block(recipes[recipe], false);
    }
  });
  setTimeout(function() { addOneMeasure('age'); }, 0);
  setInterval(function() { checkLogin(); }, 60000); // every minute
});

function loadAnalysisNames() {
  dataMRIRead = false // we have to read them and afterwards add the entries to the ontology field
  dataBehaviorRead = false
  version = ""
  var inputData =
    "../../data/" +
    "ABCD" +
    "/data_uncorrected" +
    "/" +
    "ABCD" +
    "_datadictionary01.csv"
  jQuery.get(
    inputData,
    {
      cache: true,
    },
    function(tsv) {
      var lines = [],
        listen = false

      try {
        // split the data return into lines and parse them
        tsv = tsv.split(/\r?\n/)
        jQuery.each(tsv, function(i, line) {
          if (line == "" || line.charAt(0) == "#") {
            listen = false
          }
          // extract the header line from the first comment line
          line = line.split(/,/)
          var name = line[0]
          name = name.replace(/["']/g, "")
          analysis_names.push(name)
        })

        dataMRIRead = true
        //if (dataMRIRead && dataBehaviorRead)
        //addToOntology(analysis_names);
      } catch (err) {}
    }
  )

  var inputData =
    "../../data/" +
    "ABCD" +
    "/data_uncorrected" +
    "/" +
    "ABCD" +
    "_datadictionary02.csv"
  jQuery.get(
    inputData,
    {
      cache: true,
    },
    function(tsv) {
      var lines = [],
        listen = false

      try {
        tsv = tsv.split(/\r?\n/)
        jQuery.each(tsv, function(i, line) {
          if (
            line == "" ||
            line.charAt(0) == "#" ||
            analysis_names.length == 0
          ) {
            listen = false
          }
          line = line.split(/,/)
          analysis_names.push(line[0])
        })

        dataBehaviorRead = true
        //if (dataMRIRead && dataBehaviorRead)
        //addToOntology(analysis_names);
      } catch (err) {}
    }
  )
}


// return list of variables in ar that match expressions array
function matchInArray(ar, expressions) {
  var len = expressions.length,
    rt = [], // expressions that are strings
    i = 0;
  // create a copy of ar, remove the strings, keep regular expressions
  var newexpressions = []; // expressions that are regular expressions

  // remove strings from the regular expression array
  for (i = 0; i < expressions.length; i++) {
    if (expressions[i].constructor.name == "String") {
      rt.push(expressions[i])
    } else { // assumption is that an expression that is not a string is a regular expression (not a number etc..)
      newexpressions.push(expressions[i]);
    }
  }
  expressions = newexpressions; // remove old expressions
  for (var si in ar) {
    var str = ar[si];

    for (var i = 0; i < expressions.length; i++) {
      if (str.match(expressions[i])) {
        rt.push(str);
      }
    }
  }
  return rt;
};
