const Logger = require("../../Logger");

module.exports = class ServerError {
    /**
     * @param {*} error 
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     */
    run = (error, req, res, next) => {
        if (req.path.startsWith("/api")) {
            if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
                return res.status(400).send({ code: 400, message: "Invalid request body" });
            }

            Logger.error(Logger.Type.Webserver, "An error occured while processing the request:", error);
            return res.status(500).json({
                code: 500,
                error: "Server error",
                // stack: (process.env.NODE_ENV != "production" ? error.stack.split("\n").map(line => line.trim()) : undefined)
                stack: error.stack.split("\n").map(line => line.trim())
            });
        }
        
        Logger.error(Logger.Type.Webserver, "An error occured while processing the request:", error);
        return res.status(500).render("500");
    }
};