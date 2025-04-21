module.exports = {
    apps: [{
      name: "tcp",          // Tên ứng dụng trong PM2
      script: "./app.js",       // File chính để chạy
      instances: 1,                // Số instances (đặt 1 nếu không cần cluster)
      autorestart: true,           // Tự động khởi động lại nếu crash
      watch: false,                // Tắt chế độ watch (nên dùng cho production)
      max_memory_restart: "500M",  // Tự động restart nếu dùng quá 500MB RAM
      exec_mode: "fork",           // Chế độ chạy (fork hoặc cluster)
      log_date_format: "YYYY-MM-DD HH:mm:ss",  // Định dạng thời gian trong log
      error_file: "./logs/error.log",  // File log lỗi
      out_file: "./logs/out.log",      // File log output
      merge_logs: true,            // Gộp log từ các instances
    }]
  };