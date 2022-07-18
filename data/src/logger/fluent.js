'use strict';
/**
 * winston transport support
 */
const FluentSender = require('fluent-logger');
/* eslint-disable-next-line node/no-extraneous-require */
const Transport = require('winston-transport');
const DEFAULT_TAG = 'winston';

module.exports = class FluentTransport extends Transport {
  constructor(_tag = DEFAULT_TAG, _options = {}) {
    super(_options);
    this.name = 'fluent';
    this.sender = new FluentSender.createFluentSender(_tag, _options);
    this.sender._setupErrorHandler();
  }

  
  log(logMsg, callback) {

    console.log('logMsgGGGGGGGGGGGGGGGGGGGGGGGGGGG', logMsg);

    setImmediate(() => {

        let logtype = 'E', msg=logMsg, subsource, num1, text1, date1, num2, text2, clientCode, reqCode, devMode;
        if (subsource === void 0) { subsource = null; }
        if (num1 === void 0) { num1 = null; }
        if (text1 === void 0) { text1 = null; }
        if (date1 === void 0) { date1 = null; }
        if (num2 === void 0) { num2 = null; }
        if (text2 === void 0) { text2 = null; }
        if (clientCode === void 0) { clientCode = null; }
        if (reqCode === void 0) { reqCode = null; }
        if (devMode === void 0) { devMode = null; }
        if (typeof logtype !== 'undefined' && logtype && msg != 'undefined' && msg) {
            var logLabel = 'debug';
            if (logtype == 'E')
                logLabel = 'error';
            if (logtype == 'I')
                logLabel = 'info';
            if (logtype == 'W')
                logLabel = 'warning';
            if (logtype == 'S')
                logLabel = 'stat';
            if (logtype.length != 1) {
                console.log('В функцию логирования передан некорректный тип лога: ' + logtype + ', заменен на D');
                logtype = 'E';
            }
            var logSubsource = null;
            if (subsource) {
                logSubsource = subsource.substring(0, 49);
                if (subsource.length > 50) {
                    console.log('В функцию логирования передан слишком длинный параметр subsource (max длина=50), значение будет обрезано');
                }
            }
            var logMsg = msg.substring(0, 65534);
            if (msg.length > 65534) {
                console.log('В функцию логирования передан слишком длинный параметр msg (max длина=65535), значение будет обрезано');
            }
            var logDateTime = moment().format("YYYY-MM-DD HH:mm:ss.SSSSSS");
            var logDateId = moment().format("YYYYMMDD");
            var logText1 = null;
            if (typeof text1 == 'object') {
                logText1 = JSON.stringify(text1);
            }
            else {
                logText1 = text1;
            }
            var logText2 = null;
            if (typeof text2 == 'object') {
                logText2 = JSON.stringify(text2);
            }
            else {
                logText2 = text2;
            }
            var devModeChar = null;
            if (exports.devMode != null && exports.devMode == true)
                devModeChar = 'Y';
            if (devMode != null && devMode == true)
                devModeChar = 'Y';
        }
        
        var logData = {
            "alog_date_id": logDateId,
            "alog_ip": hostIp,
            "alog_host": hostName,
            "alog_type": logtype,
            "alog_datetime": logDateTime,
            "alog_source": logSource,
            "alog_subsource": logSubsource,
            "alog_msg": logMsg,
            "alog_num1": num1,
            "alog_text1": logText1,
            "alog_date1": date1,
            "alog_num2": num2,
            "alog_text2": logText2,
            "alog_clnt_code": clientCode,
            "alog_req_code": reqCode,
            "alog_dev_mode": devModeChar
        };

      this.sender.emit(logData, (error) => {

        if (error) {
          this.emit('error', info);
          callback && callback(error, false);
        } else {
          this.emit('logged', info);
          callback && callback(null, true);
        }
      });
    });
  }

  _final(callback) {
    if (!this.sender) return process.nextTick(callback);

    this.sender.end(null, null, () => {
      this.sender = null;
      callback();
    });
  }

  log(logtype, msg, subsource, num1, text1, date1, num2, text2, clientCode, reqCode, devMode) {
    if (subsource === void 0) { subsource = null; }
    if (num1 === void 0) { num1 = null; }
    if (text1 === void 0) { text1 = null; }
    if (date1 === void 0) { date1 = null; }
    if (num2 === void 0) { num2 = null; }
    if (text2 === void 0) { text2 = null; }
    if (clientCode === void 0) { clientCode = null; }
    if (reqCode === void 0) { reqCode = null; }
    if (devMode === void 0) { devMode = null; }
    if (typeof logtype !== 'undefined' && logtype && msg != 'undefined' && msg) {
        var logLabel = 'debug';
        if (logtype == 'E')
            logLabel = 'error';
        if (logtype == 'I')
            logLabel = 'info';
        if (logtype == 'W')
            logLabel = 'warning';
        if (logtype == 'S')
            logLabel = 'stat';
        if (logtype.length != 1) {
            console.log('В функцию логирования передан некорректный тип лога: ' + logtype + ', заменен на D');
            logtype = 'D';
        }
        var logSubsource = null;
        if (subsource) {
            logSubsource = subsource.substring(0, 49);
            if (subsource.length > 50) {
                console.log('В функцию логирования передан слишком длинный параметр subsource (max длина=50), значение будет обрезано');
            }
        }
        var logMsg = msg.substring(0, 65534);
        if (msg.length > 65534) {
            console.log('В функцию логирования передан слишком длинный параметр msg (max длина=65535), значение будет обрезано');
        }
        var logDateTime = moment().format("YYYY-MM-DD HH:mm:ss.SSSSSS");
        var logDateId = moment().format("YYYYMMDD");
        var logText1 = null;
        if (typeof text1 == 'object') {
            logText1 = JSON.stringify(text1);
        }
        else {
            logText1 = text1;
        }
        var logText2 = null;
        if (typeof text2 == 'object') {
            logText2 = JSON.stringify(text2);
        }
        else {
            logText2 = text2;
        }
        var devModeChar = null;
        if (exports.devMode != null && exports.devMode == true)
            devModeChar = 'Y';
        if (devMode != null && devMode == true)
            devModeChar = 'Y';
        var logData = {
            "alog_date_id": logDateId,
            "alog_ip": hostIp,
            "alog_host": hostName,
            "alog_type": logtype,
            "alog_datetime": logDateTime,
            "alog_source": logSource,
            "alog_subsource": logSubsource,
            "alog_msg": logMsg,
            "alog_num1": num1,
            "alog_text1": logText1,
            "alog_date1": date1,
            "alog_num2": num2,
            "alog_text2": logText2,
            "alog_clnt_code": clientCode,
            "alog_req_code": reqCode,
            "alog_dev_mode": devModeChar
        };
        if (isLoggerConfigured && exports.logMode == "fluent") {
            logger.emit(logLabel, logData);
            if (logLabel == 'error') {
                console.error(logtype + ' - ' + logSubsource + ': ' + logMsg);
            }
            if (logLabel == 'warning') {
                console.log(logtype + ' - ' + logSubsource + ': ' + logMsg);
            }
        }
        else {
            // console.log('Логгер fluent не инициализирован, отображение лога в консоли');
            if (logLabel == 'error') {
                console.error(logtype + ' - ' + logSubsource + ': ' + logMsg);
            }
            else {
                console.log(logtype + ' - ' + logSubsource + ': ' + logMsg);
            }
        }
    }
    else {
        console.error('Некорректные параметры функции логирования');
    }
};

};


