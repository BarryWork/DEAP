FROM ubuntu:18.04

ARG DEBIAN_FRONTEND=noninteractive

#----------------------------------------------------------
# Install common dependencies and create default entrypoint
#----------------------------------------------------------
ENV LANG="en_US.UTF-8" \
    LC_ALL="C.UTF-8" \
    ND_ENTRYPOINT="/deap-startup.sh"

RUN apt-get update -qq && apt-get install -yq --no-install-recommends  \
    apache2 \
    apt-utils \
    build-essential \
    bzip2 \
    ca-certificates \
    cron \
    curl \
    ed \
    vim \
    gfortran \
    git \
    libblas-dev \
    liblapack-dev \
    locales \
    nodejs \
    npm \
    php7.2 \
    php7.2-curl \
    php7.2-mbstring \
    libapache2-mod-php7.2 \
    rsync \
    add-apt-key \
    wget \
    sudo \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && rm /var/www/html/index.html \
    && git clone https://github.com/ABCD-STUDY/DEAP.git /var/www/html \
    && cd /var/www/html \
    && cp /var/www/html/code/php/passwords.json_master /var/www/html/code/php/passwords.json \
    && chown www-data:www-data /var/www/html/code/php/passwords.json \
    && cp /var/www/html/code/php/AC_ndar_nih_gov.php /var/www/html/code/php/AC.php \
    && cp /var/www/html/applications/User/login_ndar_nih_gov.php /var/www/html/applications/User/login.php \
    && cd /var/www/html/code/js \
    && npm install . \
    && cd /var/www/html/applications/Ontology/searchServer \
    && npm install . \
    && cd /var/www/html/applications/ModelBuilder/runner \
    && npm install . \
    && cd /var/www/html/applications/Filter \
    && npm install . \
    && cd /var/www/html/applications/ModelBuilder/viewer \
    && chown -R www-data:www-data recipes \
    && groupadd processing -g 1000 \
    && useradd -ms /bin/bash processing -u 1000 -g 1000 -d /home/processing \
    && CRONTAB_DIR=/var/spool/cron/crontabs \
    && PROCESSING_CRONTAB=$CRONTAB_DIR/processing \
    && ROOT_CRONTAB=$CRONTAB_DIR/root \
    && echo '*/1 * * * * /usr/bin/node /var/www/html/applications/Ontology/searchServer/index.js >> /var/www/html/data/ABCD/logs/searchServer.log 2>&1' > $PROCESSING_CRONTAB \
    && echo '*/1 * * * * cd /var/www/html/applications/ModelBuilder/viewer/recipes; git add `ls *.json`; git commit -m "`date`"' >> $PROCESSING_CRONTAB \
    && echo '*/15 * * * * /var/www/html/applications/ModelBuilder/Rserve/run_rserve.sh >> /var/www/html/data/ABCD/logs/Rserve.log 2>&1' >> $ROOT_CRONTAB \
    && chown processing:crontab $PROCESSING_CRONTAB \
    && chown root:crontab $ROOT_CRONTAB \
    && chmod 0600 $PROCESSING_CRONTAB \
    && chmod 0600 $ROOT_CRONTAB \
    && sed -i '/session    required     pam_loginuid.so/c\#session    required   pam_loginuid.so' /etc/pam.d/cron \
    && sed -i '/post_max_size = 8M/cpost_max_size = 5000M' /etc/php/7.2/apache2/php.ini \
    && sed -i '/memory_limit = 128M/cmemory_limit = 1024M' /etc/php/7.2/apache2/php.ini \
    && sed -i '/; max_input_vars = 1000/cmax_input_vars = 100000' /etc/php/7.2/apache2/php.ini \
    && localedef --force --inputfile=en_US --charmap=UTF-8 C.UTF-8

