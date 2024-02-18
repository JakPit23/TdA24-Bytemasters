const express = require("express");
const { APIError } = require("../../Errors");

module.exports = class LecturersAPIRoute {
    /**
     * @param {import("../../Core")} core 
     */
    constructor(core) {
        this.core = core;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.post("/", async (req, res, next) => {
            try {
                const data = req.body;

                const lecturer = await this.core.getLecturerManager().createLecturer(data);
                return res.status(200).json(lecturer);
            } catch (error) {
                if (error instanceof APIError) {
                    if (error == APIError.MISSING_REQUIRED_VALUES) {
                        return res.status(400).json({ code: 400, error: "Missing required values" });
                    }
                }

                return next(error);
            }
        });

        this.router.get("/", async (req, res, next) => {
            try {
                const lecturers = await this.core.getLecturerManager().getLecturers();

                if (!lecturers || lecturers.length == 0) {
                    return res.status(200).json([]);
                }
    
                return res.status(200).json(lecturers);
            } catch (error) {
                return next(error);
            }
        });

        this.router.get("/:lecturerUUID", async (req, res, next) => {
            try {
                const { lecturerUUID } = req.params;
                const lecturer = await this.core.getLecturerManager().getLecturer(lecturerUUID);
    
                if (!lecturer) {
                    return res.status(200).send({ code: 404, message: "Lecturer not found" });
                }
    
                return res.status(200).json(lecturer);
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:lecturerUUID", async (req, res, next) => {
            try {
                const { lecturerUUID } = req.params;
                const lecturer = await this.core.getLecturerManager().getLecturer(lecturerUUID);

                if (!lecturer) {
                    return res.status(200).json({
                        code: 404,
                        message: "Lecturer not found",
                    });
                }
    
                await this.core.getLecturerManager().deleteLecturer(lecturerUUID);
                return res.sendStatus(200);
            } catch (error) {
                return next(error);
            }
        });

        this.router.put("/:lecturerUUID", async (req, res, next) => {
            try {
                const { lecturerUUID } = req.params;
                const data = req.body;
                const lecturer = await this.core.getLecturerManager().getLecturer(lecturerUUID);
    
                if (!lecturer) {
                    return res.status(200).send({ code: 404, message: "Lecturer not found" });
                }
    
                const editedLecturer = await this.core.getLecturerManager().editLecturer(lecturerUUID, data);
                return res.status(200).json(editedLecturer);
            } catch (error) {
                return next(error);
            }
        });
    }
};