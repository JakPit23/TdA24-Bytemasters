const express = require("express");

module.exports = class WebRoute {
    /**
     * 
     * @param {import("../../Core")} core 
     */
    constructor(core) {
        this.core = core;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.post("/", (req, res) => {
            try {
                const data = req.body;

                const lecturer = this.core.getLecturerManager().createLecturer(data);
                return res.status(200).json(lecturer.toJSON());
            } catch(error) {
                // Catch known errors, otherwise pass them to error handler.
                if (error.message == "LECTURER_ALREADY_EXISTS") {
                    res.status(400).json({ code: 400, error: "Lecturer already exists." });
                    return;
                }

                if (error.message == "MISSING_REQUIRED_FIELD") {
                    res.status(400).json({ code: 400, error: "Missing required fields." });
                    return;
                }

                throw error;
            }
        });

        this.router.get("/", (req, res) => {
            const lecturers = this.core.getLecturerManager().getLecturers();

            if (!lecturers || lecturers.length === 0) {
                return res.status(200).json([]);
            }

            res.status(200).json(lecturers.map(lecturer => lecturer.toJSON()));
        });

        this.router.get("/:lecturerUUID", (req, res) => {
            const { lecturerUUID } = req.params;
            const lecturer = this.core.getLecturerManager().getLecturer(lecturerUUID);

            if (!lecturer) {
                return res.status(200).send({
                    code: 404,
                    message: "Lecturer not found",
                });
            }

            res.status(200).json(lecturer);
        });

        this.router.delete("/:lecturerUUID", (req, res) => {
            const { lecturerUUID } = req.params;
            const lecturer = this.core.getLecturerManager().getLecturer(lecturerUUID);

            if (!lecturer) {
                return res.status(200).json({
                    code: 404,
                    message: "Lecturer not found",
                });
            }

            this.core.getLecturerManager().deleteLecturer(lecturerUUID);
            res.sendStatus(200);
        });

        this.router.put("/:lecturerUUID", (req, res) => {
            const { lecturerUUID } = req.params;
            const data = req.body;
            const lecturer = this.core.getLecturerManager().getLecturer(lecturerUUID);

            if (!lecturer) {
                return res.status(200).send({
                    code: 404,
                    message: "Lecturer not found",
                });
            }

            const editedLecturer = this.core.getLecturerManager().editLecturer(lecturerUUID, data);
            res.status(200).json(editedLecturer);
        });
    }
};