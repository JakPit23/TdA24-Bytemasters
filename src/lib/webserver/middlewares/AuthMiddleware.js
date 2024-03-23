const Logger = require("../../Logger");
const UserSession = require("../../types/user/UserSession");

module.exports = class AuthMiddleware {
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
            return res.redirect("/login");
        }

        const verified = UserSession.verifyToken(token);
        if (!verified || !verified.uuid) {
            return res.redirect("/login");
        }

        const user = await this.webserver.getCore().getUserManager().getUser({ uuid: verified.uuid });
        if (!user) {
            return res.redirect("/login");
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