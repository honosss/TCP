const mqtt = require('mqtt');
const config = require('../config/server.config');

const client = mqtt.connect(process.env.MQTT_BROKER, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  });

// Thêm phương thức publish dùng Promise
client.publishAsync = (topic, message) => {
  return new Promise((resolve, reject) => {
    client.publish(topic, message, { qos: 0 }, (err) => {
      err ? reject(err) : resolve();
    });
  });
};

module.exports = client;