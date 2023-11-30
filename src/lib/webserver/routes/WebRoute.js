const path = require("path");
const Core = require("../../Core");

module.exports = class WebRoute {
    /**
     * 
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
    }

    getRoutes = () => [
        {
            route: "",
            method: "GET",
            run: (req, res) => {
                res.sendFile(path.join(__dirname, "../../../views/index.html"));
            },
        },
        {
            route: "lecturer",
            method: "GET",
            run: (req, res) => {
                res.sendFile(path.join(__dirname, "../../../views/lecturer.html"));
            },
        }
    ]
};