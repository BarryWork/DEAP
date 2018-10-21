
library("rjson");

transfer_file = function (rawfile){	
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


  #######################################
  # Generating histogram file for score #
  #######################################
  censor = function(x, fraction=.005) {
    if (length(fraction) != 1 || fraction < 0 || fraction > 1) {
      stop("bad value for fraction")
    }
    lim <- quantile(x,probs=c(fraction/2, 1-fraction/2),na.rm = T)
    x[ x < lim[1]] <- NA
    x[ x > lim[2]] <- NA
    x = x[!is.na(x)]
    x
  }
  print ("initialization started"); 
  v = strsplit(basename(rawfile),".raw")[[1]];
  print(v)
  data = newd;
  fvar = levels(as.factor(data[[v]]));
  fvar_length = length(fvar);
  line = "";
  table = "";
  hs = c();
  sm = c();
  print ("initialization finished"); 

  if (class(data[[v]]) == "numeric" & !all(is.na(data[[v]]))) {
    h = hist(data[[v]],plot=FALSE,breaks=10);
    hs = c(hs, list(list("transform"=list(), "histogram"=h)));

  }
  s = summary(data[[v]]);
  sm = c(sm, list(list("transform"=list(), "summary"=s)));

  print("Numerical section")
  if (class(data[[v]]) == "numeric" & !all(data[[v]]==0,na.rm=TRUE)) {
    d = data[[v]];
    d = d[!is.na(d)];
    d = d[d>0];
    if (length(d) > 0 & !all(d == 0)) {
      h = hist(log(d),plot=FALSE,breaks=10);
      hs = c(hs, list(list("transform"=list("log"), "histogram"=h)));
      s = summary(log(d));
      sm = c(sm, list(list("transform"=list("log"), "summary"=s)));

      tmp = censor(log(d));
      if (length(tmp) > 0 & !all(tmp == 0)) {
        h = hist(censor(log(d)),plot=FALSE,breaks=10);
        hs = c(hs, list(list("transform"=list("log","censor005"), "histogram"=h)));
        s = summary(censor(log(d)));
        sm = c(sm, list(list("transform"=list("log","censor005"), "summary"=s)));
      }

      tmp = censor(data[[v]]);
      if (length(tmp) > 0 & !all(tmp == 0)) {
        h = hist(censor(data[[v]]),plot=FALSE,breaks=10);
        hs = c(hs, list(list("transform"=list("censor005"), "histogram"=h)));
        s = summary(censor(data[[v]]));
        sm = c(sm, list(list("transform"=list("censor005"), "summary"=s)));

      }

      h = hist(data[[v]]^2,plot=FALSE,breaks=10);
      hs = c(hs, list(list("transform"=list("squared"), "histogram"=h)));
      s = summary(data[[v]]^2);
      sm = c(sm, list(list("transform"=list("squared"), "summary"=s)));

      tmp = censor(data[[v]]^2);
      if (length(tmp) > 0 & !all(tmp == 0)) {
        h = hist(censor(data[[v]]^2),plot=FALSE,breaks=10);
        hs = c(hs, list(list("transform"=list("squared","censor005"), "histogram"=h)));
        s = summary(censor(data[[v]]^2));
        sm = c(sm, list(list("transform"=list("squared","censor005"), "summary"=s)));

      }
    } 
  }


  s = list(summary = sm, factors = summary(fvar), histograms = hs);
  write(toJSON(s),paste(sep = "", "/var/www/html/data/ABCD/NewDataExpo/variableInfo/",v,".json")) 
}

rawfile <- commandArgs(trailingOnly=TRUE);
if( length(print(rawfile)) > 0 ){
  transfer_file(rawfile)
} else{
  li = list.files("/var/www/html/data/ABCD/Scores/data/")
  for ( user in 1:length(li)){
    user_li = list.files(path = paste0("/var/www/html/data/ABCD/Scores/data/", li[user]), pattern = '*.raw')
    for (scores_item in 1:length(user_li)){
	transfer_file(paste0("/var/www/html/data/ABCD/Scores/data/",li[user],"/",user_li[scores_item]))
    }
  }	  
}

