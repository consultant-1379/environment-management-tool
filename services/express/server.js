const express = require('express');
const bodyParser = require('body-parser');
const events = require('events');

const app = express();
const cors = require('cors');
const server = require('http').Server(app);

const io = require('socket.io')(server, {
  path: '/socket.io',
});

const exporter = require('./exporter');
require('./timers/eventHandlers/timer.events');
require('./teamInventoryToolBackup/eventHandlers/teamInventoryToolBackup.events');
require('./config/mongoose');

const deploymentRoutes = require('./deployments/routes/deployment.routes');
const timerRoutes = require('./timers/routes/timer.routes');
const sessionRoutes = require('./sessions/routes/session.routes');
const timePeriodRoutes = require('./timePeriods/routes/timePeriod.routes');
const mailerRoutes = require('./mailer/routes/mailer.routes');
const dmtRoutes = require('./deployments/routes/deployment-dmt.routes');
const userRoutes = require('./userAdministration/routes/user.routes');
const teamInventoryToolBackupRoutes = require('./teamInventoryToolBackup/routes/teamInventoryToolBackup.routes');
const amtelRoutes = require('./amtel/routes/amtel.routes');
const ansibleRoutes = require('./ansible/routes/ansible.routes');
const jenkinsRoutes = require('./jenkins/routes/jenkins.routes');
const environmentPasswordInformationRoutes = require('./environmentPasswordInformation/routes/environmentPasswordInformation.routes');

/**
 * The below arguments start the app counter functions for express
 */
app.use(exporter.requestCounters);
app.use(exporter.responseCounters);

/**
 * Enable metrics endpoint
 */
exporter.injectMetricsRoute(app);

/**
 * Enable collection of default metrics
 */
exporter.startCollection();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

// Cross Origin middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, POST, PUT, OPTIONS');
  next();
});
app.use(cors());

// Set our api routes
app.use('/deployments', deploymentRoutes);
app.use('/timers', timerRoutes);
app.use('/sessions', sessionRoutes);
app.use('/time-periods', timePeriodRoutes);
app.use('/mailer', mailerRoutes);
app.use('/dmt', dmtRoutes);
app.use('/user', userRoutes);
app.use('/team-inventory-tool-backup', teamInventoryToolBackupRoutes);
app.use('/amtel', amtelRoutes);
app.use('/ansible', ansibleRoutes);
app.use('/environment-password-information', environmentPasswordInformationRoutes);
app.use('/jenkins', jenkinsRoutes);

const port = 3000;
app.set('port', port);

io.on('connection', () => {
  const eventEmitter = new events.EventEmitter();
  eventEmitter.on('deploymentUpdate', (msg) => {
    io.emit('deploymentEvent', msg);
  });
  exports.emitter = eventEmitter;
});

if (!module.parent) {
  server.listen(port, () => console.log(`API running on localhost:${port}`));
}

module.exports = server;
module.exports.io = io;
