const express = require("express");
const { UserAuthError } = require("../../Errors");

module.exports = class APIAuthRoute {
    /**
     * @param {import('../../Core')} core 
     */
    constructor(core) {
        this.core = core;
        this.router = express.Router();

        this.loadRoutes();
    }

    getRouter = () => this.router;

    loadRoutes = () => {
        this.router.post("/register", async (req, res, next) => {
            try {
                const { email, password, username } = req.body;
                const user = await this.core.getUserManager().createUser(null, email, password, username);

                const sessionToken = this.core.getUserManager().generateToken(user);
                req.session.token = sessionToken;

                // TODO: udelat nejakou ApiResponse classu
                return res.status(200).json({ code: 200 });
            } catch (error) {
                if (error instanceof UserAuthError) {
                    if (error == UserAuthError.MISSING_REQUIRED_PARAMETERS) {
                        return res.status(400).json({ error: "Missing required parameters" });
                    }

                    if (error == UserAuthError.INVALID_EMAIL) {
                        return res.status(400).json({ error: "Invalid email" });
                    }

                    if (error == UserAuthError.USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS) {
                        return res.status(400).json({ error: "Username doesn't meet minimal requirements" });
                    }

                    if (error == UserAuthError.USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS) {
                        return res.status(400).json({ error: "Username doesn't meet maximal requirements" });
                    }

                    if (error == UserAuthError.USER_ALREADY_EXISTS) {
                        return res.status(400).json({ error: "User already exists" });
                    }
                }


                return next(error);
            }
        });

        this.router.post("/login", async (req, res, next) => {
            try {
                const { email, password } = req.body;
                if (!(email && password)) {
                    throw UserAuthError.MISSING_REQUIRED_PARAMETERS;
                }

                const user = await this.core.getUserManager().getUser({ email });

                if (!user) {
                    throw UserAuthError.INVALID_PASSWORD;
                }

                const isPasswordValid = await this.core.getUserManager()._comparePassword(user.password, password);
                if (!isPasswordValid) {
                    throw UserAuthError.INVALID_PASSWORD;
                }

                const sessionToken = this.core.getUserManager().generateToken(user);
                req.session.token = sessionToken;
                
                // TODO: udelat nejakou ApiResponse classu
                return res.status(200).json({ code: 200 });
            } catch (error) {
                if (error == UserAuthError.MISSING_REQUIRED_PARAMETERS) {
                    return res.status(400).json({ error: "Missing required parameters" });
                }

                if (error == UserAuthError.INVALID_PASSWORD) {
                    return res.status(400).json({ error: "Invalid password" });
                }

                return next(error);
            }
        });
    }
};