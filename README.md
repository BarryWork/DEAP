# Data Exploration and Analysis Portal (DEAP)

[![RRID:SCR_016158](/images/rrid.svg)](https://scicrunch.org/resolver/SCR_016158)

Access ABCD study data with the guide of domain experts that created this resource. 

![Web Interface](/images/frontpage.jpg "Web Interface")

### Prerequisites
Docker v17 is required to deploy this container.

### Installing

First, install docker

```
apt-get install docker
```

Then build the container:

```
docker build . -t deap
```

## Running the container

A script is provided to launch the container, [run](https://github.com/ABCD-STUDY/DEAP/blob/master/run).  For usage instructions, run it with no arguments.

Provide a directory that is outside of the docker container to store the volatile data (analysis scripts and new measures). At the first startup this directory should also contain a single Rds file which contains the data as processed by https://github.com/ABCD-STUDY/analysis-nda17.
```
mkdir -p assets
cp <data nda17.Rds> assets/
./run deap deap master 80 `pwd`/assets
```

(RRID: SCR_016158)

