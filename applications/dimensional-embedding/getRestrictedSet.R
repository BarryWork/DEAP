
# command line arguments
cmd_args = commandArgs();
argsfound = 0;
for (arg in cmd_args) {
  if (arg == "--args") {
     argsfound = 1;
  }
  if (arg != "--args" && argsfound == 1) {
      eval(parse(text=arg)); 
  }
}

# we should have now iname, oname and variables

# read in the spreadsheet
load(iname)

colnums = which(is.element(names(data),variables))
data = data[,colnums]
#write.csv(data[20,], '/tmp/aaa.csv')

# write to file as array of arrays in json format
sink(oname, append=FALSE)
cat("[\n [\"")
cat(paste(names(data), sep="", collapse="\",\""))
cat("\" ]")
for (i in 1:dim(data)[1]) {
  cat(",[")
  for (j in 1:dim(data)[2]) {
    cat(paste("\"",data[i,j],"\"",sep=""))
    if (j < dim(data)[2])
      cat(",")
  }
  cat("]")
}

cat("]\n")
sink()
