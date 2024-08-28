const KeycloakAdmin = require('keycloak-admin').default;
const logger = require('./../../logger/logger');

const adminUser = {
  username: `${process.env.KEYCLOAK_USER}`,
  password: `${process.env.KEYCLOAK_PASSWORD}`,
  grantType: 'password',
  clientId: 'emt',
  clientSecret: '059b1ae0-fb4e-4149-a91e-8c302f2a9ea3',
};

const kcAdminClient = new KeycloakAdmin({
  baseUrl: 'http://keycloak:8080/auth',
});

async function retrieveRolesAssociatedWithUser(req, res) {
  const logMessage = 'GET /retrieveRolesAssociatedWithUser';
  try {
    await kcAdminClient.auth(adminUser);
    const user = await kcAdminClient.users.findOne({
      username: req.params.param,
    });
    if (user.length === 0) {
      return res.status(200).send(['No user found']);
    }
    const userRoles = await kcAdminClient.users.listRealmRoleMappings({
      id: user[0].id,
    });
    return res.status(200).send({
      userId: user[0].id,
      roles: userRoles,
    });
  } catch (errorRetrievingRolesAssociatedWithUser) {
    logger.error(logMessage, 'Failed to retrieve role(s) for the user', errorRetrievingRolesAssociatedWithUser);
    return res.status(500).send(['Failed to retrieve user role mappings!']);
  }
}

async function retrieveUser(req, res) {
  const logMessage = 'GET /retrieveUser';
  try {
    await kcAdminClient.auth(adminUser);

    const user = await kcAdminClient.users.findOne({
      username: req.params.param,
    });
    if (user.length === 0) {
      logger.info(logMessage, 'Specified user not found');
      return res.status(404).send(['Specified User not found!']);
    }
    return res.status(200).json(user);
  } catch (errorRetrievingUser) {
    logger.error(logMessage, 'Failed to retrieve user', errorRetrievingUser);
    return res.status(500).send(['Failed to retrieve user!']);
  }
}

async function retrieveAllRoles(req, res) {
  const logMessage = 'GET /retrieveAllRoles';
  try {
    await kcAdminClient.auth(adminUser);

    const roles = await kcAdminClient.roles.find();
    return res.status(200).json(roles);
  } catch (errorRetrievingRoles) {
    logger.error(logMessage, 'Failed to retrieve roles', errorRetrievingRoles);
    return res.status(500).send(['Failed to retrieve roles!']);
  }
}

async function updateKeycloakUserRoles(req, res) {
  const pathInfo = 'PUT /updateRoles';
  const roleDetails = req.body.roleDetails ? req.body.roleDetails : req.body;
  if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
    return res.status(412).json({
      message: 'Username is not specified',
    });
  }
  const { username } = req.body;
  const loggingTags = { path: pathInfo, signum: username };
  try {
    await kcAdminClient.auth(adminUser);
    const user = {
      id: roleDetails.userId,
      roles: roleDetails.rolesToAdd,
    };

    await kcAdminClient.users.addRealmRoleMappings(user);
    user.roles = roleDetails.rolesToRemove;
    await kcAdminClient.users.delRealmRoleMappings(user);
    logger.info(loggingTags, `${username} successfully updated the roles for ${roleDetails.username}`);
    return res.status(200).send(['Keycloak user roles updated!']);
  } catch (errorUpdatingKeycloakUserRoles) {
    logger.error(loggingTags, `${username} failed to update roles for the user ${roleDetails.username}`,
      errorUpdatingKeycloakUserRoles);
    return res.status(400).send(['Failed to update keycloak user roles!']);
  }
}

module.exports.retrieveRolesAssociatedWithUser = retrieveRolesAssociatedWithUser;
module.exports.updateKeycloakUserRoles = updateKeycloakUserRoles;
module.exports.retrieveUser = retrieveUser;
module.exports.retrieveAllRoles = retrieveAllRoles;
