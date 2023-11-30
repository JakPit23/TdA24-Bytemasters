const util = require("util");

class Logger {
    /**
     * @param {LogLevels} logLevel 
     */
    constructor(logLevel) {
        this.logLevel = logLevel;
    }

    /**
     * An enumeration of log types.
     * @readonly
     * @enum {string}
     */
    static Type = {
        Core: "core",
        Watchdog: "watchdog",
        Webserver: "webserver",
        LecturerManager: "lecturer manager",
        TagManager: "tag manager",
    }

    /**
     * LogLevels static property
     * @property {Object} trace - The trace log level with level and callback.
     * @property {Object} debug - The debug log level with level and callback.
     * @property {Object} info - The info log level with level and callback.
     * @property {Object} warn - The warn log level with level and callback.
     * @property {Object} error - The error log level with level and callback.
     * @returns {Object} The log levels.
     */
    static LogLevels = Object.freeze({
        "trace": {"level": -2, "callback": console.debug},
        "debug": {"level": -1, "callback": console.debug},
        "info": {"level": 0, "callback": console.info},
        "warn": {"level": 1, "callback": console.warn},
        "error": {"level": 2, "callback": console.error},
    });

    /**
     * Get the current log level.
     * @public
     * @returns {string} The current log level.
     */
    getLogLevel() {
        return Object.keys(Logger.LogLevels).find(key => {
            return Logger.LogLevels[key] === this.logLevel;
        });
    }

    /**
     * Set the log level to the specified value.
     * @public
     * @param {string} value - The log level to set.
     * @throws {Error} If the provided log level is invalid.
     */
    setLogLevel(value) {
        if (Logger.LogLevels[value] === undefined) {
            throw new Error(`Invalid log level '${value}', valid levels are '${Object.keys(Logger.LogLevels).join("','")}'`);
        } else {
            this.logLevel = Logger.LogLevels[value];
        }
    }

    /**
     * Build a log line prefix with the current timestamp, log type, and log level.
     * @private
     * @param {string} logType - The log type.
     * @param {string} logLevel - The log level for the log line.
     * @returns {string} The log line prefix.
     */
    buildLogLinePrefix(logType, logLevel) {
        return `[${new Date().toISOString()}] [${logType}] [${logLevel}]`;
    }

    /**
     * Log a message with the specified log level.
     * @param {string} type - The log type.
     * @param {string} level - The log level.
     * @param {...any} args - The log message arguments.
     * @private
     */
    log(type, level, ...args) {
        if (this.logLevel["level"] > Logger.LogLevels[level]["level"]) 
            return;
        
        const logLinePrefix = this.buildLogLinePrefix(type.toUpperCase(), level.toUpperCase());
        const logLine = [logLinePrefix, ...args].map(arg => {
            if (typeof arg === "string") {
                return arg;
            }

            return util.inspect(
                arg,
                {
                    depth: Infinity
                }
            );
        }).join(" ");

        Logger.LogLevels[level]["callback"](logLine);
    }

    /**
     * Log a message with the "trace" log level, equivalent to console.trace.
     * @public
     * @param {string} type - The log type.
     * @param {...any} args - The log message arguments.
     * @see console.trace
     */
    trace(type, ...args) {
        this.log(type, "trace", ...args);
    }

    /**
     * Log a message with the "debug" log level, equivalent to console.debug.
     * @public
     * @param {string} type - The log type.
     * @param {...any} args - The log message arguments.
     * @see console.debug
     */
    debug(type, ...args) {
        this.log(type, "debug", ...args);
    }

    /**
     * Log a message with the "info" log level, equivalent to console.info.
     * @public
     * @param {string} type - The log type.
     * @param {...any} args - The log message arguments.
     * @see console.info
     */
    info(type, ...args) {
        this.log(type, "info", ...args);
    }

    /**
     * Log a message with the "warn" log level, equivalent to console.warn.
     * @public
     * @param {string} type - The log type.
     * @param {...any} args - The log message arguments.
     * @see console.warn
     */
    warn(type, ...args) {
        this.log(type, "warn", ...args);
    }

    /**
     * Log a message with the "error" log level, equivalent to console.error.
     * @public
     * @param {string} type - The log type.
     * @param {...any} args - The log message arguments.
     * @see console.error
     */
    error(type, ...args) {
        this.log(type, "error", ...args);
    }
}

module.exports = Logger;
