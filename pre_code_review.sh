#!/bin/bash

export COMPOSE_PROJECT_NAME="emttest"
GIT_BRANCH="temporary"
GIT_CMD="env -i git"

function get_changed_files() {
    ${GIT_CMD} branch -D ${GIT_BRANCH}
    ${GIT_CMD} checkout -b ${GIT_BRANCH}
    ${GIT_CMD} pull "${GERRIT_MIRROR}"/OSS/com.ericsson.oss.ci.rtd/environment-management-tool "${GERRIT_REFSPEC}"
    ${GIT_CMD} checkout master
    ${GIT_CMD} diff --name-only master..${GIT_BRANCH}  --diff-filter=ACMR > diff.txt
    ${GIT_CMD} checkout ${GIT_BRANCH}
    files_changed=$(cat < diff.txt)
    echo -e "INFO : the modified files are:\n ${files_changed}"
}

function run_tests() {
    echo "COMMAND: time docker-compose build"
    time docker-compose build
    if [[ $? -ne 0 ]]; then
        exit 1
    fi

    echo "*****************************************"
    echo "*        Running Express tests          *"
    echo "*****************************************"
    echo -e "\n"
    echo "COMMAND: time docker-compose run --rm express /bin/sh tests/expressTests.sh ${files_changed} --force-recreate"
    time docker-compose run --rm express /bin/sh tests/expressTests.sh "${files_changed}" --force-recreate
    if [[ "$?" -ne 0 ]]; then
        echo "====================================="
        echo "ERROR : The Express tests have failed"
        echo "====================================="
        echo -e "\n"
        exit_code=1
    else
        echo "==========================================="
        echo "SUCCESS : All the Express tests have passed"
        echo "==========================================="
        echo -e "\n"
    fi

    echo "*****************************************"
    echo "*        Running Angular tests          *"
    echo "*****************************************"
    echo -e "\n"
    echo "COMMAND: time docker-compose run --rm angular /bin/sh src/tests/angularTests.sh ${files_changed} --force-recreate"
    time docker-compose run --rm angular /bin/sh src/tests/angularTests.sh "${files_changed}" --force-recreate
    if [[ "$?" -ne 0 ]]; then
        echo "====================================="
        echo "ERROR : The Angular tests have failed"
        echo "====================================="
        echo -e "\n"
        exit_code=1
    else
        echo "==========================================="
        echo "SUCCESS : All the Angular tests have passed"
        echo "==========================================="
        echo -e "\n"
    fi

    running=$(docker ps -a -q | wc -l)
    if [[ "${running}" -gt "0" ]]; then
        echo "INFO: Killing containers"
        docker rm -f $(docker ps -a -q)
    fi

    time docker-compose down -v

    if [[ ${exit_code} -ne 0 ]]; then
        echo "============================================================================="
        echo "ERROR : Some of the tests have failed. For more information please look above"
        echo "============================================================================="
        echo -e "\n"
        exit 1
    fi
}

########################
#     SCRIPT START     #
########################
get_changed_files
run_tests