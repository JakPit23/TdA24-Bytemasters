const path = require("path");

module.exports = class RouteNotFound {
    constructor(core) {
        this.core = core;
    }
    
    run = (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({
                code: 404,
                message: "Not found",
            });
        }

        return res.status(404).sendFile(path.join(__dirname, "../../../views/404.html"))
    }
}
