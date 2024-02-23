const express = require("express");
const { APIError } = require("../../Errors");

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
                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });

                if (!lecturer) {
                    return res.status(200).json({
                        code: 404,
                        message: "Lecturer not found",
                    });
                }
    
                await this.webserver.getCore().getLecturerManager().deleteLecturer(uuid);
                return res.sendStatus(200);
            } catch (error) {
                return next(error);
            }
        });

        this.router.put("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
    
                if (!lecturer) {
                    return res.status(200).send({ code: 404, message: "Lecturer not found" });
                }
    
                const editedLecturer = await this.webserver.getCore().getLecturerManager().editLecturer(uuid, data);
                return res.status(200).json(editedLecturer);
            } catch (error) {
                return next(error);
            }
        });

        this.router.post("/:uuid/event", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;

                if (!Array.isArray(data)) {
                    return res.status(200).json({ code: 400, error: "MISSING_REQUIRED_VALUES" });
                }
    
                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
                if (!lecturer) {
                    return res.status(200).send({ code: 404, message: "Lecturer not found" });
                }

                const editedLecturer = await this.webserver.getCore().getLecturerManager().editLecturer(uuid, { events: data });
                return res.status(200).json(editedLecturer);
            } catch (error) {
                if (error == APIError.MISSING_REQUIRED_VALUES) {
                    return res.status(400).json({ code: 400, error: "MISSING_REQUIRED_VALUES" });
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

                return next(error);
            }
        });
    }
};