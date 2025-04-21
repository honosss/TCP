function formatDateTime() {
    const now = new Date();
    
    const pad = (num) => num.toString().padStart(2, '0');
    
    return {
      date: `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`,
      time: `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    };
  }
  
  module.exports = {
    formatDateTime
  };