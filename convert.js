// convert.js
const DataProcessor = require('./src/services/data-processor');
const config = require('./src/config/server.config');
const {mqttLogger} = require('./src/utils/logger');
// Khởi tạo và chạy service xử lý dữ liệu
const dataProcessor = new DataProcessor(
  config.dataPaths.input,
  config.dataPaths.multi
);

dataProcessor.init()
  .then(() => {
    mqttLogger.info('Data conversion service started');
  })
  .catch((err) => {
    mqttLogger.error('Failed to start data service:', err);
    process.exit(1);
  });

// Xử lý tắt service
process.on('SIGINT', async () => {
  await dataProcessor.shutdown();
  process.exit(0);
});