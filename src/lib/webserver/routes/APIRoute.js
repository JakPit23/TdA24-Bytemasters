const Core = require("../../Core");

module.exports = class APIRoute {
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
                res.json({
                    secret: "The cake is a lie",
                });
            },
        }
    ]
};