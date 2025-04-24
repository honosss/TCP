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
      error_file: "./logs/tcp-error.log",  // File log lỗi
      out_file: "./logs/tcp-out.log",      // File log output
      merge_logs: true,            // Gộp log từ các instances
    },
    {
      name: "convert",              // Tên ứng dụng convert
      script: "./convert.js",       // File convert.js để chạy
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      exec_mode: "fork",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/convert-error.log",
      out_file: "./logs/convert-out.log",
      merge_logs: true,
    }
  ]
  };