const express = require("express");
const ics = require("ics");
const { APIError } = require("../../Errors");
const Logger = require("../../Logger");
const APIResponse = require("../APIResponse");

module.exports = class APILecturersRoute {
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

                const lecturer = await this.webserver.getCore().getLecturerManager().createLecturer(data);
                return APIResponse.OK.send(res, lecturer.toJSON());
            } catch (error) {
                if (error instanceof APIError) {
                    if (error == APIError.MISSING_REQUIRED_VALUES) {
                        return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                    }
                    
                    if (error == APIError.LECTURER_ALREADY_EXISTS) {
                        return APIResponse.LECTURER_ALREADY_EXISTS.send(res);
                    }

                    if (error == APIError.USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS) {
                        return APIResponse.USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS.send(res);
                    }

                    if (error == APIError.USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS) {
                        return APIResponse.USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS.send(res);
                    }
                }

                return next(error);
            }
        });

        this.router.get("/", async (req, res, next) => {
            try {
                const { limit, before, after } = req.query;
                let lecturers = await this.webserver.getCore().getLecturerManager().getLecturers();

                if (!lecturers || lecturers.length == 0) {
                    return res.status(200).json([]);
                }

                if (before) {
                    const index = lecturers.findIndex(lecturer => lecturer.uuid == before);
                    if (index == -1) {
                        throw APIError.LECTURER_NOT_FOUND;
                    }

                    lecturers = lecturers.slice(0, index);
                }

                if (after) {
                    const index = lecturers.findIndex(lecturer => lecturer.uuid == after);
                    if (index == -1) {
                        throw APIError.LECTURER_NOT_FOUND;
                    }

                    lecturers = lecturers.slice(index + 1);
                }

                if (!isNaN(limit) && limit > 0) {
                    lecturers = lecturers.slice(0, limit);
                }

                return res.status(200).json(lecturers);
            } catch (error) {
                if (error == APIError.LECTURER_NOT_FOUND) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }

                return next(error);
            }
        });

        this.router.get("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
    
                if (!lecturer) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }
    
                return APIResponse.OK.send(res, lecturer.toJSON());
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                
                await this.webserver.getCore().getLecturerManager().deleteLecturer(uuid);
                return APIResponse.OK.send(res);
            } catch (error) {
                if (error == APIError.LECTURER_NOT_FOUND) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }

                return next(error);
            }
        });

        this.router.put("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                
                const lecturer = await this.webserver.getCore().getLecturerManager().editLecturer(uuid, data);
                return APIResponse.OK.send(res, lecturer.toJSON()); 
            } catch (error) {
                if (error == APIError.LECTURER_NOT_FOUND) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res); 
                }

                return next(error);
            }
        });

        this.router.post("/:uuid/reservation", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;

                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
                if (!lecturer) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }

                lecturer.createAppointment(data);
                return APIResponse.OK.send(res); 
            } catch (error) {
                if (error == APIError.MISSING_REQUIRED_VALUES) {
                    return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                }
                
                if (error == APIError.TIME_SLOT_NOT_AVAILABLE || error == APIError.RESERVATION_NOT_FOUND) {
                    return APIResponse.TIME_SLOT_NOT_AVAILABLE.send(res);
                }

                if (error == APIError.INVALID_VALUE_TYPE) {
                    return APIResponse.INVALID_VALUE_TYPE.send(res);
                }

                if (error == APIError.INVALID_DATES) {
                    return APIResponse.INVALID_DATES.send(res);
                }

                return next(error);
            }
        });

        this.router.get("/:uuid/event", async (req, res, next) => {
            try {
                const { uuid } = req.params;

                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
                if (!lecturer) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }

                if (!lecturer.events || lecturer.events.length == 0) {
                    Logger.debug(Logger.Type.LecturerManager, `No events found for lecturer ${uuid}`);
                    return res.sendStatus(204);
                }

                ics.createEvents(lecturer.events.map(event => event.toICSFormat()), (error, value) => {
                    if (error) {
                        Logger.error(Logger.Type.LecturerManager, `Failed to generate ics file for lecturer ${uuid}`, error);
                        return next(error);
                    }

                    return res.status(200)
                        .set("Content-Type", "text/calendar")
                        .set("Content-Disposition", "attachment; filename=events.ics")
                        .send(value);
                });
            } catch (error) {
                return next(error);
            }
        });
    }
};