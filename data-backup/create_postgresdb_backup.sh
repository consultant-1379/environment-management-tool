#!/bin/bash
MONTHLY="${1}"
BACKUP_ROOT="/export/PS"
SUCCESSFUL_BACKUPS_FILE="${BACKUP_ROOT}/successful_backups.txt"

if [[ -n "${MONTHLY}" ]]; then
    KEYCLOAK_BACKUP_DIR="${BACKUP_ROOT}/emt_keycloak_monthly_backup"
    POSTGRES_BACKUP_DIR="${BACKUP_ROOT}/emt_postgres_monthly_backup"
else
    KEYCLOAK_BACKUP_DIR="${BACKUP_ROOT}/emt_keycloak_backups"
    POSTGRES_BACKUP_DIR="${BACKUP_ROOT}/emt_postgres_backups"
fi
echo "Backing up keycloak database to directory ${KEYCLOAK_BACKUP_DIR}"
mkdir -p "${KEYCLOAK_BACKUP_DIR}"
exit_code=$?
if [[ ${exit_code} -ne 0 ]]; then
    echo "mkdir of ${KEYCLOAK_BACKUP_DIR} failed. Exiting..."
    exit 1
fi
echo -e "\n"

chmod 777 "${KEYCLOAK_BACKUP_DIR}"
echo "Running command: docker exec -i emtproduction_postgres_1 pg_dump -U ${POSTGRES_USERNAME} -Fc keycloak > ${KEYCLOAK_BACKUP_DIR}/keycloakdb.dump"
docker exec -i emtproduction_postgres_1 pg_dump -U "${POSTGRES_USERNAME}" -Fc keycloak > "${KEYCLOAK_BACKUP_DIR}/keycloakdb.dump"
exit_code=$?
if [[ ${exit_code} -ne 0 ]]; then
    echo "postgres DB dump of keycloak database failed. Exiting..."
    curl -X POST https://fem4s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/Send_EMT_Backups_Notifications/build --user thunderbee:"${FEM4S11_API_TOKEN}" --data-urlencode json='{"parameter": [{"name":"daily_mail", "value":"NO"}]}'
    exit 1
fi

echo "postgres DB dump of keycloak database successful."
echo "${KEYCLOAK_BACKUP_DIR}" >> "${SUCCESSFUL_BACKUPS_FILE}"
echo -e "\n"

echo "Backing up postgres database to directory ${POSTGRES_BACKUP_DIR}"
mkdir -p "${POSTGRES_BACKUP_DIR}"
exit_code=$?
if [[ ${exit_code} -ne 0 ]]; then
    echo "mkdir of ${POSTGRES_BACKUP_DIR} failed. Exiting..."
    exit 1
fi
echo -e "\n"

chmod 777 "${POSTGRES_BACKUP_DIR}"
echo "Running command: docker exec -i emtproduction_postgres_1 pg_dump -U ${POSTGRES_USERNAME} -Fc postgres > ${POSTGRES_BACKUP_DIR}/postgresdb.dump"
docker exec -i emtproduction_postgres_1 pg_dump -U "${POSTGRES_USERNAME}" -Fc postgres > "${POSTGRES_BACKUP_DIR}/postgresdb.dump"
exit_code=$?
if [[ ${exit_code} -ne 0 ]]; then
    echo "postgres DB dump of postgres database failed. Exiting..."
    curl -X POST https://fem4s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/Send_EMT_Backups_Notifications/build --user "thunderbee:${FEM4S11_API_TOKEN}" --data-urlencode json='{"parameter": [{"name":"daily_mail", "value":"NO"}]}'
    exit 1
fi

echo "postgres DB dump of postgres database successful"
echo "${POSTGRES_BACKUP_DIR}" >> "${SUCCESSFUL_BACKUPS_FILE}"
echo -e "\n"