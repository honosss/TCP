require('dotenv').config();

module.exports = {
  tcp: {
    host: process.env.TCP_IP ,
    port: process.env.TCP_PORT ,
    options: {
      allowHalfOpen: false,
      pauseOnConnect: false,
      noDelay: true,
      keepAlive: true,
      keepAliveInitialDelay: 1000
    }
  },
  paths: {
    baseDataDir: process.env.DATA_DIR ,
    defaultSubDir: process.env.DATA_DIR_SUB ,
  }
};