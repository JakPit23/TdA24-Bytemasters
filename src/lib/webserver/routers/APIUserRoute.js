const express = require("express");
const ics = require("ics");
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
        this.router.get("/@me", this.webserver.middlewares["LecturerMiddleware"].fetchSession, async (req, res, next) => {
            try {
                const { user } = res.locals;
                if (!user) {
                    return APIResponse.UNAUTHORIZED.send(res);
                }

                return APIResponse.OK.send(res, {
                    user: user.toJSON()
                });
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

        this.router.post("/@me", this.webserver.middlewares["LecturerMiddleware"].fetchSession, async (req, res, next) => {
            try {
                const { user } = res.locals;
                if (!user) {
                    return APIResponse.UNAUTHORIZED.send(res);
                }

                const data = req.body;
                if (!data) {
                    return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                }

                this.webserver.getCore().getLecturerManager().editLecturer(user.uuid, data);
                return APIResponse.OK.send(res, {
                    user: user.toJSON()
                });
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

        this.router.delete("/@me", this.webserver.middlewares["LecturerMiddleware"].fetchSession, async (req, res, next) => {
            try {
                const { user } = res.locals;
                if (!user) {
                    return APIResponse.UNAUTHORIZED.send(res);
                }

                const data = req.body;
                if (!data) {
                    return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                }

                if (data.appointments) {
                    user.deleteAppointments(data.appointments);
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
        
        this.router.get("/@me/appointments", this.webserver.middlewares["LecturerMiddleware"].fetchSession, async (req, res, next) => {
            try {
                const { user } = res.locals;
                if (!user) {
                    return APIResponse.UNAUTHORIZED.send(res);
                }

                if (!user.appointments || user.appointments.length == 0) {
                    return res.sendStatus(204);
                }

                ics.createEvents(user.appointments.map(appointment => appointment.toICS()), (error, value) => {
                    if (error) {
                        Logger.error(Logger.Type.LecturerManager, `Failed to generate ics file for lecturer ${uuid}`, error);
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