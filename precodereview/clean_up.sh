#!/bin/bash

function delete_diff_txt() {
    echo "INFO: Deleting diff.txt"
    rm diff.txt
}

function clean_up() {
    
    running=$(docker ps -a -q | wc -l)
    if [[ ${running} -gt 0 ]]; then
        echo "INFO: Killing containers"
        docker rm -f $(docker ps -a -q)
    fi

    echo "INFO: docker-compose down executed"
    time docker-compose down -v

}

########################
#     SCRIPT START     #
########################
delete_diff_txt
clean_up