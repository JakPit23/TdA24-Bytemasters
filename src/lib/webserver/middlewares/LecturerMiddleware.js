const Logger = require("../../Logger");

module.exports = class LecturerMiddleware {
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

        const result = this.webserver.getCore().getLecturerManager().verifyToken(token);
        if (!result.uuid) {
            return res.redirect("/login");
        }

        const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid: result.uuid });
        if (!lecturer) {
            return res.redirect("/login");
        }

        res.locals.lecturer = lecturer;
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
            const verified = this.webserver.getCore().getLecturerManager().verifyToken(token);
            if (!verified || !verified.uuid) {
                return next();
            }

            const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid: verified.uuid });
            res.locals.lecturer = lecturer;
        } catch (error) {
            Logger.error(Logger.Type.LecturerManager, "An unknown error occurred while fetching session", error);
            return next(error);
        }

        return next();
    }
}