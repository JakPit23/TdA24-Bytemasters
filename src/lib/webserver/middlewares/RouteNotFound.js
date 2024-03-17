const APIResponse = require("../APIResponse");

module.exports = class RouteNotFound {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     */
    run = (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return APIResponse.RouteNotFound.send(res);
        }

        return res.status(404).render("404");
    }
}
