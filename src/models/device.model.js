class DeviceModel {
    static extractId(dataStr) {
      const devicePart = dataStr.slice(7, dataStr.indexOf('*'));
      return devicePart.split(',')[0];
    }
  
    static extractFileInfo(dataStr) {
      const fileName = this._generateFileName(dataStr);
      const subDir = this._getSubDirectory(dataStr);
      const content = dataStr.substring(dataStr.indexOf('*') + 1, dataStr.indexOf('#'));
      
      return { fileName, subDir, content };
    }
  
    static _generateFileName(dataStr) {
      const filePart = dataStr.slice(4, dataStr.indexOf('*') + 1);
      const timePart = '20' + filePart.substring(filePart.indexOf(',') + 1, filePart.indexOf('*'));
      const prefix = dataStr.slice(4, dataStr.indexOf('*') - 13);
      
      return `${prefix}_${timePart}.txt`;
    }
  
    static _getSubDirectory(dataStr) {
      const hasSubFolder = dataStr.slice(4, dataStr.indexOf('*')).lastIndexOf('_') >= 5;
      return hasSubFolder ? dataStr.slice(4, dataStr.lastIndexOf(',')) : null;
    }
  }
  
  module.exports = DeviceModel;