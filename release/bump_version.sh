#!/bin/bash

echo "COMMAND: docker run --rm -v $PWD:/app -w /app armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/treeder/bump:1.2.11 --filename VERSION patch"
docker run --rm -v $PWD:/app -w /app armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/treeder/bump:1.2.11 --filename VERSION patch
if [[ "$?" -ne 0 ]]; then
    exit 1
fi

export IMAGE_VERSION=`cat VERSION`
echo "CHART_VERSION=$IMAGE_VERSION" > artifact.properties