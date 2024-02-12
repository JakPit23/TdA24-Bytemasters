const Logger = require("../../Logger");

module.exports = class ServerError {
    constructor(core) {
        this.core = core;
    }

    run = (req, res, next) => {
        if (process.env.NODE_ENV === 'production') {
            Logger.info(Logger.Type.Webserver, `${req.headers['x-forwarded-for'] || req.ip} - "${req.method} ${req.url}" ${req.headers['user-agent']}`);
        }
        
        return next();
    }
};