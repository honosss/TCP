const path = require('path');
const fs = require('fs');
const config = require('../config/server.config');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function processFileData(fileInfo) {
  const fullPath = path.join(
    config.paths.baseDataDir,
    fileInfo.subDir || config.paths.defaultSubDir
  );
  
  ensureDirectoryExists(fullPath);
  
  const filePath = path.join(fullPath, fileInfo.fileName);
  fs.writeFileSync(filePath, fileInfo.content, 'UTF8');
}

module.exports = {
  processFileData
};