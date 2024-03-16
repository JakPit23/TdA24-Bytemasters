const fs = require("fs");
const util = require("util");
const Config = require("./Config");

class Logger {
    static logLevel = null;
    /**
     * @type {fs.WriteStream}
     */
    static logFile = null;

    /**
     * @readonly
     */
    static Colors = {
        Uncolorize: (val) => val.replace(/\x1B\[\d+m/gi, ''),
        Reset: '\x1b[0m',
        Bright: '\x1b[1m',
        Dim: '\x1b[2m',
        Italic: '\x1b[3m',
        Underscore: '\x1b[4m',
        Blink: '\x1b[5m',
        Reverse: '\x1b[7m',
        Hidden: '\x1b[8m',
      
        Fg: {
          Black: '\x1b[30m',
          Red: '\x1b[31m',
          Green: '\x1b[32m',
          Yellow: '\x1b[33m',
          Blue: '\x1b[34m',
          Magenta: '\x1b[35m',
          Cyan: '\x1b[36m',
          White: '\x1b[37m',
          Crimson: '\x1b[38m',
        },
      
        Bg: {
          Black: '\x1b[40m',
          Red: '\x1b[41m',
          Green: '\x1b[42m',
          Yellow: '\x1b[43m',
          Blue: '\x1b[44m',
          Magenta: '\x1b[45m',
          Cyan: '\x1b[46m',
          White: '\x1b[47m',
          Crimson: '\x1b[48m',
        },
    }

    /**
     * @typedef {Object} LogType
     * @property {string} color
     * @property {string} output
     */

    /**
     * @readonly
     * @type {Object<LogType>}
     */
    static Type = {
        Core: {
            color: Logger.Colors.Fg.Magenta,
            output: "CORE"
        },
        Database: {
            color: Logger.Colors.Fg.Cyan,            
            output: "DATABASE"
        },
        Watchdog: {
            color: Logger.Colors.Fg.Red,
            output: "WATCHDOG"
        },
        Webserver: {
            color: Logger.Colors.Fg.Green,
            output: "WEBSERVER"
        },
        UserManager: {
            color: `${Logger.Colors.Bright}${Logger.Colors.Fg.Blue}`,
            output: "USER MANAGER"
        },
        LecturerManager: {
            color: `${Logger.Colors.Bright}${Logger.Colors.Fg.Yellow}`,
            output: "LECTURER MANAGER"
        },
        TagManager: {
            color: Logger.Colors.Fg.Blue,
            output: "TAG MANAGER"
        },
        EmailClient: {
            color: Logger.Colors.Fg.Yellow,
            output: "EMAIL CLIENT"
        }
    }

    /**
     * @typedef {Object} LogLevel
     * @property {number} level
     * @property {Function} callback
     * @property {string} color
     * @property {string} output
     */

    /**
     * @type {Object}
     * @property {LogLevel} trace
     * @property {LogLevel} debug
     * @property {LogLevel} info
     * @property {LogLevel} warn
     * @property {LogLevel} error
     */
    static LogLevels = Object.freeze({
        trace: {
            level: -2,
            callback: console.debug,
            color: Logger.Colors.Fg.Yellow,
            output: "TRACE"
        },
        debug: {
            level: -1,
            callback: console.debug,
            color: Logger.Colors.Fg.Yellow,
            output: "DEBUG"
        },
        info: {
            level: 0,
            callback: console.info,
            color: `${Logger.Colors.Bright}${Logger.Colors.Fg.Blue}`,
            output: "INFO"
        },
        warn: {
            level: 1,
            callback: console.warn,
            color: `${Logger.Colors.Bright}${Logger.Colors.Fg.Yellow}`,
            output: "WARN"
        },
        error: {
            level: 2,
            callback: console.error,
            color: `${Logger.Colors.Bright}${Logger.Colors.Fg.Red}`,
            output: "ERROR"
        }
    });

    /**
     * @private
     */
    static createLogFile() {
        if (process.argv.includes("--dev")) {
            return;
        }
       
        if (!fs.existsSync("./logs")) {
            Logger.info(Logger.Type.Core, "Creating logs directory");
            fs.mkdirSync("./logs");
        }

        const dateString = Logger.buildDatePrefix({ prefix: { date: "-" }, year: true, month: true, day: true });
        
        let fileName = `./logs/${dateString}.log`;
        let fileId = 1;
        while (fs.existsSync(fileName)) {
            fileName = `./logs/${dateString}-${fileId}.log`;
            fileId++;
        }

        Logger.debug(Logger.Type.Core, `Creating log file "&c${fileName}&r"`);
        Logger.logFile = fs.createWriteStream(fileName, { flags: "a" });
    }

    /**
     * @returns {string}
     */
    static getLogLevel = () => Object.keys(Logger.LogLevels).find(key => Logger.LogLevels[key] === Logger.logLevel);

    /**
     * @param {string} value
     * @throws {Error}
     */
    static setLogLevel(value) {
        if (!Logger.LogLevels[value]) {
            throw new Error(`Invalid log level '${value}', valid levels are '${Object.keys(Logger.LogLevels).join("','")}'`);
        }

        Logger.logLevel = Logger.LogLevels[value];
    }

    /**
     * @param {LogType} logType
     * @param {LogLevel} logLevel
     * @returns {string}
     */
    static buildLogLinePrefix(logType, logLevel) {
        const dateString = Logger.buildDatePrefix({ year: true, month: true, day: true, hour: true, minute: true, second: true });
        return `[${dateString}] [${logLevel.color}${logLevel.output}${Logger.Colors.Reset}] [${logType.color}${logType.output}${Logger.Colors.Reset}]`;
    }

    /**
     * @param {object} options 
     * @param {boolean} options.year 
     * @param {boolean} options.month 
     * @param {boolean} options.day 
     * @param {boolean} options.hour 
     * @param {boolean} options.minute 
     * @param {boolean} options.second 
     * @param {object} options.prefix 
     * @param {string} options.prefix.date 
     * @param {string} options.prefix.time 
     * @returns {string}
     */
    static buildDatePrefix(options) {
        const prefix = {
            date: options.prefix?.date || "/",
            time: options.prefix?.time || ":",
        };

        const date = {
            year: new Date().getFullYear(),
            month: (new Date().getMonth() + 1).toString().padStart(2, 0),
            day: new Date().getDate().toString().padStart(2, 0),
            hour: new Date().getHours().toString().padStart(2, 0),
            minute: new Date().getMinutes().toString().padStart(2, 0),
            second: new Date().getSeconds().toString().padStart(2, 0),
        };

        let dateString = "";
        if (options.year) {
            dateString += `${date.year}${prefix.date}`; 
        }

        if (options.month) {
            dateString += `${date.month}${prefix.date}`;
        }
        
        if (options.day) {
            dateString += `${date.day}`;
        }

        if (options.hour) {
            dateString += ` ${date.hour}${prefix.time}`;
        }

        if (options.minute) {
            dateString += `${date.minute}${prefix.time}`;
        }

        if (options.second) {
            dateString += `${date.second}`;
        }

        return dateString;
    }

    /**
     * @param {LogType} type
     * @param {LogLevel} level
     * @param {...any} args
     * @private
     */
    static _log(type, level, ...args){
        if (Logger.logLevel.level > level.level) {
            return;
        }

        const logLinePrefix = Logger.buildLogLinePrefix(type, level);
        const logLine = [logLinePrefix, ...args].map(arg => {
            if (arg == logLinePrefix) {
                return arg;
            }
            
            if (typeof arg === 'string') {
                return arg.replaceAll("&c", level.color).replaceAll("&r", Logger.Colors.Reset)
            }

            return (args[0]?.includes?.('=') ? '' : '\n') + util.inspect(arg, { depth: Infinity });
        }).join(' ');

        level['callback'](logLine);
     
        if (Logger.logFile) {
            Logger.logFile.write(`${logLine.replace(/\u001b\[.*?m/g, '')}\n`);
        }
    }
    
    /**
     * @param {string} type
     * @param {...any} args
     */
    static trace = (type, ...args) => Logger._log(type, Logger.LogLevels.trace, ...args);

    /**
     * @param {string} type
     * @param {...any} args
     */
    static debug = (type, ...args) => Logger._log(type, Logger.LogLevels.debug, ...args);

    /**
     * @param {string} type
     * @param {...any} args
     */
    static info = (type, ...args) => Logger._log(type, Logger.LogLevels.info, ...args);

    /**
     * @param {string} type
     * @param {...any} args
     */
    static warn = (type, ...args) => Logger._log(type, Logger.LogLevels.warn, ...args);

    /**
     * @param {string} type
     * @param {...any} args
     */
    static error = (type, ...args) => Logger._log(type, Logger.LogLevels.error, ...args);
}

Logger.setLogLevel(Config.logLevel);
Logger.createLogFile();

module.exports = Logger;