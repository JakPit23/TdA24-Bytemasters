const express = require("express");
const path = require("path");
const Core = require("../../Core");

module.exports = class WebRoute {
    /**
     * 
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
        this.router = express.Router();

        this.loadRoutes();
    }

    getRouter = () => this.router;

    loadRoutes = () => {
        this.router.get("/", (req, res) => res.sendFile(path.join(__dirname, "../../../views/index.html")));

        this.router.get("/lecturer/:lecturerUUID", (req, res) => {
            const { lecturerUUID } = req.params;

            if (!this.core.getLecturerManager().getLecturer(lecturerUUID)) {
                return res.status(404).sendFile(path.join(__dirname, "../../../views/404_lecturer.html"))
            }

            res.sendFile(path.join(__dirname, "../../../views/lecturer_template.html"))
        });
    }
};