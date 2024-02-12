module.exports = class RouteNotFound {
    run = (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({
                code: 404,
                message: "Not found",
            });
        }

        return res.status(404).render("404");
    }
}
