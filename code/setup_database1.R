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
prefixes=gsub("([^_.-]+[_.-]).*", "\\1", othercolumns)
musthaves=c("subjectid", "eventname")
howmany = sort(table(prefixes)) # the values are sorted
cutoff=40 # any less entries and all go into the first table, all others get individual tables
# names(nda18) = gsub("([_.-])", "", names(nda18))
tab="abcd_other"
sqldump1 <- array()
sqldump1[[length(sqldump1)]] = paste("DROP TABLE IF EXISTS", tab, ";", sep=" ")
sqldump1[[length(sqldump1)+1]] = paste("CREATE TABLE", tab, "( \"subjectid\" VARCHAR(100), \"eventname\" VARCHAR(100)", sep=" ")
# we can have partial fits - like in kbipcserviceschecklistl1 and kbipcserviceschecklistl10
# for those we keep a list of havedones. If we don't do this we will add some columns twice - fails table creation!
havedones = array()
for (t in names(howmany)) {
  if (howmany[t] > cutoff) {
    sqldump1[[length(sqldump1)+1]] = " );"
    # make subjectid and eventname the unique keys in the table
    sqldump1[[length(sqldump1)+1]] = paste("ALTER TABLE", tab, "ADD CONSTRAINT ",paste(tab, "_uc", sep="")," UNIQUE (\"subjectid\", \"eventname\"); ", sep=" ")
    tab = paste("abcd",gsub("[_.-]", "", t),sep="_")
    sqldump1[[length(sqldump1)+1]] = paste("DROP TABLE IF EXISTS", tab, ";", sep=" ")
    sqldump1[[length(sqldump1)+1]] = paste("CREATE TABLE", tab, "( \"subjectid\" VARCHAR(100), \"eventname\" VARCHAR(100)", sep=" ")
  }
  data = nda18[,grep(paste("^",t,sep=""), names(nda18)), drop=FALSE] # prevent a vector, need data.table
  cnames=names(data)
  for(col in seq(1, length(cnames))) {
    #print(cnames[[col]])
    if (cnames[[col]] %in% havedones) {
      next
    }
    havedones = append(havedones, as.character(cnames[[col]]))
    if (class(data[[col]]) == "factor") {
      sqldump1[[length(sqldump1)+1]] = paste(paste(", \"", cnames[[col]], "\"", sep=""), "INT", sep=" ");
    } else if (class(data[[col]]) == "numeric") {
      sqldump1[[length(sqldump1)+1]] = paste(paste(", \"", cnames[[col]], "\"", sep=""), "REAL", sep=" ");
    } else {
      print("Error, found a column that is neither numeric nor factor")
    }  
  }
}
sqldump1[[length(sqldump1)+1]] = " );"
tmp <- '/tmp/createTable.sql'
con <- file(tmp, "w")
writeLines(paste0(sqldump1, collapse=""), con=con)
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
prefixes=gsub("([^_.-]+[_.-]).*", "\\1", othercolumns)
musthaves=c("subjectid", "eventname")
howmany = sort(table(prefixes)) # the values are sorted
cutoff=40 # any less entries and all go into the first table, all others get individual tables
#names(nda18) = gsub("([_.-])", "", names(nda18))
tab="abcd_other"
tmp2 <- '/tmp/fillData.sql'
con2 <- file(tmp2, "w")
tab="abcd_other"
inserted = array() # we only want to insert the unique keys once, keep track of them here
for (t in names(howmany)) {  # now go through all tables (sorted)
  if (howmany[t] > cutoff) {
      tab = paste("abcd",gsub("[_.-]", "", t),sep="_")
      inserted = array()
  }
  idx = grep(paste("^",t,sep=""), names(nda18))
  idx = c(c(1, 3), idx)
  data2 = nda18[, idx, drop=FALSE] # prevent a vector, need data.table
  # separate loops for the unique keys (INSERT INTO) and later the UPDATE
  for (row in seq(1, nrow(data2))) {
    r = data2[row, ,drop=FALSE]
    idx = !is.na(r)
    r = r[, idx]
    if (length(r) <= 2) {
      next
    }
    k = paste(as.character(r[[1]]), as.character(r[[2]]), sep="")
    if ( k %in% inserted ) {
      next
    }
    inserted = append(inserted, k);
    writeLines(paste("INSERT INTO ", tab, " ( ", paste("\"", musthaves, "\"", sep="", collapse=", "), " ) VALUES ( ", paste("'", as.character(r[[1]]), "'", sep=""), ",", paste("'", as.character(r[[2]]), "'", sep="") , ");"), con=con2)
  }
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
    n = paste("\"", names(r[3:length(r)]), "\"", sep="")
    v = r[,3:length(r)]
    if (length(n) > 0 && length(n) == length(v)) {
      writeLines(paste("UPDATE ", tab, " SET ", paste(n, v, sep=" = ", collapse=", "), " WHERE \"subjectid\" = '", as.character(r[[1]]), "' AND \"eventname\" = '", as.character(r[[2]]), "';", sep=""), con=con2)
    }
  }
}
close(con2)

system(paste("DOTMONETDBFILE=/root/.monetdb_root mclient --port=11223 -d abcd ", tmp2, sep=""))
