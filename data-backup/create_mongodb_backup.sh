#!/bin/bash
BACKUP_ROOT=/export/PS/EMT
SUCCESSFUL_BACKUPS_FILE=${BACKUP_ROOT}/successful_backups.txt
BACKUP_FOLDER_NAME=$(date "+%Y%m%d%H%M%S")
BACKUP_DIR=${BACKUP_ROOT}/${BACKUP_FOLDER_NAME}

echo "Backing up mongodb database to directory ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"
exit_code=$?
if [[ "${exit_code}" -ne "0" ]]; then
  exit 1
fi

chmod 777 "${BACKUP_DIR}"
docker run -v "${BACKUP_DIR}":/backup --network=emtproduction_default armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/mongo:3.6.2 mongodump --db=mean-docker --out /backup --host database
exit_code=$?
if [[ "${exit_code}" -ne "0" ]]; then
  curl -X POST https://fem4s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/Send_EMT_Backups_Notifications/build --user thunderbee:"${FEM4S11_API_TOKEN}" --data-urlencode json='{"parameter": [{"name":"daily_mail", "value":"NO"}]}'
  exit 1
else
  echo "${BACKUP_FOLDER_NAME}" >> ${SUCCESSFUL_BACKUPS_FILE}
fi
