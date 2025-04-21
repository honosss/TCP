const TCPServer = require('./src/services/tcp.service');
const logger = require('./src/utils/logger');
const config = require('./src/config/server.config');

const server = new TCPServer();
server.start();

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});