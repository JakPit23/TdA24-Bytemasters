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

        // TODO: Make a 404 error page
        return res.status(404).send("Not found");
    }
}
