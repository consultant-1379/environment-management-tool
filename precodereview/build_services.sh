#!/bin/bash

function build_services() {

    echo "************************************"
    echo "*        Building Services         *"
    echo "************************************"
    echo "time docker-compose -f docker-compose-sandbox.yml build"
    time docker-compose -f docker-compose-sandbox.yml build
    if [[ $? -ne 0 ]]; then
        exit 1
    fi

}

########################
#     SCRIPT START     #
########################
build_services