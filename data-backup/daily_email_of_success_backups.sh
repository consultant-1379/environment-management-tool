#!/bin/bash
# Script used to send Email to the team with successful backups info
# To be run nightly at 11:35pm via crontab entry
# 35 23 * * * sh /environment-management-tool/daily_email_of_success_backups.sh

BACKUP_ROOT=/export/PS/EMT
SUCCESSFUL_BACKUPS_FILE="${BACKUP_ROOT}"/successful_backups.txt

echo "Triggering Jenkins Job to send E-Mail to the team"

curl -X POST https://fem4s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/Send_EMT_Backups_Notifications/build --user thunderbee:"${FEM4S11_API_TOKEN}"  --form bkfile=@"${SUCCESSFUL_BACKUPS_FILE}" --form json='{"parameter": [{"name":"backup_file", "file":"bkfile"}, {"name":"daily_mail", "value":"YES"}]}'

echo "Removing file of successful backups : ${SUCCESSFUL_BACKUPS_FILE}."

rm -rf "${SUCCESSFUL_BACKUPS_FILE}"
