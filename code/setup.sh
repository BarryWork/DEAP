#!/bin/bash

#########################################################################
#
# Create a directory tree that DEAP can use to store non-volatile data.
#
#########################################################################

project=ABCD
user=`/usr/bin/whoami`
rootpath=/var/www/html

if [ "${user}" != "root" ]; then
    echo "Usage: should be called by the root user"
    exit -1
fi

if [ ! -d "${rootpath}/data/${project}" ]; then
    echo "Usage: mount an external directory with an Rds data file to ${rootpath}/data/${project}"
    exit -1
fi

dataRds=`ls ${rootpath}/data/${project}/*.Rds | head -1`
dataRdsEnd="${rootpath}/data/${project}/data_uncorrected/nda17.Rds"
if [ -f "${dataRds}" ] && [ ! -f "${dataRdsEnd}" ]; then
    echo "Detected initial data Rds in project data directory, start setup..."
    mkdir -p "${rootpath}/data/${project}/logs/"
    mkdir -p "${rootpath}/data/${project}/data_uncorrected"
    cp "${dataRds}" "${rootpath}/data/${project}/data_uncorrected/"
    cp "${rootpath}/applications/Ontology/ABCD_datadictionary_rules.csv_master" "${rootpath}/data/${project}/data_uncorrected/ABCD_datadictionary_rules.csv"
    mkdir -p "${rootpath}/data/${project}/Ontology/searchServer/"
    if [ ! -f "${rootpath}/data/${project}/Ontology/teach.json" ]; then
        # lets keep this file if it exists already
        cp "${rootpath}/applications/Ontology/teach.json" "${rootpath}/data/${project}/Ontology/"
    fi
    mkdir -p "${rootpath}/data/${project}/NewDataExpo/usercache/"
    mkdir -p "${rootpath}/data/${project}/NewDataExpo/variableInfo/"
    mkdir -p "${rootpath}/data/${project}/Pre-Registration/"
    mkdir -p "${rootpath}/data/${project}/ModelBuilder/viewer/recipes/"
    cp "${rootpath}/applications/ModelBuilder/viewer/recipes/"GAMM4-FZ-CR.* "${rootpath}/data/${project}/ModelBuilder/viewer/recipes/"

    if [ ! -d "${rootpath}/data/${project}/Scores/data/admin" ]; then
        # if the directory exists already, don't copy default entries over the current fields
        mkdir -p "${rootpath}/data/${project}/Scores/data/admin"
    fi
    cp "${rootpath}/applications/Scores/data/admin/"*.json "${rootpath}/data/${project}/Scores/data/admin"
    cp "${rootpath}/applications/Scores/data/admin/"*.raw "${rootpath}/data/${project}/Scores/data/admin"
    cp "${rootpath}/applications/Scores/data/admin/"*.rds "${rootpath}/data/${project}/Scores/data/admin"

    if [ ! -d "${rootpath}/data/${project}/Filter/data/" ]; then
        mkdir -p "${rootpath}/data/${project}/Filter/data/"
    fi
    cp "${rootpath}/applications/Filter/data/public.json" "${rootpath}/data/${project}/Filter/data/public.json"
    cp "${rootpath}/applications/Filter/data/filterSets"*.json "${rootpath}/data/${project}/Filter/data/"
    mkdir -p "${rootpath}/logs"
    chown -R www-data:www-data "${rootpath}/logs"
    
    # the owner of all of these should be the web-user (fixed user across all docker instances)
    chown -R www-data:www-data "${rootpath}/data/${project}/"
    chown -R processing:processing "${rootpath}/data/${project}/logs"
    chmod gou+rw "${rootpath}/data/${project}/logs"
elif [ -f "${rootpath}/data/${project}/data_uncorrected/nda17.Rds" ]; then
    echo "Setup found. Nothing needs to be done."
    exit
else
    echo "Error: Setup has not been done and no data file detected (${dataRds}). DEAP project directory structure is not correctly setup."
    ls ${rootpath}/data/${project}/
    exit
fi

