const express = require("express");
const ics = require("ics");
const APIResponse = require("../APIResponse");
const APIError = require("../../types/APIError");
const UserType = require("../../types/user/UserType");
const Logger = require("../../Logger");

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
        this.router.get("/@me", this.webserver.middlewares["AuthMiddleware"].fetchSession, async (req, res, next) => {
            try {
                /** @type {import("../../types/user/User")} */
                let user = res.locals.user;
                if (!user) {
                    return APIResponse.Unauthorized.send(res);
                }

                if (user.type == UserType.Lecturer) {
                    user = await this.webserver.getCore().getUserManager().getLecturer({ uuid: user.uuid });
                }

                return APIResponse.Ok.send(res, {
                    user: user.toJSON()
                });
            } catch (error) {
                return next(error);
            }
        });

        this.router.post("/@me", this.webserver.middlewares["AuthMiddleware"].fetchSession, async (req, res, next) => {
            try {
                /** @type {import("../../types/user/User")} */
                let user = res.locals.user;
                if (!user) {
                    return APIResponse.Unauthorized.send(res);
                }

                const data = req.body;
                if (typeof data !== "object" || Object.keys(data).length == 0) {
                    return APIResponse.InvalidValueType().send(res);
                }

                if (user.type == UserType.Lecturer) {
                    user = await this.webserver.getCore().getUserManager().getLecturer({ uuid: user.uuid });
                    await this.webserver.getCore().getUserManager().editUser(user, data);
                } else {
                    this.webserver.getCore().getUserManager().editUser(user, data);
                }

                return APIResponse.Ok.send(res, { user: user.toJSON() });
            } catch (error) {
                return next(error);
            }
        });

        this.router.get("/@me/appointments", this.webserver.middlewares["AuthMiddleware"].fetchSession, async (req, res, next) => {
            try {
                /** @type {import("../../types/user/User")} */
                const user = res.locals.user;
                if (!user) {
                    return APIResponse.Unauthorized.send(res);
                }

                if (user.type != UserType.Lecturer) {
                    return APIResponse.Unauthorized.send(res);
                }

                const lecturer = await this.webserver.getCore().getUserManager().getLecturer({ uuid: user.uuid });
                if (!Array.isArray(lecturer.appointments) || lecturer.appointments.length == 0) {
                    return res.sendStatus(204);
                }

                ics.createEvents(lecturer.appointments.map(appointment => appointment.toICS()), (error, value) => {
                    if (error) {
                        Logger.error(Logger.Type.UserManager, `Failed to generate ics file for lecturer ${uuid}`, error);
                        return next(error);
                    }
                
                    // YYYY-MM-DD_plan-vyuky.ical
                    const fileName = `${new Date().toISOString().split("T")[0]}_plan-vyuky`;
                    return res.status(200)
                        .set("Content-Type", "text/calendar")
                        .set("Content-Disposition", `attachment; filename=${fileName}.ical`)
                        .send(value);
                });
            } catch (error) {
                return next(error);
            }
        });
    }
};