# Data Exploration and Analysis Portal (DEAP)

[![RRID:SCR_016158](/images/rrid.svg)](https://scicrunch.org/resolver/SCR_016158)

Access ABCD study data with the guide of domain experts that created this resource. 

![Web Interface](/images/frontpage.jpg "Web Interface")

## Getting Started

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

Example
```
mkdir -p assets/data_uncorrected
mkdir -p assets/modelBuilder_data
mkdir -p assets/recipes
./run deap deap master 80 `pwd`/assets/data_uncorrected `pwd`/assets/data_uncorrected `pwd`/assets/modelBuilder_data `pwd`/assets/recipes `pwd`/assets/data_uncorrected
```

(RRID: SCR_016158)

