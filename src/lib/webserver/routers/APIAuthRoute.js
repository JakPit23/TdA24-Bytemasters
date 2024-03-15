const express = require("express");
const APIResponse = require("../APIResponse");
const APIError = require("../../types/APIError");

module.exports = class APIAuthRoute {
    /**
     * @param {import('../Webserver')} webserver 
     */
    constructor(webserver) {
        this.webserver = webserver;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.post("/login", async (req, res, next) => {
            try {
                const { username, password } = req.body;
                if (!(username && password)) {
                    throw APIError.MissingRequiredValues;
                }

                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ username });
                if (!lecturer) {
                    throw APIError.InvalidCredentials;
                }

                if (!await this.webserver.getCore().getLecturerManager()._comparePassword(lecturer.password, password)) {
                    throw APIError.InvalidCredentials;
                }

                req.session.token = this.webserver.getCore().getLecturerManager().generateJWTToken(lecturer);
                
                return APIResponse.OK.send(res);
            } catch (error) {
                if (error instanceof APIError) {
                    if (error == APIError.MissingRequiredValues) {
                        return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                    }
    
                    if (error == APIError.InvalidCredentials) {
                        return APIResponse.INVALID_CREDENTIALS.send(res);
                    }
                }

                return next(error);
            }
        });
        
        this.router.post("/logout", this.webserver.middlewares["LecturerMiddleware"].forceAuth, async (req, res, next) => {
            try {
                if (!res.locals.user) {
                    return APIResponse.UNAUTHORIZED.send(res);
                }

                req.session.token = null;
                return APIResponse.OK.send(res);
            } catch (error) {
                return next(error);
            }
        });
    }
};