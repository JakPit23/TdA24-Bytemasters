const express = require("express");

module.exports = class WebRoute {
    /**
     * @param {import("../Webserver")} webserver 
     */
    constructor(webserver) {
        this.webserver = webserver;
        this.router = express.Router();

        this.loadRoutes();
    }
    
    loadRoutes = () => {
        this.router.get("/", (req, res) => res.render("index"));
        this.router.get("/gdpr", (req, res) => res.render("gdpr"));
        this.router.get("/contact", (req, res) => res.render("contact"));
        this.router.get("/login", (req, res) => res.render("login"));

        this.router.get("/lecturer/:lecturerUUID", async (req, res) => {
            const lecturerUUID = req.params.lecturerUUID;

            const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid: lecturerUUID });
            if (!lecturer) {
                return res.redirect("/");
            }

            res.render("lecturer");
        });

        this.router.get("/dashboard", this.webserver.middlewares["LecturerAuthMiddleware"].run, (req, res) => {
            res.render("dashboard", { lecturer: res.locals.lecturer });
        });
    }
};