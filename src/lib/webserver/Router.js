
/**
 * @param {Map} route
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const Router = (route, req, res, next) => {
    let originalUrl = req.originalUrl.replace(req.route.path.replace('*', ''), '');
    if (originalUrl.includes('?')){
        originalUrl = originalUrl.substring(0, originalUrl.indexOf('?'));
    }
    
    const Route = route?.get(`${originalUrl}_${req.method}`);
    if (!Route) {
        return next();
    }

    return Route.run(req, res);
}

module.exports = Router;