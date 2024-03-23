const express = require("express");
const APIResponse = require("../APIResponse");
const APIError = require("../../types/APIError");
const Logger = require("../../Logger");

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
        this.router.post("/", async (req, res, next) => {
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
                const activity = await this.webserver.getCore().getActivitiesManager().getActivity({ uuid });
    
                if (!activity) {
                    throw APIError.KeyNotFound("activity");
                }
    
                return APIResponse.Ok.send(res, activity);
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                
                await this.webserver.getCore().getActivitiesManager().deleteActivity({ uuid });
                return APIResponse.Ok.send(res);
            } catch (error) {
                return next(error);
            }
        });

        this.router.post("/search", async (req, res, next) => {
            try {
                const { query } = req.body;
                Logger.debug(Logger.Type.Webserver, `Searching for activities with query: ${query}`);
                const results = await this.webserver.getCore().getActivitiesManager().searchForSameActivitiesWithOpenAI(query);
                if (!results) {
                    return res.status(200).json([]);
                }

                const activities = (await this.webserver.getCore().getActivitiesManager().getActivities()).filter(activity => results.includes(activity.uuid));
                return res.status(200).json(activities);
            } catch (error) {
                return next(error);
            }
        });

        this.router.post("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                
                const activity = await this.webserver.getCore().getActivitiesManager().getActivity({ uuid });
                await this.webserver.getCore().getActivitiesManager().editActivity(activity, data);

                return APIResponse.Ok.send(res, activity);
            } catch (error) {
                return next(error);
            }
        });
        
        // TODO: mby :3
        this.router.put("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                
                // const activity = await this.webserver.getCore().getActivitiesManager().getActivity({ uuid });
                // console.log("activity before edit:", activity);
                // await this.webserver.getCore().getActivitiesManager().editActivity(activity, data);
                // console.log("activity edited:", activity);

                // return APIResponse.Ok.send(res, activity); 
                return APIResponse.Ok.send(res, {
                    status: "TODO :3"
                }); 
            } catch (error) {
                return next(error);
            }
        });
    }
};