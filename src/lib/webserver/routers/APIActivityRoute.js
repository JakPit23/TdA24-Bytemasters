const express = require("express");
const APIResponse = require("../APIResponse");
const APIError = require("../../types/APIError");
const UserType = require("../../types/user/UserType");

module.exports = class APIActivityRoute {
    /**
     * @param {import("../Webserver")} webserver 
     */
    constructor(webserver) {
        this.webserver = webserver;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.post("/", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const data = req.body;
                const activity = await this.webserver.getCore().getActivitiesManager().createActivity({ ...data, public: false });

                return APIResponse.Ok.send(res, activity);
            } catch (error) {
                return next(error);
            }
        });

        this.router.get("/", async (req, res, next) => {
            try {
                const { limit, before, after } = req.query;
                let activities = (await this.webserver.getCore().getActivitiesManager().getActivities());
                if (!activities || activities.length == 0) {
                    return res.status(200).json([]);
                }

                if (before) {
                    const index = activities.findIndex(activity => activity.uuid == before);
                    if (index == -1) {
                        throw APIError.KeyNotFound("activity");
                    }

                    activities = activities.slice(0, index);
                }

                if (after) {
                    const index = activities.findIndex(activity => activity.uuid == after);
                    if (index == -1) {
                        throw APIError.KeyNotFound("activity");
                    }

                    activities = activities.slice(index + 1);
                }

                if (!isNaN(limit) && limit > 0) {
                    activities = activities.slice(0, limit);
                }

                return res.status(200).json(activities);
            } catch (error) {
                return next(error);
            }
        });

        this.router.get("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const lecturer = await this.webserver.getCore().getUserManager().getLecturer({ uuid });
    
                if (!lecturer) {
                    throw APIError.KeyNotFound("user");
                }
    
                return APIResponse.Ok.send(res, lecturer.toJSON());
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                
                await this.webserver.getCore().getUserManager().deleteUser({ uuid });
                return APIResponse.Ok.send(res);
            } catch (error) {
                return next(error);
            }
        });

        this.router.put("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                
                const lecturer = await this.webserver.getCore().getUserManager().getLecturer({ uuid });
                await this.webserver.getCore().getUserManager().editUser(lecturer, data);

                return APIResponse.Ok.send(res, lecturer.toJSON()); 
            } catch (error) {
                return next(error);
            }
        });
    }
};