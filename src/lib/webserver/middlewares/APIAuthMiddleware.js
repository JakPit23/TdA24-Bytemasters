const Logger = require("../../Logger");
const UserSession = require("../../types/user/UserSession");
const UserType = require("../../types/user/UserType");
const APIResponse = require("../APIResponse");

module.exports = class APIAuthMiddleware {
    /**
     * @param {import("../Webserver")} webserver 
     */
    constructor(webserver) {
        this.webserver = webserver;
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     */
    forceAuth = async (req, res, next) => {
        const { token } = req.session;
        if (!token) {
            Logger.debug(Logger.Type.Webserver, "No token found in session");
            return APIResponse.Unauthorized.send(res);
        }
        
        const verified = UserSession.verifyToken(token);
        console.log("verified:", verified);
        if (!verified || !verified.uuid) {
            Logger.debug(Logger.Type.Webserver, "Invalid token found in session");
            return APIResponse.Unauthorized.send(res);
        }
        
        const user = await this.webserver.getCore().getUserManager().getUser({ uuid: verified.uuid });
        if (user.type != UserType.Admin) {
            Logger.debug(Logger.Type.Webserver, "User is not an admin");
            return APIResponse.Unauthorized.send(res);
        }

        res.locals.user = user;
        return next();
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     */
    fetchSession = async (req, res, next) => {
        const { token } = req.session;
        if (!token) {
            return next();
        }

        try {
            const verified = UserSession.verifyToken(token);
            if (!verified || !verified.uuid) {
                return next();
            }

            const user = await this.webserver.getCore().getUserManager().getUser({ uuid: verified.uuid });
            res.locals.user = user;
        } catch (error) {
            Logger.error(Logger.Type.UserManager, "An unknown error occurred while fetching session", error);
            return next(error);
        }

        return next();
    }
}