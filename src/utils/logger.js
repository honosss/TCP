const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/tcp-server.log' })
  ]
});

const mqttLogger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json() // Log dưới dạng JSON
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/mqtt-json.log' })
  ]
});

module.exports = {
  logger,
  mqttLogger
};