const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const http = require('http')
const logger = require('./config/logger');

let server;
mongoose.set("strictQuery", false);
mongoose.connect(config.mongoose.url).then((data) => {
    // console.log(data)
    console.log('Connected to MongoDB');
  server = http.createServer(app).listen(config.port, () => {
    console.log(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

