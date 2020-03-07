import numpy as np
import pymonetdb.sql
import json
import getopt,sys

from scipy.cluster.hierarchy import dendrogram
from sklearn.datasets import load_iris
from sklearn.cluster import AgglomerativeClustering


def main(argv):
    variables = []
    opts,args = getopt.getopt(argv,"hp:o:",["help", "parameter=", "output="])
    output = ""
    
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print ("Usage : hierarchical-clustering.py –p <parameter json filename> -o <output json filename>")
            sys.exit(-1)
        if opt in ("-p", "-parameter"):
            # read the variable names
            with open(arg) as f:
                variables = json.load(f)
        if opt in ("-o", "-output"):
            output = arg
    print(json.dumps(variables))
                                  
    conn = pymonetdb.connect(username="monetdb", password="monetdb", hostname="localhost", port=11223, database="abcd")

    cursor = conn.cursor()
    # we need to find out in what table our different columns are
    cursor.execute('SELECT * FROM sys.Tables WHERE tables.system=false')
    
    #cursor.execute('SELECT * FROM abcd_other')
    tables = []
    for row in cursor:
        # we only care about tables that start with abcd_
        if row[1].startswith("abcd_"):
            tables.append(row[1])

    # get the id if each table
    cursor.execute("SELECT id FROM sys.tables WHERE name = 'abcd_other'")
    for row in cursor:
        abcd_other_id = row[0]
    
            
    # we could find what we are looking for in abcd_other, get those variables first
    abcd_other_columns = []
    cursor.execute("SELECT name FROM sys.columns where table_id = " + str(abcd_other_id))
    for row in cursor:
        abcd_other_columns.append(row[0])
    print(abcd_other_columns)
        
if __name__ == "__main__":
    main(sys.argv[1:])
