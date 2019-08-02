const folder = '../../data/ABCD/NewDataExpo/usercache/';
const fs = require('fs');

fs.readdir(folder, (err, files) => {
  files.forEach(file => {
	  
    dirPath = folder + file;
    if(fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
    	model = JSON.parse(fs.readFileSync(dirPath + "/model_specification.json"))
	dep = getVarNameByID("depvar", model)
	indep = getVarNameByID("indep", model)
	
	covfix = new Set(getVarNameByID("covfixed", model).filter(x => x != ""&& x))
	covuser = new Set(getVarNameByID("covuser", model).filter(x => x != ""&& x))
	random = new Set(getVarNameByID("random", model).filter(x => x != ""&& x))
	smooth = new Set(getVarNameByID("smo.var", model).filter(x => x != ""&& x))
	log = new Set(getVarNameByID("log.var", model).filter(x => x != ""&& x))
	interaction = new Set(getVarNameByID("int.var", model).filter(x => x != ""&& x))
	square = new Set(getVarNameByID("sq.var", model).filter(x => x != ""&& x))
	group = new Set(getVarNameByID("grvar", model).filter(x => x != ""&& x))
	wsvar = new Set(getVarNameByID("ws.var", model).filter(x => x != ""&& x))
	filtervar = new Set(getVarNameByID("fl.var", model).filter(x => x != "" && x))
	
	console.log(
	{ "name" : file,
          "ctime" : fs.lstatSync(dirPath).ctime,
	  "dependent-variable" : Array.from(dep),
	  "independent-variable" : Array.from(indep),
	  "other-independent" : Array.from(covuser),
	  "fixed-cov": Array.from(covfix),
	  "random" : Array.from(random),
	  "smo.var" : Array.from(smooth),
	  "log.var" : Array.from(log),
	  "interaction.var" : Array.from(interaction),
	  "sq.var" : Array.from(square),
	  "grvar" : Array.from(group),
	  "ws.var" : Array.from(wsvar),
	  "fl.var" : Array.from(filtervar),
	})
    }
  });
});

function getVarNameByID(name, new_json) {
  if (new_json) {
    var json_in_use = new_json;
  } else {
    var json_in_use = json;
  }
  rt_name = "NULL"
  rt_name_list = []
  for( n in json_in_use) {
    if (n == "nodes") {
      json_in_use[n].forEach( function(value, m) {
        json_in_use[n][m]["state"].forEach( function(value, s) {
          if (!json_in_use[n][m]["state"][s]["value"]) return
          if (json_in_use[n][m]["state"][s]["value"].includes(name)) {
            json_in_use[n][m]["state"].forEach( function(value, sc) {
              if (json_in_use[n][m]["state"][sc]["name"] == "value") {
                rt_name_list.push(json_in_use[n][m]["state"][sc]["value"])
              }
            })
          }
          if (json_in_use[n][m]["state"][s]["value"] == name) {
            json_in_use[n][m]["state"].forEach( function(value, sc) {
              if (json_in_use[n][m]["state"][sc]["name"] == "value") {
                rt_name = json_in_use[n][m]["state"][sc]["value"]
              }
            })
          }
        })
      })
    }
  }
  if (rt_name != "NULL")
    return [rt_name]
  //console.log("rt_name_list: " + JSON.stringify(rt_name_list));
  return rt_name_list
}
