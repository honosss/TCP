const path = require('path');
const fs = require('fs');
const config = require('../config/server.config');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function processFileData(fileInfo) {
  // Chỉ sử dụng baseDataDir, bỏ qua subDir
  const fullPath = config.paths.baseDataDir; 
  ensureDirectoryExists(fullPath); // Chỉ tạo baseDataDir nếu chưa tồn tại
  const filePath = path.join(fullPath, fileInfo.fileName);
  await fs.promises.writeFile(filePath, fileInfo.content, 'UTF8');
}

module.exports = {
  processFileData
};