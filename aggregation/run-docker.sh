#!/bin/bash

ONOS_VOLUME=$PWD

if [[ $(docker images -q openwpm) == "" ]]; then
    echo "===> OpenWPM docker image not present!"
    echo "===> Building OpenWPM docker image(may take few minutes)..."
    docker build -f ./OpenWPM/Dockerfile -t openwpm ./OpenWPM
else
    echo "===> OpenWPM docker image already present"
fi

echo "===> Running OpenWPM docker image..."
docker run -v $ONOS_VOLUME:/root/Desktop --shm-size=4g -it openwpm python3 /root/Desktop/aggregate.py 1 /root/Desktop/input/sites.txt /root/Desktop/output/onos-crawl.sqlite
