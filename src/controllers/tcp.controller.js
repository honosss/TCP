const DeviceModel = require('../models/device.model');
const { formatDateTime } = require('../helpers/date.helper');
const { processFileData } = require('../helpers/file.helper');

class TCPController {
  constructor(socket) {
    this.socket = socket;
  }

  handleData(dataBuffer) {
    try {
      const dataStr = dataBuffer.toString('utf-8', 0, dataBuffer.indexOf('#') + 1);
      
      if (this.isTimeCommand(dataStr)) {
        return this.handleTimeCommand(dataStr);
      }
      
      if (this.isDataFile(dataStr)) {
        return this.handleDataFile(dataStr);
      }
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
}

module.exports = TCPController;