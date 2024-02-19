const Config = require("../../Config");
const Logger = require("../../Logger");

module.exports = class RequestLog {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     */
    run = (req, res, next) => {
        if (process.env.NODE_ENV === 'production') {
            Logger.info(Logger.Type.Webserver, `${req.headers['x-forwarded-for'] || req.ip} - "${req.method} ${req.url}" ${req.headers['user-agent']}`);
        }

        if (Config.getLogLevel() == "debug" && req.body) {
            Logger.debug(Logger.Type.Webserver, `Request body:`, req.body);
        }

        return next();
    }
};