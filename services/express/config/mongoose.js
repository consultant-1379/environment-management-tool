const mongoose = require('mongoose');

// MongoDB URL from the docker-compose file
const dbHost = 'mongodb://database/mean-docker';

// Connect to mongodb
mongoose.connect(dbHost);
