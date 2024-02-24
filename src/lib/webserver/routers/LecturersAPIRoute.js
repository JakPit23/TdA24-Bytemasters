const express = require("express");
const ics = require("ics");
const { APIError } = require("../../Errors");
const Logger = require("../../Logger");

module.exports = class LecturersAPIRoute {
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
                return res.status(200).json(lecturer);
            } catch (error) {
                if (error instanceof APIError) {
                    if (error == APIError.MISSING_REQUIRED_VALUES) {
                        return res.status(400).json({ code: 400, error: "MISSING_REQUIRED_VALUES" });
                    }
                    
                    if (error == APIError.LECTURER_ALREADY_EXISTS) {
                        return res.status(200).json({ code: 400, error: "LECTURER_ALREADY_EXISTS" });
                    }

                    if (error == APIError.INVALID_EVENT_NAME) {
                        return res.status(200).json({ code: 400, error: "INVALID_EVENT_NAME" });
                    }

                    if (error == APIError.INVALID_EVENT_START_DATE) {
                        return res.status(200).json({ code: 400, error: "INVALID_EVENT_START_DATE" });
                    }

                    if (error == APIError.INVALID_EVENT_END_DATE) {
                        return res.status(200).json({ code: 400, error: "INVALID_EVENT_END_DATE" });
                    }

                    if (error == APIError.INVALID_EVENT_DATES) {
                        return res.status(200).json({ code: 400, error: "INVALID_EVENT_DATES" });
                    }
                }

                return next(error);
            }
        });

        this.router.get("/", async (req, res, next) => {
            try {
                const lecturers = await this.webserver.getCore().getLecturerManager().getLecturers();

                if (!lecturers || lecturers.length == 0) {
                    return res.status(200).json([]);
                }
    
                return res.status(200).json(lecturers);
            } catch (error) {
                return next(error);
            }
        });

        this.router.get("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
    
                if (!lecturer) {
                    return res.status(200).send({ code: 404, message: "Lecturer not found" });
                }
    
                return res.status(200).json(lecturer);
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                
                await this.webserver.getCore().getLecturerManager().deleteLecturer(uuid);
                return res.status(200).json({ code: 200, message: "OK" });
            } catch (error) {
                if (error == APIError.LECTURER_NOT_FOUND) {
                    return res.status(200).json({ code: 404, message: "Lecturer not found" });
                }

                return next(error);
            }
        });

        this.router.put("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                
                const lecturer = await this.webserver.getCore().getLecturerManager().editLecturer(uuid, data);
                return res.status(200).json(lecturer);
            } catch (error) {
                if (error == APIError.LECTURER_NOT_FOUND) {
                    return res.status(200).json({ code: 404, message: "Lecturer not found" });
                }

                return next(error);
            }
        });

        this.router.post("/:uuid/event", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;

                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
                if (!lecturer) {
                    return res.status(200).json({ code: 404, message: "Lecturer not found" });
                }

                // TODO: ig ze poslat email lektorovi a tomu typkovi ze yoo dobra prace you did it
                lecturer.addEvent(data);
                this.webserver.getCore().getLecturerManager()._saveLecturer(lecturer, true);

                return res.status(200).json({ code: 200, message: "OK" });
            } catch (error) {
                if (error == APIError.MISSING_REQUIRED_VALUES) {
                    return res.status(400).json({ code: 400, error: "MISSING_REQUIRED_VALUES" });
                }

                if (error == APIError.INVALID_EMAIL) {
                    return res.status(200).json({ code: 400, error: "INVALID_EMAIL" });
                }

                if (error == APIError.INVALID_PHONE_NUMBER) {
                    return res.status(200).json({ code: 400, error: "INVALID_PHONE_NUMBER" });
                }

                if (error == APIError.INVALID_EVENT_START_DATE) {
                    return res.status(200).json({ code: 400, error: "INVALID_EVENT_START_DATE" });
                }

                if (error == APIError.INVALID_EVENT_END_DATE) {
                    return res.status(200).json({ code: 400, error: "INVALID_EVENT_END_DATE" });
                }

                if (error == APIError.INVALID_EVENT_DATES) {
                    return res.status(200).json({ code: 400, error: "INVALID_EVENT_DATES" });
                }

                if (error == APIError.EVENT_CONFLICTS_WITH_EXISTING_EVENT) {
                    return res.status(200).json({ code: 400, error: "EVENT_CONFLICTS_WITH_EXISTING_EVENT" });
                }

                return next(error);
            }
        });

        this.router.get("/:uuid/event", async (req, res, next) => {
            try {
                const { uuid } = req.params;

                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
                if (!lecturer) {
                    return res.status(200).json({ code: 404, message: "Lecturer not found" });
                }

                if (!lecturer.events || lecturer.events.length == 0) {
                    Logger.debug(Logger.Type.LecturerManager, `No events found for lecturer ${uuid}`);
                    return res.status(204).send({ code: 204, message: "Lecturer has no events" });
                }

                ics.createEvents(lecturer.events.map(event => event.toICSFormat()), (error, value) => {
                    if (error) {
                        Logger.error(Logger.Type.LecturerManager, `Failed to generate ics file for lecturer ${uuid}`, error);
                        return res.status(500).json({ code: 500, error: "INTERNAL_SERVER_ERROR" });
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