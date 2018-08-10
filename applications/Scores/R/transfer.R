
library("rjson");
rawfile <- commandArgs(trailingOnly=TRUE)
d = fromJSON(file = rawfile);

for (varname in names(d)){
  for (i in 1:length(d[[varname]])) { 
      if(length(d[[varname]][[i]]) == 0) { 
  	  d[[varname]][[i]] = NA; 
      }
  }
  d[[varname]] = unlist(d[[varname]]);
}

#type = class(unlist(d[[varname]]));

newd = as.data.frame(d);
#if (type == "numeric"){
#   newd[[varname]]=as.numeric(as.character(newd[[varname]]))
#}
rdsname = paste(strsplit(rawfile,"raw"),"rds",sep = "",collapse = NULL);
saveRDS(newd, file = rdsname);
