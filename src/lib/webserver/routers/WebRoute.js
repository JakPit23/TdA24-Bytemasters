const express = require("express");

module.exports = class WebRoute {
    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;
        this.router = express.Router();

        this.loadRoutes();
    }
    
    loadRoutes = () => {
        this.router.get("/", (req, res) => res.render("index"));
        this.router.get("/gdpr", (req, res) => res.render("gdpr"));
        this.router.get("/contact", (req, res) => res.render("contact"));
        this.router.get("/register", (req, res) => res.render("register"));
        this.router.get("/login", (req, res) => res.render("login"));
        this.router.get("/dashboard", (req, res) => res.render("dashboard"));
        this.router.get("/lecturer/:lecturerUUID", (req, res) => res.render("lecturer"));
        this.router.get("/dashboard/:lecturerUUID", (req, res) => res.render("dashboard"));
    }
};