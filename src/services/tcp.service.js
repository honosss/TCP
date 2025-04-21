const net = require('net');
const config = require('../config/server.config');
const TCPController = require('../controllers/tcp.controller');
const SocketHelper = require('../helpers/socket.helper');
const logger = require('../utils/logger');

class TCPServer {
  constructor() {
    this.socketManager = SocketHelper.manageSockets();
  }

  start() {
    this.server = net.createServer(config.tcp.options);
    
    this.server.on('error', (err) => this._handleServerError(err));
    this.server.on('connection', (socket) => this._handleConnection(socket));
    
    this.server.listen(config.tcp.port, config.tcp.host, () => {
      logger.info(`TCP Server running on ${config.tcp.host}:${config.tcp.port}`);
    });

  }
  stop() {
    return new Promise((resolve) => {
      // Đóng tất cả kết nối client
      this.socketManager.getAll().forEach(socket => {
        socket.destroy();
      });

      // Đóng server
      this.server.close(() => {
        logger.info('TCP Server ended');
        resolve();
      });
    });
  }
  _handleServerError(err) {
    logger.error('Server error:', err);
    process.exit(1);
  }

  async _handleConnection(socket) {
    this.socketManager.add(socket);
    //logger.info(`New connection: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.on('error', (err) => this._handleSocketError(err, socket));
    socket.on('close', () => this._handleClose(socket));
    socket.on('data', async (data) => await this._handleData(data, socket));
  }

  _handleSocketError(err, socket) {
    logger.error(`Socket error from ${socket.remoteAddress}:`, err);
    this.socketManager.remove(socket);
  }

  _handleClose(socket) {
    logger.info(`Connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
    this.socketManager.remove(socket);
  }

  async _handleData(data, socket) {
    try {
      // Log thông tin client và dữ liệu nhận được
      logger.info(`Data from ${socket.remoteAddress}:${socket.remotePort} - ${data.toString()}`);
      const controller = new TCPController(socket);
      const response = await controller.handleData(data);
      
      if (response) {
        socket.write(response);
        // Có thể log cả dữ liệu gửi đi nếu cần
      logger.debug(`Response to ${socket.remoteAddress}:${socket.remotePort} - ${response.toString()}`);
      }
    } catch (err) {
      logger.error('Error processing data:', err);
    }
  }
}

module.exports = TCPServer;
