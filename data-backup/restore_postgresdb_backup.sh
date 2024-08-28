#!/bin/bash
POSTGRES_BACKUP_DIR="${1}"
KEYCLOAK_BACKUP_DIR="${2}"
if [[ -z "${POSTGRES_BACKUP_DIR}" ]] || [[ ! -f "${POSTGRES_BACKUP_DIR}" ]]; then
    echo "You must specify a valid directory to restore the postgres database from"
    echo "Example of valid directory:"
    echo "/export/PS/emt_postgres_backups/postgresdb.dump"
    echo "Argument passed in incorrectly was:"
    echo "${POSTGRES_BACKUP_DIR}"
    exit 1
fi

echo "Restoring postgres database from directory ${POSTGRES_BACKUP_DIR} ..."
echo "Command: docker cp ${POSTGRES_BACKUP_DIR} emtproduction_postgres_1:/postgresdb.dump"
docker cp "${POSTGRES_BACKUP_DIR}" emtproduction_postgres_1:/postgresdb.dump
echo "Command: docker exec -i emtproduction_postgres_1 pg_restore --verbose --clean --no-acl --no-owner -h localhost -U ${POSTGRES_USERNAME} -d postgres postgresdb.dump"
docker exec -i emtproduction_postgres_1 pg_restore --verbose --clean --no-acl --no-owner -h localhost -U "${POSTGRES_USERNAME}" -d postgres postgresdb.dump
echo -e "\n" 

if [[ -z "${KEYCLOAK_BACKUP_DIR}" ]] || [[ ! -f "${KEYCLOAK_BACKUP_DIR}" ]]; then
    echo "You must specify a valid directory to restore the keycloak database from"
    echo "Example of valid directory:"
    echo "/export/PS/emt_keycloak_backups/keycloakdb.dump"
    echo "Argument passed in incorrectly was:"
    echo "${KEYCLOAK_BACKUP_DIR}"
    exit 1
fi

echo "Restoring keycloak database from directory ${KEYCLOAK_BACKUP_DIR} ..."
echo "Command: docker cp ${KEYCLOAK_BACKUP_DIR} emtproduction_postgres_1:/keycloakdb.dump"
docker cp "${KEYCLOAK_BACKUP_DIR}" emtproduction_postgres_1:/keycloakdb.dump
echo "Command: docker exec -i emtproduction_postgres_1 pg_restore --verbose --clean --no-acl --no-owner -h localhost -U ${POSTGRES_USERNAME} -d keycloak keycloakdb.dump"
docker exec -i emtproduction_postgres_1 pg_restore --verbose --clean --no-acl --no-owner -h localhost -U "${POSTGRES_USERNAME}" -d keycloak keycloakdb.dump
echo -e "\n"

echo "Restarting keycloak service in order to pick up restored postgres data..."
echo "Command: docker restart emtproduction_keycloak_1"
docker restart emtproduction_keycloak_1
echo "Restart completed. Please verify if restore was successful."
