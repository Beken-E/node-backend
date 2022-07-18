const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../config/config');
const FluentTransport = require('./fluent');
const fs = require('fs');
const path = require('path');
const os = require('os');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const fluentLogPrefix = process.env.FLUENT_LOG_PREFIX;

const fluentLoggerConfig = {
  host: process.env.FLUENT_HOST,
  port: process.env.FLUENT_PORT,
  timeout: Number(process.env.FLUENT_TIMEOUT),
  requireAckResponse: true
};

function createLogFolder() {

  let msFilesPath = '';
  const msFilesBasePath = 'msdata';
  const serviceName = process.env.APP_NAME;

  const winHomeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  
  if (os.platform() === 'win32') {
      msFilesPath = winHomeDir + '\\Documents\\' + msFilesBasePath + '\\' + serviceName + '\\';
  }  
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
      msFilesPath = '/' + msFilesBasePath + '/' + serviceName + '/';
  }

  const logFolder = path.join(msFilesPath, 'logs');

  fs.mkdirSync(logFolder, {recursive: true});
  
  return logFolder;
}

const logFolder = createLogFolder();

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    //config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error', 'info', 'debug'],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    //new FluentTransport(fluentLogPrefix, fluentLoggerConfig),
    new winston.transports.DailyRotateFile({
      dirname: logFolder,
      filename: `${process.env.APP_NAME}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      stderrLevels: ['error', 'info', 'debug'],
      prettyPrint : true,
      timestamp   : true,
    })
  ],
});

module.exports = logger;
