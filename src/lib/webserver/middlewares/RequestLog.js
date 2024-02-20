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

        if (Config.getLogLevel() == "debug" && !req.path.startsWith("/api")) {
            if (req.body) {
                Logger.debug(Logger.Type.Webserver, `Request body:`, req.body);
            }
            
            // absolutne ale jako fakt absolutne nechapu jak to dela brm brm (z casti)
            const oldWrite = res.write, oldEnd = res.end;
            let chunks = [];
            
            res.write = function (chunk) {
                chunks.push(chunk);
                return oldWrite.apply(res, arguments);
            };

            res.end = function (chunk) {
                if (chunk) {
                    chunks.push(chunk);
                }

                const body = Buffer.concat(chunks).toString('utf8');
                if (body) {
                    Logger.debug(Logger.Type.Webserver, `Response body:`, body);
                }

                oldEnd.apply(res, arguments);
            };
        }

        return next();
    }
};