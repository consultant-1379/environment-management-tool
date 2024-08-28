#!/bin/bash
# Script used to backup MongoDB data from EMT
# To be run nightly at 11:59pm via crontab entry
# 59 23 * * * sh /environment-management-tool/backup_retention_policy.sh

BACKUP_LOCATION=/export/PS/EMT
TODAYS_BACKUPS=$BACKUP_LOCATION/`date "+%Y%m%d"`
RETENTION_PERIOD=$((5*24*60)) #5 days

echo "Performing daily backup of mongoDB database to $TODAYS_BACKUPS.zip"
zip -r $TODAYS_BACKUPS $TODAYS_BACKUPS*
if [[ $? -ne 0 ]]
then
  exit 1
fi
echo "Removing hourly backup folders as they are no longer needed."
rm -rf $TODAYS_BACKUPS*/
echo "Removing backups older than 5 days from $BACKUP_LOCATION."
`find $BACKUP_LOCATION -name "*.zip" -mmin +"$RETENTION_PERIOD" | xargs rm -rf`
