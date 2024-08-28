'use strict';

const app = require('express')();
const serverPort = 8181;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_docs/swagger.json');

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(serverPort);
