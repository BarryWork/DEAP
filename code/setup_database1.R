#
# Convert an R data.frame to a MonetDB compatible import.
#
# This functionality mimics an sqldump suitable for fast import into MonetDB (database abcd).
# To import the resulting files into MonetDB do (in bash):
# > DOTMONETDBFILE=/root/.monetdb_root mclient --port=11223 -d abcd /tmp/createTable.sql
#
# Speed: The "COPY RECORDS" method below is the fastest way to import large data into MonetDB.
#        That said, the speed of the import of the table is still slow (call to mclient 30min).
#        Creating the data import files using this script should take about 10-15min. 
#
# There will be several tables based on a calculated prefix derived from each item name.
# Attention: The prefix is not derived from actual NDA instruments. We just split the item
#            name by "_.-" and use the first entry as a prefix to the table name (abcd_<split[0]>). 
#            Also, all splits that produce groups with less than 40 items will be combined into a 
#            general "abcd_other" table.
#
# The resulting MonetDB database can be used to extract values from it by:
#  - check if the column you are looking for is in the table "abcd_other"
#  - if not, split the item name using [_.-] and create a table name using the index 0 string
#    prefixed with "abcd_". For example "fam_roster_2c_v2_l" will be in table "abcd_fam" as well
#    as all other columns that start with "fam_".
#
# All tables in the MonetDB database will have the two columns "subjectid" and "eventname" as
# VARCHAR. All other columns are numeric where numeric values appear as REAL data type and factors
# are coded as INT based on their levels in R. As an example the "fam_roster_2c_v2_l" in R
# (table abcd_fam) has levels:
# > levels(nda18['fam_roster_2c_v2_l'])
#  [1] "Husband or wife"            "Unmarried partner"         
#  [3] "Father or mother"           "Foster child"              
#  [5] "Grandchild"                 "Other nonrelative"         
#  [7] "Parent-in-law"              "Biological son or daughter"
#  [9] "Other relative"             "Adopted son or daughter"   
# [11] "Roomer or boarder"          "Housemate or roommate"     
# [13] "Brother or sister"         
#
# In MonetDB this variable would have integer values 1:13 with 3 meaning "Father or mother" etc..
#

# for test purposes lets limit the columns of our table to data without these instruments
#dontuse=c("^tfmri", "^rsfmri")
dontuse=c()
nda18 = readRDS('/var/www/html/data/ABCD/data_uncorrected/nda18.Rds_copy')
for (u in dontuse) { 
    nda18 = nda18[,grep(u, names(nda18), invert=TRUE)]; 
}
othercolumns=names(nda18) # without the musthaves
othercolumns=othercolumns[othercolumns != "subjectid"]
othercolumns=othercolumns[othercolumns != "eventname"]
prefixes=gsub("([^_.-]+[_.-]).*", "\\1", othercolumns)
musthaves=c("subjectid", "eventname")
howmany = sort(table(prefixes)) # the values are sorted by how many items per 'instrument'
cutoff=40 # any less entries and all go into the first table, all others get individual tables
tab="abcd_other" # first table that gets the small fry
sqldump1 <- array()
sqldump1[[length(sqldump1)]] = paste("DROP TABLE IF EXISTS", tab, ";", sep=" ")
sqldump1[[length(sqldump1)+1]] = paste("CREATE TABLE", tab, "( \"subjectid\" VARCHAR(100), \"eventname\" VARCHAR(100)", sep=" ")
# we can have partial matches - like in kbipcserviceschecklistl1 and kbipcserviceschecklistl10
# for those we keep a list of 'havedones'. If we don't do this we will add some columns twice - fails table creation!
havedones = array()
lasttablescolumnnames = array() # remember all columns in all previous tables to get columns in current table
for (t in names(howmany)) {
  if (howmany[t] > cutoff) {
    sqldump1[[length(sqldump1)+1]] = " );"
    # make subjectid and eventname the unique keys in the table
    sqldump1[[length(sqldump1)+1]] = paste("ALTER TABLE", tab, "ADD CONSTRAINT ",paste(tab, "_uc", sep="")," UNIQUE (\"subjectid\", \"eventname\"); ", sep=" ")
    # now we can create a CSV for this table and import (get names for all columns first - has to be in order)
    tcolumns = c("subjectid", "eventname", havedones[!(havedones %in% lasttablescolumnnames)])
    dt = nda18[,tcolumns]
    fac=names(dt)[sapply(dt, class) == "factor"]
    i = 3 # we always have two columns first that should stay VARCHAR (subjectid and eventname)
    while(i <= length(fac)) {
      # converting factors to numeric values will fail if we don't code levels and labels correctly, levels should be numeric
      if (!is.numeric(levels(dt[fac[[i]]]))) {
        print(paste("warning: non-numeric levels for", fac[[i]], "we will create our own levels."))
        lab=levels(dt[[fac[[i]]]])
        if (length(lab) > 0)
          dt[fac[[i]]] = match(dt[[fac[[i]]]], lab) # factor(match(dt[[fac[[i]]]], lab), labels=lab, levels=1:length(lab))
      }
      dt[fac[[i]]] = as.numeric(dt[[fac[[i]]]])
      i = i + 1;
    }
    tname = paste("/tmp/", tab, ".csv",sep="")
    write.table(dt, file=tname, row.names=FALSE, col.names=FALSE, na="", sep="|")
    sqldump1[[length(sqldump1)+1]] = paste("COPY", nrow(dt), "RECORDS INTO", tab, "FROM", paste("'", tname, "'", sep=""), "USING DELIMITERS '|','\\n','\"' NULL AS '';", sep=" ")
    lasttablescolumnnames = havedones

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

# Should be tested, running it on command line using 'pv' timing is not too bad (30min).
system(paste("DOTMONETDBFILE=/root/.monetdb_root mclient --port=11223 -d abcd ", tmp, sep=""))
