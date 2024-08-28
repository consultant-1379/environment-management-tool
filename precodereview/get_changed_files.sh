#!/bin/bash

function get_changed_files() {
    echo "COMMAND: ${GIT_CMD} branch -D ${GIT_BRANCH}"
    ${GIT_CMD} branch -D ${GIT_BRANCH}
    echo "COMMAND: ${GIT_CMD} checkout -b ${GIT_BRANCH}"
    ${GIT_CMD} checkout -b ${GIT_BRANCH}
    echo "COMMAND: ${GIT_CMD} pull ${GERRIT_MIRROR}/OSS/com.ericsson.oss.ci.rtd/environment-management-tool ${GERRIT_REFSPEC}"
    ${GIT_CMD} pull "${GERRIT_MIRROR}"/OSS/com.ericsson.oss.ci.rtd/environment-management-tool "${GERRIT_REFSPEC}"
    echo "COMMAND: ${GIT_CMD} checkout master"
    ${GIT_CMD} checkout master
    echo "COMMAND: ${GIT_CMD} diff --name-only master..${GIT_BRANCH}  --diff-filter=ACMR > diff.txt"
    ${GIT_CMD} diff --name-only master..${GIT_BRANCH}  --diff-filter=ACMR > diff.txt
    echo "COMMAND: ${GIT_CMD} checkout ${GIT_BRANCH}"
    ${GIT_CMD} checkout ${GIT_BRANCH}
    files_changed=$(cat < diff.txt)
    echo -e "INFO : the modified files are:\n ${files_changed}"

}

########################
#     SCRIPT START     #
########################
get_changed_files
