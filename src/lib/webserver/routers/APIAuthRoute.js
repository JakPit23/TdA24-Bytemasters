const express = require("express");
const { APIError } = require("../../Errors");
const APIResponse = require("../APIResponse");

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
                    throw APIError.MISSING_REQUIRED_VALUES;
                }

                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ username });
                if (!lecturer) {
                    throw APIError.INVALID_CREDENTIALS;
                }

                if (!await this.webserver.getCore().getLecturerManager()._comparePassword(lecturer.password, password)) {
                    throw APIError.INVALID_CREDENTIALS;
                }

                req.session.token = this.webserver.getCore().getLecturerManager().generateJWTToken(lecturer);
                
                // TODO: udelat nejakou ApiResponse classu
                return res.status(200).json({ code: 200 });
            } catch (error) {
                if (error instanceof APIError) {
                    // if (error == APIError.MISSING_REQUIRED_VALUES) {
                    //     return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                    // }
    
                    if (error == APIError.INVALID_CREDENTIALS) {
                        return APIResponse.INVALID_CREDENTIALS.send(res);
                    }
                }

                return next(error);
            }
        });
    }
};