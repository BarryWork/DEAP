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

Instead of building the docker container manually, you can also use the CI build on https://hub.docker.com/r/haukebartsch/deap/.

## Running the container

A script is provided to launch the container, [run](https://github.com/ABCD-STUDY/DEAP/blob/master/run).  For usage instructions, run it with no arguments.

Provide a directory that is outside of the docker container to store the volatile data (analysis scripts and new measures). At the first startup this directory should also contain a single Rds file which contains the data as processed by https://github.com/ABCD-STUDY/analysis-nda17.
```
mkdir -p assets
cp <data nda18.Rds> assets/
./run deap deap 80 `pwd`/assets
```

To visualize the development process of DEAP you can run gource:
```
gource --file-filter "MathJax-2.7.4" \
       --file-filter "ModelBuilder/js" \
       --file-filter "octicons" \
       --file-filter "node_modules" \
       --file-filter "ModelBuilder/css" \
       --file-filter "ace/" \
       --file-filter "pretty/" \
       -a 1 -1280x720 \
       --seconds-per-day 1 \
       -o - | ffmpeg -y -r 60 -f image2pipe \
       -vcodec ppm -i - -vcodec libx264 \
       -preset ultrafast -pix_fmt yuv420p \
       -crf 1 -threads 0 -bf 0 deap.mp4
```

(RRID: SCR_016158)

