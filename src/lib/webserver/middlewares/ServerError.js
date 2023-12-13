const path = require("path");
const Logger = require("../../Logger");

module.exports = class ServerError {
    constructor(core) {
        this.core = core;
    }

    run = (error, req, res, next) => {
        if (req.path.startsWith("/api")) {
            if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
                res.status(400).send({ code: 400, message: "Invalid request body" });
                return;
            }

            this.core.getLogger().error(Logger.Type.Webserver, error.stack);
            res.status(500).json({ code: 500, error: "Server error" });
            return;
        }
        
        this.core.getLogger().error(Logger.Type.Webserver, error.stack);
        return res.status(500).sendFile(path.join(__dirname, "../../../views/500.html"))
    }
};