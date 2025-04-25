const path = require('path');

class DeviceMQTTModel {
  /**
   * Trích xuất metadata từ tên file có cấu trúc: [Code]_[Details]_[Timestamp].txt
   * Ví dụ:
   * - "BD_CONGTYTNHHCHYANGSHEN_20250227000000.txt" => { code: "BD", details: "CONGTYTNHHCHYANGSHEN", timestamp: "20250227000000" }
   * - "TN_KTNN_TTH2_20250227000000.txt" => { code: "TN", details: "KTNN_TTH2", timestamp: "20250227000000" }
   */
  static extractMetadata(filename) {
    try {
      const basename = path.basename(filename, '.txt');
      const parts = basename.split('_');

      if (parts.length < 2) {
        throw new Error('Invalid filename format: Not enough parts');
      }

      // Tìm vị trí của timestamp (14 chữ số) từ cuối mảng
      let timestampIndex = -1;
      for (let i = parts.length - 1; i >= 0; i--) {
        if (this.validateTimestamp(parts[i])) {
          timestampIndex = i;
          break;
        }
      }

      if (timestampIndex === -1) {
        throw new Error('Timestamp not found');
      }

      const timestamp = parts[timestampIndex];
      const code = parts[0];
      const details = parts.slice(1, timestampIndex).join('_'); // Ghép các phần còn lại

      return { code, details, timestamp };
    } catch (err) {
      throw new Error(`Metadata extraction failed: ${err.message}`);
    }
  }

  /**
   * Kiểm tra timestamp có đúng định dạng 14 chữ số (YYYYMMDDHHmmss)
   */
  static validateTimestamp(timestamp) {
    return /^\d{14}$/.test(timestamp);
  }

  /**
   * Tạo tên file theo cấu trúc MQTT
   * @param {string} code - Mã định danh (ví dụ: BD, TN)
   * @param {string} details - Thông tin chi tiết (có thể chứa dấu _)
   * @param {string} timestamp - Định dạng YYYYMMDDHHmmss
   */
  static generateFilename(code, details, timestamp) {
    if (!this.validateTimestamp(timestamp)) {
      throw new Error('Invalid timestamp format');
    }
    return `${code}_${details}_${timestamp}.txt`;
  }
}

module.exports = DeviceMQTTModel;