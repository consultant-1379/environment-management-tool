const Bunyan = require('bunyan');
const ElasticSearch = require('bunyan-elasticsearch');
const Mask = require('./mask');

let logger;

if (process.env.NODE_ENV === 'PROD') {
  const esStream = new ElasticSearch({
    indexPattern: '[expresslogs-]YYYY.MM.DD',
    type: 'logs',
    host: process.env.ELASTICSEARCH_HOST,
    keepAlive: true,
  });

  esStream.on('error', (err) => {
    console.log('Elasticsearch Stream Error:', err.stack);
  });

  logger = Bunyan.createLogger({
    name: 'Express Logs',
    streams: [
      { stream: process.stdout },
      { stream: esStream },
    ],
    serializers: Bunyan.stdSerializers,
    source: `EMT ${process.env.NODE_ENV}`,
  });
} else {
  logger = Bunyan.createLogger({
    name: 'Express Logs',
    streams: [
      { stream: process.stdout },
    ],
  });
}

module.exports = new Mask(logger);
