from timeit import default_timer as timer

start = timer()

import numpy as np
import pymonetdb.sql
import json
import getopt, sys, re
import pandas as pd
from functools import reduce

from scipy.cluster.hierarchy import dendrogram, to_tree
from sklearn.datasets import load_iris
from sklearn.cluster import AgglomerativeClustering

step1 = timer()

def fetchABCDData(variables):
    variables.append("subjectid")
    variables.append("eventname")
    variables = set(variables)
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

    # keep the table together with the name of the variable
    origins = {}
    questionables = []
    unknowns = []
    for v in variables:
        if v in abcd_other_columns:
            if not 'abcd_other' in origins:
                origins['abcd_other'] = []
            origins['abcd_other'].append(v)
        else:
            questionables.append(v)

    # for all variables not in abcd_other guess the table name from the prefix
    for q in questionables:
        guess = "abcd_" + re.split('[_.-]', q)[0]
        if guess in tables:
            if not guess in origins:
                origins[guess] = []
            origins[guess].append(q)
        else:
            unknowns.append(q)
            
    #print(origins)
    if len(unknowns) > 0:
        print("Error: Could not find the table for " + ", ".join(unknowns))    

    # now we can create the full outer join for this list of variables
    cmd="SELECT "
    sids = []
    for o in origins.keys():
        for v in origins[o]:
            sids.append(o + ".\"" + v + "\"")
    cmd=cmd+", ".join(sids)
    first=list(origins.keys())[0]
    cmd=cmd + " FROM " + first + " "
    for o in list(origins.keys())[1:]:
        cmd=cmd + "FULL OUTER JOIN " + o + " ON " + o + ".\"subjectid\" = " + first + ".\"subjectid\" AND " + o + ".\"eventname\" = " + first + ".\"eventname\" "
    #print(cmd)
    cursor.execute(cmd)
    df = pd.DataFrame(cursor.fetchall())
    df.columns = [x[0] for x in cursor.description]
    # TODO: we have numeric columns for all variables even if they are categorical
    # (as.numeric in creation of the monetdb). It would be nice if we can create categorical
    # pd columns here. For speed reasons we don't do this here - we can recover the type
    # of a columns from the ontology app.
    return df

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

    if output == "":
        print("Error: No output json file specified")
        sys.exit(-1)

    if len(variables) == 0:
        print("Error: No variables specified")
        sys.exit(-1)
        
    step_read_data = timer()
    data = fetchABCDData(variables)
    step_read_data_end = timer()

    # stupid stupid stupid, but hey, this is a test...
    data.fillna(-1, inplace=True)
    model = AgglomerativeClustering(distance_threshold=1, n_clusters=None)
    model = model.fit(data.drop(['subjectid', 'eventname'], axis=1))

    counts = np.zeros(model.children_.shape[0])
    n_samples = len(model.labels_)
    for i, merge in enumerate(model.children_):
        current_count = 0
        for child_idx in merge:
            if child_idx < n_samples:
                current_count += 1  # leaf node
            else:
                current_count += counts[child_idx - n_samples]
        counts[i] = current_count

    linkage_matrix = np.column_stack([model.children_, model.distances_,
                                      counts]).astype(float)

    def add_node(node, parent ):
        # First create the new node and append it to its parent's children
        newNode = dict( node_id=node.id, children=[] )
        parent["children"].append( newNode )

        # Recursively add the current node's children
        if node.left: add_node( node.left, newNode )
        if node.right: add_node( node.right, newNode )
    
    T = to_tree( linkage_matrix , rd=False )
    labels = list(data.subjectid)
    id2name = dict(zip(range(len(labels)), labels))
    d3Dendro = dict(children=[], name="Root1")
    add_node( T, d3Dendro )

    # This label_tree will run into a recusion limit of python
    # Python as a language for scientific work? I guess that disqualifies it.
    sys.setrecursionlimit(11785*4)
    def label_tree( n ):
        # If the node is a leaf, then we have its name
        if len(n["children"]) == 0:
            leafNames = [ id2name[n["node_id"]] ]

        # If not, flatten all the leaves in the node's subtree
        else:
            #leafNames = reduce(lambda ls, c: ls + label_tree(c), n["children"], [])
            leafNames = "many"

        # Delete the node id since we don't need it anymore and
        # it makes for cleaner JSON
        del n["node_id"]

        # Labeling convention: "-"-separated leaf names
        n["name"] = name = "-".join(sorted(map(str, leafNames)))

        return leafNames

    label_tree( d3Dendro["children"][0] )
    
    end = timer()
    d3Dendro['timing'] = { "reading libraries": (step1-start), "parse arguments": (step_read_data - step1), "fetch data from database": (step_read_data_end - step_read_data), "run clustering": (end - step_read_data_end), "amount of data": data.shape };
    with open(output,'w') as f:
        json.dump(d3Dendro, f)
        
if __name__ == "__main__":
    main(sys.argv[1:])
