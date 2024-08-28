#!/bin/sh

get_changed_express_files() {
    js_files=""
    ts_files=""
    for each_script_name in ${modified_files}; do
        if [ $(echo ${each_script_name} | grep "services\/express") ]; then
            each_script_name=$(echo ${each_script_name} | sed 's/services\/express/\/usr\/src\/app/g')
            if [ $(echo -n ${each_script_name} | tail -c3) == ".js" ]; then
                js_files="${js_files} ${each_script_name} "
            elif [ $(echo -n ${each_script_name} | tail -c3) == ".ts" ]; then
                ts_files="${ts_files} ${each_script_name} "
            fi
        fi
    done
}

run_eslint_on_express_files() {
    echo "*****************************************"
    echo "*       Express : Running ESLINT        *"
    echo "*****************************************"
    echo -e "\n"
    if [ -z "${js_files}" ]; then
        echo "======================================"
        echo "INFO: No JavaScript files were changed"
        echo "======================================"
        echo -e "\n"
    else
        ./node_modules/.bin/eslint ${js_files}
        if [ "$?" -ne 0 ]; then
            echo "============================================================"
            echo "ERROR : The ESLint for the changed express files has errors."
            echo "============================================================"
            echo -e "\n"
            exit_code=1
        else
            echo "================================"
            echo "SUCCESS : No ESLint errors found"
            echo "================================"
            echo -e "\n"
        fi
    fi
}


run_tslint_on_express_files() {
    echo "*****************************************"
    echo "*       Express : Running TSLINT        *"
    echo "*****************************************"
    echo -e "\n"
    if [ -z "${ts_files}" ]; then
        echo "======================================="
        echo "INFO: No TypeScript files were changed "
        echo "======================================="
        echo -e "\n"
    else
        ./node_modules/.bin/tslint ${ts_files}
        if [ "$?" -ne 0 ]; then
            echo "============================================================"
            echo "ERROR : The TSLint for the changed express files has errors."
            echo "============================================================"
            exit_code=1
        else
            echo "================================"
            echo "SUCCESS : No TSLint errors found"
            echo "================================"
        fi
    fi
}

run_unit_testcases() {
    echo "*****************************************"
    echo "*    Express : Running Unit tests       *"
    echo "*****************************************"
    echo -e "\n"
    npm run test
    if [ "$?" -ne 0 ]; then
        echo "==========================================="
        echo "ERROR : The express unit tests have failed "
        echo "==========================================="
        exit_code=1
    else
        echo "============================================="
        echo "INFO : All the express unit tests have passed"
        echo "============================================="
    fi
}

validate_exit_code() {
    if [ ${exit_code} -ne 0 ]; then
        exit 1
    fi
}

########################
#     SCRIPT START     #
########################
modified_files=$1
get_changed_express_files
run_eslint_on_express_files
run_tslint_on_express_files
run_unit_testcases
validate_exit_code