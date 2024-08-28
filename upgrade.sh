#!/bin/bash

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export COMPOSE_PROJECT_NAME="emtproduction"

time docker-compose -f docker-compose-production.yml pull || exit 1

${SCRIPTDIR}/create_mongodb_backup.sh

time docker-compose -f docker-compose-production.yml up -d || exit 1

docker system prune --force -a