
const fluent = require('fluent-logger');
/* eslint-disable-next-line node/no-extraneous-require */
const Transport = require('winston-transport');
const DEFAULT_TAG = 'winston';
const moment = require('moment');
const logger = require('fluent-logger');


module.exports = class FluentTransport extends Transport {
  constructor(_tag, _options) {
    super(_options);
    this.name = 'fluent';
    this.sender = new fluent.createFluentSender(_tag, _options);
    this.sender._setupErrorHandler();
  }

  log(logMsg, callback) {
    const type = logMsg.level;
    const msgO = logMsg.message;

    setImmediate(() => {

        let logtype = type, msg=msgO, subsource, num1, text1, date1, num2, text2, clientCode, reqCode, devMode;

        console.log('logtype', logtype);
        console.log('msg', msg);

        if (subsource === void 0) { subsource = null; }
        if (num1 === void 0) { num1 = null; }
        if (text1 === void 0) { text1 = null; }
        if (date1 === void 0) { date1 = null; }
        if (num2 === void 0) { num2 = null; }
        if (text2 === void 0) { text2 = null; }
        if (clientCode === void 0) { clientCode = null; }
        if (reqCode === void 0) { reqCode = null; }
        if (devMode === void 0) { devMode = null; }
        
            
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

        var hostIp = '192.168.43.204'; 
        var hostName = '192.168.43.204'; 
        let logSource = '192.168.43.204';
        logSubsource = '192.168.43.204';
        
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
    
        console.log('logData', logData);
    
        this.sender.emit(logData, (error) => {
        
            console.log('this.sender.emit error', error);
        // if (error) {
        //     this.emit('error', info);
        //     callback && callback(error, false);
        // } else {
        //     this.emit('logged', info);
        //     callback && callback(null, true);
        // }
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

};


