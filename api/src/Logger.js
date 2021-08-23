var appRoot = require('app-root-path');
var winston = require('winston');

const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}:] ${message}`;
  });

  // define the custom settings for each transport (file, console)
var options = {
    file: {
      level: 'warn',
      filename: `${appRoot}/logs/aibers-health-error.log`,
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      // maxsize: 5000, // 5KB
      maxFiles: 4,
    },
    // file1: {
    //   level: 'info',
    //   filename: `${appRoot}/logs/aibers-health-info.log`,
    //   handleExceptions: true,
    //   maxsize: 5242880, // 5MB
    //   maxFiles: 5,
    // },
    console: {
      level: 'debug',
      handleExceptions: true,
    },
  };

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        myFormat
    ),
    transports: [
        // new winston.transports.Console(options.console),
        new winston.transports.File(options.file)
    ]
});

// For APIs info
// const log = winston.createLogger({
//   format: winston.format.combine(
//       winston.format.timestamp(),
//       winston.format.json(),
//       myFormat
//   ),
//   transports: [
//       // new winston.transports.Console(options.console),
//       new winston.transports.File(options.file1)
//   ]
// });

module.exports = {
    logger
    // log,
}