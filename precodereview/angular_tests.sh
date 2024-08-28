#!/bin/bash

function run_angular_tests() {
    files_changed=$(cat < diff.txt)
    echo "*****************************************"
    echo "*        Running Angular tests          *"
    echo "*****************************************"
    echo -e "\n"
    echo "time docker-compose run --rm angular /bin/sh src/tests/angularTests.sh ${files_changed} --force-recreate"
    time docker-compose run --rm angular /bin/sh src/tests/angularTests.sh "${files_changed}" --force-recreate
    if [[ $? -ne 0 ]]; then
        echo "====================================="
        echo "ERROR : The Angular tests have failed"
        echo "====================================="
        exit 1
    else
        echo "==========================================="
        echo "SUCCESS : All the Angular tests have passed"
        echo "==========================================="
    fi

}

########################
#     SCRIPT START     #
########################
run_angular_tests