RUN if [ ! -f "$ND_ENTRYPOINT" ]; then \
    echo '#!/usr/bin/env bash' >> $ND_ENTRYPOINT \
    && echo 'set +x' >> $ND_ENTRYPOINT \
    && echo 'if [ -z "$*" ]; then /usr/bin/env bash; else' >> $ND_ENTRYPOINT \
    && echo '  if [ "$1" == "start" ]; then' >> $ND_ENTRYPOINT \
    && echo '    echo "Start system services and apache...";' >> $ND_ENTRYPOINT \
    && echo '    mkdir -p /usr/local/;' >> $ND_ENTRYPOINT \
    && echo '  else $*;' >> $ND_ENTRYPOINT \
    && echo '  fi' >> $ND_ENTRYPOINT \
    && echo 'fi' >> $ND_ENTRYPOINT \
    && echo 'touch /var/www/html/applications/Ontology/searchServer/log.log' >> $ND_ENTRYPOINT \
    && echo 'chmod a+w /var/www/html/applications/Ontology/searchServer/log.log' >> $ND_ENTRYPOINT \
    && echo 'alias deap="cd /var/www/html/" >> /root/.bashrc;' >> $ND_ENTRYPOINT \
    && echo 'cron' >> $ND_ENTRYPOINT \
    && echo '/bin/bash /var/www/html/code/setup.sh;' >> $ND_ENTRYPOINT \
    && echo '/usr/bin/Rscript /var/www/html/applications/NewDataExpo/generator.R;' >> $ND_ENTRYPOINT \
    && echo '/usr/bin/Rscript /var/www/html/applications/code/setup_database1.R;' >> $ND_ENTRYPOINT \
    && echo 'sudo -u www-data /usr/bin/Rscript /var/www/html/applications/Scores/R/transfer.R;' >> $ND_ENTRYPOINT \
    && echo 'cp /var/www/html/data/ABCD/*.php /var/www/html/code/php/' >> $ND_ENTRYPOINT \
    && echo 'apachectl -D FOREGROUND' >> $ND_ENTRYPOINT \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    && echo "<Directory /var/www/html/>\n    Options -Indexes +FollowSymLinks\n    AllowOverride None\n    Require all granted\n</Directory>" >> /etc/apache2/apache2.conf \
    && echo "<FilesMatch \"\\.Rds\$\">\n    Require all denied\n</FilesMatch>" >> /etc/apache2/apache2.conf; \
    fi \
    && chmod -R 777 /deap-startup.sh

RUN apt-get update -qq && apt-get install -yq --no-install-recommends \
    r-base \
    r-cran-rserve \
    zlib1g-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/tmp/* \
    && Rscript -e 'install.packages("gamm4", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("rjson", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("stargazer", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("caret", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("OpenMx", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("knitr", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("MuMIn", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("https://cran.r-project.org/bin/macosx/el-capitan/contrib/3.4/MuMIn_1.42.1.tgz", repos=NULL, type="source")' \
    && Rscript -e 'install.packages("R.matlab", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("Rserve", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("foreach", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("doParallel", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("jsonlite", repos="https://cran.rstudio.com")' \
    && Rscript -e 'install.packages("tableone", repos="https://cran.rstudio.com")' 

#-------------------------------------------------------------------------------
# Install internal database (monetdb - column store mirrors data from ndaXX.Rds)
#-------------------------------------------------------------------------------
RUN echo -e "deb https://dev.monetdb.org/downloads/deb/ bionic monetdb\ndeb-src https://dev.monetdb.org/downloads/deb/ bionic monetdb\n" > /etc/apt/sources.list.d/monetdb.list \
    && wget --output-document=- https://www.monetdb.org/downloads/MonetDB-GPG-KEY | sudo apt-key add - \
    && apt-get update && apt-get install monetdb5-sql monetdb-client -yq \
    && echo -e "user=deap\npassword=`tr -cd '[:alnum:]' < /dev/urandom | fold -w10 | head -n1`\nlanguage=sql" > /root/.monetdb \
    && echo -e "user=monetdb\npassword=monetdb\nlanguage=sql" > /root/.monetdb_root \
    && monetdbd create /var/www/html/data/ABCD/DB1 \
    && monetdbd start /var/www/html/data/ABCD/DB1 \
    && monetdbd set port=11223 /var/www/html/data/ABCD/DB1 \
    && monetdbd set control="no" /var/www/html/data/ABCD/DB1 \
    && monetdb create abcd && monetdb start abcd && monetdb release abcd \
    && echo -e "CREATE USER \"deap\" WITH PASSWORD '"$(cat /root/.monetdb | grep password | cut -d'=' -f2)"' NAME 'DEAP User' SCHEMA \"sys\";\nCREATE SCHEMA \"deap\" AUTHORIZATION \"deap\";\nALTER USER \"deap\" SET SCHEMA \"deap\";" | DOTMONETDBFILE=/root/.monetdb_root mclient --port=11223 -d abcd

# toolkit required for code/setup_database1.R (imports the Rds to the database table abcd)
RUN apt-get update && apt-get install libcurl4-openssl-dev libxml2-dev libssl-dev -yq \
    && apt-get clean \
    && Rscript -e 'install.packages("httr")' \
    && Rscript -e 'install.packages("git2r")' \
    && Rscript -e 'install.packages("devtools")' \
    && Rscript -e 'install.packages("DBI")' \
    && Rscript -e 'devtools::install_github("hannesmuehleisen/MonetDBLite-R")'

#-------------------------------------------------------------------------------
# Create an example app testing the access to the database (python scikit-learn)
# Application: applications/hierarchical-clustering/
#-------------------------------------------------------------------------------
RUN cd /tmp/ && wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
    && sh Miniconda3-latest-Linux-x86_64.sh -b -p /opt/conda && source /opt/conda/bin/activate \
    && conda init bash && source ~/.bashrc && conda update -n base -c defaults conda -y \
    && conda create --name scikit-learn -y &&  conda activate scikit-learn -y \
    && conda install scikit-learn matplotlib -y && pip install pymonetdb

EXPOSE 80
ENTRYPOINT ["/deap-startup.sh"]
