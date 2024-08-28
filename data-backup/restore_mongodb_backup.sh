#!/bin/bash
BACKUP_DIR=$1
if [[ $BACKUP_DIR == "" ]] || [[ ! -d $BACKUP_DIR ]]
then
    echo "You must specify a valid directory to restore the database from"
    exit 1
fi
echo "Restoring mongodb database from directory $BACKUP_DIR"
docker run -it -v $BACKUP_DIR:/backup --network=emtproduction_default armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/mongo:3.6.2 mongorestore /backup --host database --drop
