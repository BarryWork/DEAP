from timeit import default_timer as timer

start = timer()

from ABCD_ML import ABCD_ML
import numpy as np
import pymonetdb.sql
import json
import getopt, sys, re
import pandas as pd
from functools import reduce

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
    opts,args = getopt.getopt(argv,"hp:o:",["help", "parameter=", "output="])
    output = ""
    params = {}
    
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print ("Usage : example-abcd_ml.py –p <parameter json filename> -o <output json filename>")
            sys.exit(-1)
        if opt in ("-p", "-parameter"):
            # read the variable names
            with open(arg) as f:
                params = json.load(f)
        if opt in ("-o", "-output"):
            output = arg

    if output == "":
        print("Error: No output json file specified")
        sys.exit(-1)

    if len(params['variables']) == 0:
        print("Error: No variables specified")
        sys.exit(-1)
        
    step_read_data = timer()
    variables    = params['variables']
    target_name  = params['target'];
    df_variables = fetchABCDData(variables)
    df_target    = fetchABCDData([target_name])
    df_other     = fetchABCDData(['sex_at_birth','rel_family_id'])
    step_read_data_end = timer()

    # create the model
    ML = ABCD_ML(exp_name = 'Deap',
                 random_state = 1)
    ML.Set_Default_Load_Params(dataset_type = 'basic', eventname = 'baseline_year_1_arm_1')

    # load the target into the model
    ML.Load_Targets(df = df_target,
                   subject_id = 'subjectid',
                   col_name = target_name,
                   data_type = 'float',
                   filter_outlier_std = (3,4),
                   clear_existing = True)
    # load the data
    ML.Load_Data(df = df_variables,
                 subject_id = 'subjectid',
                 filter_outlier_std = 6,
                 clear_existing = True)
    ML.Load_Strat(df = df_other,
                  subject_id = 'subjectid',
                  col_name='rel_family_id')
    ML.Load_Strat(df = df_other,
                  subject_id = 'subjectid',
                  col_name='sex_at_birth')
    ML.Define_Validation_Strategy(groups='rel_family_id')

    # model
    ML.Train_Test_Split(test_size = .2)
    ML.Set_Default_ML_Params(problem_type = 'regression',
                         metric = ['r2', 'mae'],
                         scaler = 'robust',
                         splits = 3,
                         n_repeats = 1,
                         n_jobs = 12)

    #results = ML.Evaluate(model = 'linear')
    results = ML.Evaluate(model = 'ridge',
                          model_params = 1,
                          search_type = 'DiscreteOnePlusOne',
                          search_n_iter = 50)

    end = timer()

    timings = {}
    timings['timing'] = { "reading libraries": (step1-start),
                          "parse arguments": (step_read_data - step1),
                          "fetch data from database": (step_read_data_end - step_read_data),
                          "run machine learning": (end - step_read_data_end),
                          "amount of data": df_variables.shape };
    timings['r2-mean-validation-score'] = results['summary_scores'][0][0]
    timings['r2-std-in-validation-score'] = results['summary_scores'][0][2]
    timings['neg-mean-absolute-error-mean-validation-score'] = results['summary_scores'][1][0]
    timings['neg-mean-absolute-error-std-in-validation-score'] = results['summary_scores'][1][2]

    
    feat_importance = 0
    for fis in ML.Model_Pipeline.feat_importances:
        if 'global' in fis.scopes:
            feat_importance = fis
    df = feat_importance.global_df
    target = feat_importance.target
    #target_key = ML._get_targets_key(target)
    #classes = ML.targets_encoders[target_key].classes_
    timings['dd'] = str(ML._get_targets_key(feat_importance.target))
    
    timings['results'] = str(results)

    
    with open(output,'w') as f:
        json.dump(timings, f)
        
if __name__ == "__main__":
    main(sys.argv[1:])
