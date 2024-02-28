const express = require("express");
const { APIError } = require("../../Errors");
const APIResponse = require("../APIResponse");

module.exports = class APIUserRoute {
    /**
     * @param {import('../Webserver')} webserver 
     */
    constructor(webserver) {
        this.webserver = webserver;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.patch("/@me", this.webserver.middlewares["LecturerMiddleware"].fetchSession, async (req, res, next) => {
            try {
                const { lecturer } = res.locals;
                if (!lecturer) {
                    return APIResponse.UNAUTHORIZED.send(res);
                }

                const data = req.body;
                if (!data) {
                    return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                }

                if (data.reservations) {
                    lecturer.addReservations(data.reservations);
                }

                return APIResponse.OK.send(res);
            } catch (error) {
                if (error == APIError.MISSING_REQUIRED_VALUES) {
                    return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                }
                
                if (error == APIError.INVALID_DATES) {
                    return APIResponse.INVALID_DATES.send(res);
                }
                
                if (error == APIError.TIME_CONFLICT) {
                    return APIResponse.TIME_CONFLICT.send(res);
                }

                return next(error);
            }
        });
    }
};