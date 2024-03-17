const APIError = require("../../types/APIError");
const APIResponse = require("../APIResponse");

module.exports = class APIServerError {
    /**
     * @param {APIError} error 
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {import("express").NextFunction} next 
     */
    run = (error, req, res, next) => {
        if (!req.path.startsWith("/api")) {
            return next(error);
        }

        if (!error instanceof APIError) {
            return next(error);
        }

        const apiResponse = APIResponse.fromAPIError(error);
        if (!apiResponse) {
            return next(error);
        }

        if (typeof apiResponse == "function") {
            return apiResponse(error.data).send(res);
        }

        return apiResponse.send(res);
    }
};