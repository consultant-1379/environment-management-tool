#!/bin/bash

function run_express_tests() {
    files_changed=$(cat < diff.txt)
    echo "*****************************************"
    echo "*        Running Express tests          *"
    echo "*****************************************"
    echo -e "\n"
    echo "COMMAND: time docker-compose -f docker-compose-sandbox.yml run --rm express /bin/sh tests/expressTests.sh ${files_changed} --force-recreate"
    time docker-compose -f docker-compose-sandbox.yml run --rm express /bin/sh tests/expressTests.sh "${files_changed}" --force-recreate
    if [[ $? -ne 0 ]]; then
        echo "====================================="
        echo "ERROR : The Express tests have failed"
        echo "====================================="
        exit 1
    else
        echo "==========================================="
        echo "SUCCESS : All the Express tests have passed"
        echo "==========================================="
    fi

}

########################
#     SCRIPT START     #
########################
run_express_tests