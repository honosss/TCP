// src/services/data-processor.js
const chokidar = require('chokidar');
const fs = require('fs/promises');
const path = require('path');
const mqttClient = require('../helpers/connectMqtt');
const arrayProcessor = require('../helpers/splice-array');
const config = require('../config/server.config');
const logger = require('../utils/logger');

class DataProcessor {
  constructor(inputDir, multiDir) {
    this.watchers = [];
    this.inputDir = inputDir;
    this.multiDir = multiDir;
  }

  async init() {
    this._initFileWatchers();
    await this._testMqttConnection();
  }

  async _testMqttConnection() {
    return new Promise((resolve) => {
      mqttClient.on('connect', resolve);
      mqttClient.on('error', (err) => {
        logger.error('MQTT connection failed:', err);
        process.exit(1);
      });
    });
  }

  _initFileWatchers() {
    this.watchers.push(
      chokidar.watch(this.inputDir)
        .on('add', (path) => this._processFile(path, 5))
    );

    this.watchers.push(
      chokidar.watch(this.multiDir)
        .on('add', (path) => this._processFile(path, 6))
    );
  }

  async _processFile(filePath, columns) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = this._parseContent(content, columns);
      const metadata = this._extractMetadata(filePath);

      await this._publishData(data, metadata, columns === 6);
      await this._archiveFile(filePath, metadata);

      logger.info(`Processed: ${path.basename(filePath)}`);
    } catch (err) {
      logger.error(`Error processing ${filePath}:`, err);
    }
  }

  _parseContent(content, columns) {
    // Tách từng dòng, loại bỏ dòng trống và dòng không đủ số cột
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && line[0] !== '#' && line[0] !== '$')
      .map(line => line.split(/\s+/)) // <-- tách theo mọi khoảng trắng (tab hoặc nhiều dấu cách)
      .filter(arr => arr.length >= columns);
  }
  _extractMetadata(filePath) {
    const filename = path.basename(filePath, '.txt');
    const parts = filename.split('_');
    const timestamp = parts.pop(); // phần cuối là timestamp
    const deviceId = parts.join('_'); // ghép lại phần còn lại thành deviceId đầy đủ
    return { deviceId, timestamp };
  }

  async _publishData(data, { deviceId }, isMulti) {
    for (const row of data) {
      const topic = 'SYS/AI_DATA';
      const payload = this._createPayload(row, deviceId, isMulti);
      console.log(payload); 
      await mqttClient.publishAsync(topic, payload);
      logger.debug(`Published: ${payload}`);
    }
  }

  _createPayload(row, deviceId, isMulti) {
    return JSON.stringify({
      Type: "Tech09",
      Device_id: isMulti ? `${deviceId}_${row[0]}` : deviceId,
      Time: row[3],
      Data: [{
        CN: row[1],
        V: parseFloat(row[2]),
        U: row[4],
        St: row[5] || '0'
      }]
    });
  }

  async _archiveFile(filePath, { deviceId, timestamp }) {
    const archivePath = path.join(
      config.dataPaths.archive,
      deviceId,
      timestamp.slice(0, 4),  // Year
      timestamp.slice(4, 6),  // Month
      timestamp.slice(6, 8),  // Day
      path.basename(filePath)
    );

    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    await fs.rename(filePath, archivePath);
  }

  async shutdown() {
    this.watchers.forEach(watcher => watcher.close());
    logger.info('Data service stopped');
  }
}

module.exports = DataProcessor;