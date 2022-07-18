const oracledb = require('oracledb');
const logger = require('../config/logger');

const numRows = 500;
let pool;

class ConnectionCloseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConnectionCloseError';
    }
}

class IsNotResultSetError extends Error {
    constructor(message) {
        super(message);
        this.name = 'IsNotResultSetError';
    }
}

function createPool(config) {
    return new Promise((resolve, reject) => {
        oracledb.createPool(
            config,
            (err, p) => {
                if (err) {
                    return reject(err);
                }

                pool = p;
                resolve(pool);
            }
        );
    });
}

module.exports.createPool = createPool;

function terminatePool() {
    return new Promise((resolve, reject) => {
        logger.info(`Database logs. ${toString(pool._logStats())}`);
        if (pool) {
            pool.terminate(err => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        } else {
            resolve();
        }
    });
}

module.exports.terminatePool = terminatePool;

function getPool() {
    return pool;
}

module.exports.getPool = getPool;

function getConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                __health = 'bad';
                logger.error(`Соединение с базой не создано. Ошибка: ${toString(err)}`);
                return reject(err);
            }
            logger.info(`Соединение с базой создано.`);
            resolve(connection);
        });
    });
}

module.exports.getConnection = getConnection;

function execute(sql, bindParams, options, connection) {
    return new Promise((resolve, reject) => {
        connection.execute(sql, bindParams, options, (err, results) => {
            if (err) {
                return reject(err);
            }

            resolve(results);
        });
    });
}

module.exports.execute = execute;

function releaseConnection(connection) {
    connection.release(err => {
        if (err) {
            logger.error(`Соединение с базой не закрыто. Ошибка ${toString(err)}`);
            // Throw new ConnectionCloseError();
        }
        logger.info(`Соединение с базой закрыто.`);
    });
}

module.exports.releaseConnection = releaseConnection;

function doConnect(sql, bindParams, rType = 1) {
    const options = {};
    options.isAutoCommit = true;
    options.outFormat = oracledb.OBJECT;
    return new Promise((resolve, reject) => {
        getConnection()
            .then(connection => {
                execute(sql, bindParams, options, connection)
                    .then(result => {
                        if (rType === 1) {
                            resolve(result.outBinds);
                            logger.info('Вызов execute успешный.');
                            process.nextTick(() => {
                                releaseConnection(connection);
                            });
                        }
                        else if (rType === 2) {
                            result.outBinds.r_recordset.getRows(10000).then(function (row) {
                                resolve(row);
                                logger.info(`Вызов execute успешный.`);
                                process.nextTick(() => {
                                    releaseConnection(connection);
                                });
                            });

                        } else if (Object.prototype.hasOwnProperty.call(result.outBinds.ret, 'getRows')) {
                            fetchRowsFromRS(connection, result.outBinds.ret, numRows).then(rows => {
                                logger.info(`Вызов execute успешный.`);
                                resolve(rows);
                            })
                            .catch(err => {
                                reject(err);
                            });
                        } else {
                            const err = new IsNotResultSetError();
                            reject(err);
                            logger.info(`Ответ result.outBinds.ret не имеет свойство getRows. ${toString(err)}`);
                            process.nextTick(() => {
                                releaseConnection(connection);
                            });
                        }
                    })
                    .catch(err => {
                        reject(err);

                        logger.error(`Ошибка при попытке вызвать execute. Ошибка: ${toString(err)}`);
                        process.nextTick(() => {
                            releaseConnection(connection);
                        });
                    });
            })
            .catch(err => {
                __health = 'bad';
                logger.error(`Ошибка при попытке вызвать execute. Ошибка: ${toString(err)}`);
                reject(err);
            });
    });
}
module.exports.doConnect = doConnect;

function fetchRowsFromRS(connection, resultSet, numRows) {
    return new Promise((resolve, reject) => {
        resultSet.getRows(
        numRows,
        (err, rows) => {
            if (err) {
                reject(err);
                doClose(connection, resultSet);
            } else if (rows.length === 0) {
                doClose(connection, resultSet);
            } else if (rows.length > 0) {
                rows = rows.map(item => {     // Перевод данных в нижний регистр
                    for (const key in item) {
                        const lower = key.toLowerCase();
                        if (lower !== key) { // Check if it already wasn't uppercase
                            item[lower] = item[key];
                            delete item[key];
                        }
                    }
                    return item;
                });
                resolve(rows);
                fetchRowsFromRS(connection, resultSet, numRows);
            }
        });
    });
}

function doClose(connection, resultSet) {
    resultSet.close(
    err => {
        if (err) {
            logger.error(`Ошибка при попытке закрыть resultSet. Ошибка ${toString(err)}`);
        }
        process.nextTick(() => {
            releaseConnection(connection);
        });
    });
}

function streamLob(lob) {
    return new Promise((resolve, reject) => {
        var r_clob = '';

        if (lob === null) {
            logger.info('Lob пустой');
            resolve(null);
        }else{
            if (lob.type === oracledb.CLOB) {
                lob.setEncoding('utf8');  // set the encoding so we get a 'string' not a 'buffer'
            }

            lob.on('error', err => {
                logger.error(`Ошибка при попытке чтения streamLob. ${toString(err)}`);
                reject(err);
            });

            lob.on('data', chunk => {
                console.log({level: 'debug', label: 'database', message: 'clob.on \'data\' event.  Got %d bytes of data',  data: chunk.length});
                // Build up the string.  For larger LOBs you might want to print or use each chunk separately
                r_clob += chunk; // or use Buffer.concat() for BLOBS
            });

            lob.on('end', () => {
                console.log({level: 'debug', label: 'database', message: 'clob.on \'end\' event.'});
                resolve(r_clob);
                process.nextTick(() => {
                    lob.close();
                });
            });

            lob.on('close', () => {
                console.log({level: 'debug', label: 'database', message: 'clob.on \'close\' event'});
            });
        }
    });
}

const initPool = () => {
    const dbconfig = {
        user: process.env.ORA_SCHEMA,
        password: process.env.ORA_PASS,
        connectString: process.env.ORA_CONN_STRING,
        poolMax: Number(process.env.ORA_POOL_MAX),
        poolMin: Number(process.env.ORA_POOL_MIN),
        queueRequests: true,
        _enableStats  : true,
    };

  // необходимо убрать, временная заглушка
  if (process.platform === 'win32') {
    try {
      oracledb.initOracleClient({libDir: 'C:\\instantclient_19_10'});   // note the double backslashes
    } catch (err) {
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
    }
  }

  createPool(dbconfig)
    .then(() => {
        logger.info('Пул соединений в базу создан');
    })
    .catch(err => {
        global.__health = 'bad';
        logger.error(`Ошибка при подключении к оракл. ${err}`);
        process.exit(0);
    });
}

module.exports.initPool = initPool;

module.exports.streamLob = streamLob;

module.exports.oracledb = oracledb;

