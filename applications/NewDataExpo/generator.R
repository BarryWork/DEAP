library(rjson)
data = readRDS("/var/www/html/data/ABCD/data_uncorrected/nda18.Rds");

data.dic = data.frame(field_name = names(data), 
                      class = as.character(unlist(lapply(data, class))),  
                      field_shortname2 = names(data), 
                      field_shortname=names(data))
                      
write.csv(data.dic[order(data.dic$field_name),],file = "/var/www/html/data/ABCD/data_uncorrected/ABCD_datadictionary01.csv",row.names = F);

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

#data = data[which(data$eventname == "baseline_year_1_arm_1"),]
vlist = names(data)
for(v in vlist){
    cat(v);
    temp = data[,c("eventname", v)]
    event_sm = summary(temp[!is.na(temp[[v]]),]$eventname)
    fvar = levels(as.factor(data[[v]]));
    fvar_length = length(fvar);
    line = "";
    table = "";
    hs = c();
    sm = c();

    if (class(data[[v]]) == "numeric" & !all(is.na(data[[v]]))) {
        h = hist(data[[v]],plot=FALSE,breaks=10)
        hs = c(hs, list(list("transform"=list(), "histogram"=h)))

    }
    s = summary(data[[v]])
    sm = c(sm, list(list("transform"=list(), "summary"=s)));

    if (class(data[[v]]) == "numeric" & !all(data[[v]]==0,na.rm=TRUE)) {
        d = data[[v]]
        d = d[!is.na(d)]
        d = d[d>0]
        if (length(d) > 0 & !all(d == 0)) {
            h = hist(log(d),plot=FALSE,breaks=10)
            hs = c(hs, list(list("transform"=list("log"), "histogram"=h)))
            s = summary(log(d))
            sm = c(sm, list(list("transform"=list("log"), "summary"=s)));
 
            tmp = censor(log(d))
            if (length(tmp) > 0 & !all(tmp == 0)) {
                h = hist(censor(log(d)),plot=FALSE,breaks=10)
                hs = c(hs, list(list("transform"=list("log","censor005"), "histogram"=h)))
                s = summary(censor(log(d)))
                sm = c(sm, list(list("transform"=list("log","censor005"), "summary"=s)));
            }

            tmp = censor(data[[v]])
            if (length(tmp) > 0 & !all(tmp == 0)) {
                h = hist(censor(data[[v]]),plot=FALSE,breaks=10)
                hs = c(hs, list(list("transform"=list("censor005"), "histogram"=h)))
                s = summary(censor(data[[v]]))
                sm = c(sm, list(list("transform"=list("censor005"), "summary"=s)));
 
            }

            h = hist(data[[v]]^2,plot=FALSE,breaks=10)
            hs = c(hs, list(list("transform"=list("squared"), "histogram"=h)))
            s = summary(data[[v]]^2)
            sm = c(sm, list(list("transform"=list("squared"), "summary"=s)));
 
            tmp = censor(data[[v]]^2)
            if (length(tmp) > 0 & !all(tmp == 0)) {
                h = hist(censor(data[[v]]^2),plot=FALSE,breaks=10)
                hs = c(hs, list(list("transform"=list("squared","censor005"), "histogram"=h)))
                s = summary(censor(data[[v]]^2))
                sm = c(sm, list(list("transform"=list("squared","censor005"), "summary"=s)));
 
            }
        } 
    }

#    if (class(data[[v]]) == "numeric" && fvar_length >10) {
#        line = list(x = density(data[v]$x ,x = density(data[v]$y)))
#    }

    s = list(summary = sm, factors = summary(fvar), histograms = hs, event_summary = event_sm);
    write(toJSON(s),paste(sep = "", "/var/www/html/data/ABCD/NewDataExpo/variableInfo/",v,".json")) 
}
