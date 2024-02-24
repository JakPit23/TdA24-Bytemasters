const Config = require("../../Config");
const APIResponse = require("../APIResponse");

module.exports = class APIAuthMiddleware {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     */
    run = (req, res, next) => {
        if (process.argv.includes("--dev")) {
            return next();
        }

        const auth = req.headers.authorization;
        if (!auth) {
            return APIResponse.UNAUTHORIZED.send(res);
        }
        
        const [ username, password ] = Buffer.from(auth.split(" ")[1], "base64").toString().split(":");
        if (username != Config.getAPIUsername() || password != Config.getAPIPassword()) {
            return APIResponse.UNAUTHORIZED.send(res);
        }

        return next();
    }
}