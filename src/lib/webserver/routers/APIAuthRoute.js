const express = require("express");
const APIResponse = require("../APIResponse");
const APIError = require("../../types/APIError");
const User = require("../../types/user/User");
const UserType = require("../../types/user/UserType");

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
                const { username, email, password } = req.body;
                if (!((username || email) && password)) {
                    throw APIError.InvalidCredentials;
                }

                const user = await this.webserver.getCore().getUserManager().getUser({ username, email });
                if (!user) {
                    throw APIError.InvalidCredentials;
                }
                
                await User.comparePassword(password, user.password)
                    .then(result => {
                        if (!result) {
                            throw APIError.InvalidCredentials;
                        }
                    });

                req.session.token = user.createSession();
                return APIResponse.Ok.send(res);
            } catch (error) {
                return next(error);
            }
        });

        this.router.post("/register", async (req, res, next) => {
            try {
                const user = await this.webserver.getCore().getUserManager().createUser({
                    type: UserType.Student,
                    ...req.body
                });

                req.session.token = user.createSession();
                return APIResponse.Ok.send(res);
            } catch (error) {
                return next(error);
            }
        });
        
        this.router.post("/logout", this.webserver.middlewares["AuthMiddleware"].forceAuth, async (req, res, next) => {
            try {
                if (!res.locals.user) {
                    return APIResponse.Unauthorized.send(res);
                }

                req.session.token = null;
                return APIResponse.Ok.send(res);
            } catch (error) {
                return next(error);
            }
        });
    }
};