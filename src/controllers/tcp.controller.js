const DeviceModel = require('../models/device.model');
const { formatDateTime } = require('../helpers/date.helper');
const { processFileData } = require('../helpers/file.helper');
const fs = require('fs');

class TCPController {
  constructor(socket) {
    this.socket = socket;
    
  }

  handleData(dataBuffer) {
    try {
      let dataStr;
      const endIdx = dataBuffer.indexOf('#');
      if (endIdx === -1) {
        dataStr = dataBuffer.toString('utf-8');
      } else {
        dataStr = dataBuffer.toString('utf-8', 0, endIdx + 1);
      }
      
      if (this.isTimeCommand(dataStr)) {
        return this.handleTimeCommand(dataStr);
      }
      
      if (this.isDataFile(dataStr)) {
        return this.handleDataFile(dataStr);
      }
      // Nếu dữ liệu không khớp với bất kỳ cấu trúc hợp lệ nào, ghi log dữ liệu đó
      this.logInvalidData(dataStr);

    } catch (err) {
      throw err;
    }
  }

  isTimeCommand(dataStr) {
    return dataStr.startsWith('$CMD05');
  }

  async handleTimeCommand(dataStr) {
    const deviceId = DeviceModel.extractId(dataStr);
    const { date, time } = formatDateTime();
    return `$CMD05,${deviceId},TIME,${date},${time}#AB***`;
  }

  isDataFile(dataStr) {
    return dataStr.startsWith('$09');
  }

  async handleDataFile(dataStr) {
    const fileInfo = DeviceModel.extractFileInfo(dataStr);
    await processFileData(fileInfo);
    //return 'DATA_RECEIVED';
  }
  logInvalidData(dataStr) {
    const ipAddress = this.socket.remoteAddress;
    console.log(`Invalid data from ${ipAddress}: ${dataStr}`);
    const logPath = 'logs/invalid_data.log';
    const logEntry = `${formatDateTime()} - ${ipAddress} - ${dataStr}`;
   // console.log("Dữ liệu không hợp lệ:", dataStr);
    fs.appendFile(logPath, logEntry + "\n", (err) => {
      if (err) console.error("Lỗi khi ghi log dữ liệu không hợp lệ:", err);
    });
  }

}

module.exports = TCPController;