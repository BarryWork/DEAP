#library(DBI)
#options(monetdb.debug.query=TRUE)
#nda18 = readRDS('/var/www/html/data/ABCD/data_uncorrected/nda18.Rds')
## sanitize the column names by removing list of characters
#names(nda18) = gsub("([_.-])", "", names(nda18))
## convert all factors to numbers
#for (i in seq(1, ncol(nda18))) {
#    if (class(nda18[[i]]) == "factor") {
#        nda18[[i]] = as.numeric(levels(nda18[[i]]))[nda18[[i]]]
#    }
#}
#chunk <- 500
#n <- nrow(nda18)
#r <- rep(1:ceiling(n/chunk),each=chunk)[1:n]
#d <- split(nda18,r)
#conn <- dbConnect(MonetDBLite::MonetDB.R(), host="localhost", port=11223, dbname="abcd", user="monetdb", password="monetdb", timeout=15)
#dbSendQuery(conn, "DROP TABLE IF EXISTS abcd")
#for (i in seq(1, length(d))) {
#   dbWriteTable(conn, "abcd", d[[i]], append=TRUE, csvdump=TRUE, row.names = FALSE)
#}

# for test purposes lets limit the columns of our table to data without these
dontuse=c("^tfmri", "^smri", "^dmri", "^rsfmri", "^iqc")
nda18 = readRDS('/var/www/html/data/ABCD/data_uncorrected/nda18.Rds')
for (u in dontuse) { 
    nda18 = nda18[,grep(u, names(nda18), invert=TRUE)]; 
}
# we have to save each table individually - if the table has more than 1000 entries 
# the creation of the table will take too much time
othercolumns=names(nda18) # without the musthaves
othercolumns=othercolumns[othercolumns != "subjectid"]
othercolumns=othercolumns[othercolumns != "eventname"]
prefixes=gsub("([^_]+).*", "\\1", gsub("[_.-]","_",othercolumns))
musthaves=c("subjectid", "eventname")
howmany = sort(table(prefixes)) # the values are sorted
cutoff=40 # any less entries and all go into the first table, all others get individual tables
names(nda18) = gsub("([_.-])", "", names(nda18))
tab="abcd_other"
sqldump1 <- array()
sqldump1[[length(sqldump1)]] = paste("DROP TABLE IF EXISTS", tab, ";", sep=" ")
sqldump1[[length(sqldump1)+1]] = paste("CREATE TABLE", tab, "(\"subjectid\" VARCHAR(100), \"eventname\" VARCHAR(100) ", sep=" ")
for (t in names(howmany)) {
  if (howmany[t] > cutoff) {
    sqldump1[[length(sqldump1)+1]] = " );"
    tab = paste("abcd",t,sep="_")
    sqldump1[[length(sqldump1)+1]] = paste("DROP TABLE IF EXISTS", tab, ";", sep=" ")
    sqldump1[[length(sqldump1)+1]] = paste("CREATE TABLE", tab, "(\"subjectid\" VARCHAR(100), \"eventname\" VARCHAR(100) ", sep=" ")
  }
  data = nda18[,grep(paste("^",t,sep=""), othercolumns), drop=FALSE] # prevent a vector, need data.table
  cnames=names(data)
  for(col in seq(1, length(cnames))) {
    #print(cnames[[col]])
    if (class(data[[col]]) == "factor") {
      sqldump1[[length(sqldump1)+1]] = paste(paste(", \"", cnames[[col]], "\"", sep=""), "INT ", sep=" ");
    } else if (class(data[[col]]) == "numeric") {
      sqldump1[[length(sqldump1)+1]] = paste(paste(", \"", cnames[[col]], "\"", sep=""), "REAL ", sep=" ");
    } else {
      print("Error, found a column that is neither numeric nor factor")
    }  
  }
}
sqldump1[[length(sqldump1)+1]] = " );"
tmp <- '/tmp/createTable.sql'
con <- file(tmp, "w")
writeLines(sqldump1, con=con)
close(con)

# mclient -u monetdb --port=11223 -d abcd /tmp/Rtmp3AbMKr/createTablec38e5dc9929a
system(paste("DOTMONETDBFILE=/root/.monetdb_root mclient --port=11223 -d abcd ", tmp, sep=""))

# Next create the data (again, takes a long time - hours)
dontuse=c("^tfmri", "^smri", "^dmri", "^rsfmri", "^iqc")
nda18 = readRDS('/var/www/html/data/ABCD/data_uncorrected/nda18.Rds')
for (u in dontuse) { 
    nda18 = nda18[,grep(u, names(nda18), invert=TRUE)]; 
}
# we have to save each table individually - if the table has more than 1000 entries 
# the creation of the table will take too much time
othercolumns=names(nda18) # without the musthaves
othercolumns=othercolumns[othercolumns != "subjectid"]
othercolumns=othercolumns[othercolumns != "eventname"]
prefixes=gsub("([^_]+).*", "\\1", gsub("[_.-]","_",othercolumns))
musthaves=c("subjectid", "eventname")
howmany = sort(table(prefixes)) # the values are sorted
cutoff=40 # any less entries and all go into the first table, all others get individual tables
names(nda18) = gsub("([_.-])", "", names(nda18))
tab="abcd_other"
tmp2 <- '/tmp/fillData.sql'
con2 <- file(tmp2, "w")
tab="abcd_other"
for (t in names(howmany)) {  # now go through all tables (sorted)
  if (howmany[t] > cutoff) {
      tab = paste("abcd",t,sep="_") # the table name now
  }
  idx = grep(paste("^",t,sep=""), names(nda18))
  idx = c(c(1, 3), idx)
  data2 = nda18[, idx, drop=FALSE] # prevent a vector, need data.table
  cnames=names(data2)
  for (row in seq(1, nrow(data2))) {
          # dbSendQuery(conn, paste("CREATE TABLE abcd ( ", toString(codes), " );"), csvdump=TRUE);
          r = data2[row, ,drop=FALSE]
          idx = !is.na(r)
          r = r[, idx]
          if (length(r) <= 2) {
            next
          }
          fac=names(r)[sapply(r, class) == "factor"]
          i = 3 # we always have two columns first that should stay VARCHAR (subjectid and eventname)
          while(i <= length(fac)) {
            r[fac[[i]]] = as.numeric(as.character(r[fac[[i]]]))
            i = i + 1;
          }
          n = paste(paste("\"", names(r), "\"", sep=""), collapse=", ")
          v = paste(r[,3:length(r)], collapse=", ")
          if (length(n) > 0 && length(n) == length(v)) {
            writeLines(paste("INSERT INTO ", tab, " ( ", n, " ) VALUES ( ", paste("\"", as.character(r[[1]]), "\"", sep=""), ",", paste("\"", as.character(r[[2]]), "\"", sep=""), ", ", v , " );"), con=con2)
          }          
  }
}
close(con2)

system(paste("DOTMONETDBFILE=/root/.monetdb_root mclient --port=11223 -d abcd ", tmp2, sep=""))
