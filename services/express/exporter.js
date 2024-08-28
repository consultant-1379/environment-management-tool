const nodeJSClientExporter = require('prom-client');

const responseTime = require('response-time');


/**
 * A Prometheus counter that counts the invocations of the different HTTP verbs
 * e.g. a GET and a POST call will be counted as 2 different calls
 */
const numOfRequests = new nodeJSClientExporter.Counter({
  name: 'numOfRequests',
  help: 'Number of requests made',
  labelNames: ['method'],
});
module.exports.numOfRequests = numOfRequests;


/**
 * A Prometheus counter that counts the Sessions created on EMT
 */
const sessionsCreated = new nodeJSClientExporter.Counter({
  name: 'sessionsCreated',
  help: 'Sessions created on EMT',
  labelNames: ['teamName', 'userName'],
});
module.exports.sessionsCreated = sessionsCreated;

/**
 * A Prometheus counter that counts the deployments gone into quarantine state
 */
const deploymentsInQuarantine = new nodeJSClientExporter.Counter({
  name: 'deploymentsInQuarantine',
  help: 'Number of deployments gone into quarantine state on EMT',
  labelNames: ['jobName', 'deploymentName'],
});
module.exports.deploymentsInQuarantine = deploymentsInQuarantine;

/**
 * A Prometheus counter that counts the invocations with different paths
 * e.g. /foo and /bar will be counted as 2 different paths
 */
const pathsTaken = new nodeJSClientExporter.Counter({
  name: 'pathsTaken',
  help: 'Paths taken in the app',
  labelNames: ['path'],
});
module.exports.pathsTaken = pathsTaken;

/**
 * A Prometheus summary to record the HTTP method, path, response code and response time
 */
const responses = new nodeJSClientExporter.Summary({
  name: 'responses',
  help: 'Response time in millis',
  labelNames: ['method', 'path', 'status'],
});
module.exports.responses = responses;

/**
 * This function will start the collection of metrics and should be called from within in the main js file
 */
module.exports.startCollection = () => {
  nodeJSClientExporter.collectDefaultMetrics();
};

/**
* This function will increase the counter that counts the number of Sessions created on teams
*/
module.exports.teamSessionCounters = (teamNames) => {
  sessionsCreated.inc({ teamName: teamNames });
};

/**
* This function will increase the counter that counts the number of Sessions created on users
*/
module.exports.userSessionCounters = (userNames) => {
  sessionsCreated.inc({ userName: userNames });
};

/**
* This function will increase the counter that counts the deployments gone into quarantine state
*/
module.exports.deploymentsInQuarantineCounters = (deploymentNames, jobNames) => {
  deploymentsInQuarantine.inc({ deploymentName: deploymentNames, jobName: jobNames });
};

/**
 * This function increments the counters that are executed on the request side of an invocation
 * Currently it increments the counters for numOfPaths and pathsTaken
 */
module.exports.requestCounters = (req, res, next) => {
  if (req.path !== '/metrics') {
    numOfRequests.inc({ method: req.method });
    pathsTaken.inc({ path: req.path });
  }
  next();
};

/**
 * This function increments the counters that are executed on the response side of an invocation
 * Currently it updates the responses summary
 */

module.exports.responseCounters = responseTime((req, res, time) => {
  if (req.url !== '/metrics') {
    responses.labels(req.method, req.url, res.statusCode).observe(time);
  }
});

/**
 * In order to have Prometheus get the data from this app a specific URL is registered
 */
module.exports.injectMetricsRoute = (app) => {
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', nodeJSClientExporter.register.contentType);
    res.end(nodeJSClientExporter.register.metrics());
  });
};
