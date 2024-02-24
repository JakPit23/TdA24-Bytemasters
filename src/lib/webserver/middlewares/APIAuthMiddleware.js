const Config = require("../../Config");

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
            return res.status(401).json({ code: 401, error: "MISSING_AUTHORIZATION_HEADER" });
        }

        const [ username, password ] = Buffer.from(auth.split(" ")[1], "base64").toString().split(":");
        if (username != Config.getAPIUsername() || password != Config.getAPIPassword()) {
            return res.status(401).json({ code: 401, error: "INVALID_CREDENTIALS" });
        }

        return next();
    }
}