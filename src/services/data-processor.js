const chokidar = require('chokidar');
const fs = require('fs/promises');
const path = require('path');
const mqttClient = require('../helpers/connectMqtt');
const config = require('../config/server.config');
const {mqttLogger} = require('../utils/logger');
const DeviceMQTTModel = require('../models/device.mqtt.model');

class DataProcessor {
  constructor(inputDir) {
    this.watcher = null;
    this.inputDir = inputDir;
  }

  async init() {
    // Kiểm tra các file đã có trong thư mục và xử lý chúng
    await this._checkExistingFiles();
    // Thiết lập file watcher để theo dõi file mới
    this._initFileWatcher();
    // Kiểm tra kết nối MQTT
    await this._testMqttConnection();
  }

  async _testMqttConnection() {
    return new Promise((resolve) => {
      mqttClient.on('connect', resolve);
      mqttClient.on('error', (err) => {
        mqttLogger.error('MQTT connection failed:', err);
        process.exit(1);
      });
    });
  }

  // Quét thư mục để kiểm tra các file đang tồn tại
  async _checkExistingFiles() {
    try {
      const files = await fs.readdir(this.inputDir);
      for (const file of files) {
        if (path.extname(file) === '.txt') {
          const filePath = path.join(this.inputDir, file);
          console.log(`Existing file: ${filePath} - processing...`);
          await this._processFile(filePath);
        }
      }
    } catch (err) {
      mqttLogger.error(`Error reading directory ${this.inputDir}:`, err);
    }
  }

  _initFileWatcher() {
    this.watcher = chokidar.watch(this.inputDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    }).on('add', (filePath) => {
      if (path.extname(filePath) === '.txt') {
        console.log(`File added: ${filePath}`);
        this._processFile(filePath);
      }
    });
  }

  async _processFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = this._parseContent(content);
      const metadata = this._extractMetadata(filePath);

      await this._publishData(data, metadata);
      await this._archiveFile(filePath, metadata);

      mqttLogger.info(`Processed: ${path.basename(filePath)}`);
    } catch (err) {
      mqttLogger.error(`Error processing ${filePath}:`, err);
    }
  }

  _parseContent(content) {
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.split(/\s+/));
  }

  _extractMetadata(filePath) {
  // Lấy tên file không có đuôi .txt
  const filename = path.basename(filePath, '.txt');
  // Giả sử tên file có định dạng "DEVICEID_TIMESTAMP"
  const parts = filename.split('_');
  const timestamp = parts.pop(); // Phần cuối cùng là timestamp
  const deviceId = parts.join('_'); // Phần còn lại là deviceId đầy đủ
  return { deviceId, timestamp };
  }

  async _publishData(data, { deviceId, timestamp }) {
    // Tạo mảng chứa các đối tượng dữ liệu từ từng dòng trong file
    const formattedData = data.reduce((acc, row) => {
      if (row.length !== 5 && row.length !== 6) {
        mqttLogger.warn(`Skipping invalid row: ${row.join(' ')}`);
        return acc;
      }
  
      let entry;
      if (row.length === 5) {
        // File 5 cột: [CN, V, U, Time, St]
        entry = {
          CN: row[0],
          V: parseFloat(row[1]),
          U: row[2],
          St: row[4] || '0'
        };
      } else if (row.length === 6) {
        // File 6 cột: [Station, CN, V, U, Time, St]
        entry = {
          STA: row[0],
          CN: row[1],
          V: parseFloat(row[2]),
          U: row[3],
          St: row[5] || '0'
        };
      }
      
      acc.push(entry);
      return acc;
    }, []);
  
    // Tạo payload JSON chứa toàn bộ dữ liệu trong file với 1 "Time" duy nhất (từ metadata)
    const payload = JSON.stringify({
      Type: "Tech09",
      Device_id: deviceId,
      Time: timestamp, // Global time của file
      Data: formattedData
    });
  
    const topic = 'SYS/AI_DATA';
    await mqttClient.publishAsync(topic, payload);
    console.log(payload);
    mqttLogger.debug(`Published: ${payload}`);
  }
  
  _createPayload(row, deviceId) {
    let payloadObject;
    if (row.length === 5) {
      // File 5 cột: [CN, V, U, Time, St] - Loại bỏ "Time"
      payloadObject = {
        Type: "Tech09",
        Device_id: deviceId,
        // Không gán Time ở đây vì sẽ dùng global
        Data: [{
          CN: row[0],
          V: parseFloat(row[1]),
          U: row[2],
          St: row[4] || '0'
        }]
      };
    } else if (row.length === 6) {
      // File 6 cột: [Station, CN, V, U, Time, St] - Loại bỏ "Time"
      payloadObject = {
        Type: "Tech09",
        Device_id: deviceId,
        Data: [{
          STA: row[0],
          CN: row[1],
          V: parseFloat(row[2]),
          U: row[3],
          St: row[5] || '0'
        }]
      };
    }
    return JSON.stringify(payloadObject);
  }

  async _archiveFile(filePath, { deviceId, timestamp }) {
    const archivePath = path.join(
      config.dataPaths.archive,
      deviceId,
      timestamp.slice(0, 4),
      timestamp.slice(4, 6),
      timestamp.slice(6, 8),
      path.basename(filePath)
    );

    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    await fs.rename(filePath, archivePath);
  }

  async shutdown() {
    if (this.watcher) this.watcher.close();
    mqttLogger.info('Data service stopped');
  }
}

module.exports = DataProcessor;