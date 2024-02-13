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
        this.router.get("/", (req, res) => res.render("index"));
        this.router.get("/gdpr", (req, res) => res.render("gdpr"));
        this.router.get("/contact", (req, res) => res.render("contact"));
        this.router.get("/register", (req, res) => res.render("register"));
        this.router.get("/login", (req, res) => res.send("login"));
        this.router.get("/lecturer/:lecturerUUID", (req, res) => res.render("lecturer"));
    }
};