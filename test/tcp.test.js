const TCPServer = require('../src/services/tcp.service');
const DeviceModel = require('../src/models/device.model');
const { expect } = require('chai');
require('dotenv').config()
const net = require('net');

// const port = process.env.TCP_PORT;
// const host = process.env.TCP_IP;
const port = '3000';
const host = '192.168.0.166';
const option ={
        allowHalfOpen: 'false',
        pauseOnConnect : 'false',
        noDelay :'false',
        keepAlive : 'true',
        keepAliveInitialDelay : 1000 }
const server = net.createServer([option]);
server.listen(port, host, () => {
console.log('TCP Server is running on port ' + port + '.');
});