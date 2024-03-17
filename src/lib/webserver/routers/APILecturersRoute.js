const express = require("express");
const APIResponse = require("../APIResponse");
const APIError = require("../../types/APIError");
const UserType = require("../../types/user/UserType");

module.exports = class APILecturersRoute {
    /**
     * @param {import("../Webserver")} webserver 
     */
    constructor(webserver) {
        this.webserver = webserver;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.post("/", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const data = req.body;
                const lecturer = await this.webserver.getCore().getUserManager().createUser({ type: UserType.Lecturer, ...data });

                return APIResponse.Ok.send(res, lecturer.toJSON());
            } catch (error) {
                return next(error);
            }
        });

        this.router.get("/", async (req, res, next) => {
            try {
                const { limit, before, after } = req.query;
                let lecturers = (await this.webserver.getCore().getUserManager().getUsers())
                    .filter(user => user.type == UserType.Lecturer)
                    .map(lecturer => lecturer.toJSON());

                if (!lecturers || lecturers.length == 0) {
                    return res.status(200).json([]);
                }

                if (before) {
                    const index = lecturers.findIndex(lecturer => lecturer.uuid == before);
                    if (index == -1) {
                        throw APIError.KeyNotFound("user");
                    }

                    lecturers = lecturers.slice(0, index);
                }

                if (after) {
                    const index = lecturers.findIndex(lecturer => lecturer.uuid == after);
                    if (index == -1) {
                        throw APIError.KeyNotFound("user");
                    }

                    lecturers = lecturers.slice(index + 1);
                }

                if (!isNaN(limit) && limit > 0) {
                    lecturers = lecturers.slice(0, limit);
                }

                return res.status(200).json(lecturers);
            } catch (error) {
                return next(error);
            }
        });

        this.router.get("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const lecturer = await this.webserver.getCore().getUserManager().getLecturer({ uuid });
    
                if (!lecturer) {
                    throw APIError.KeyNotFound("user");
                }
    
                return APIResponse.Ok.send(res, lecturer.toJSON());
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                
                await this.webserver.getCore().getUserManager().deleteUser({ uuid });
                return APIResponse.Ok.send(res);
            } catch (error) {
                return next(error);
            }
        });

        this.router.put("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                
                const lecturer = await this.webserver.getCore().getUserManager().getLecturer({ uuid });
                await this.webserver.getCore().getUserManager().editUser(lecturer, data);

                return APIResponse.Ok.send(res, lecturer.toJSON()); 
            } catch (error) {
                return next(error);
            }
        });

        this.router.post("/:uuid/appointment", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;

                const lecturer = await this.webserver.getCore().getUserManager().getLecturer({ uuid });
                if (!lecturer) {
                    throw APIError.KeyNotFound("user");
                }

                const appointment = lecturer.createAppointment(data);
                await this.webserver.getCore().getUserManager()._saveLecturer(lecturer, true);
                this.webserver.getCore().getEmailClient().sendAppointmentConfirmation(lecturer, appointment);

                return APIResponse.Ok.send(res, { uuid: appointment.uuid });
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:uuid/appointment/:appointmentUUID", async (req, res, next) => {
            try {
                const { uuid, appointmentUUID } = req.params;
                const lecturer = await this.webserver.getCore().getUserManager().getLecturer({ uuid });
                if (!lecturer) {
                    throw APIError.KeyNotFound("user");
                }

                const appointment = lecturer.deleteAppointment(appointmentUUID);
                this.webserver.getCore().getEmailClient().sendAppointmentCancellation(lecturer, appointment);

                return APIResponse.Ok.send(res);
            } catch (error) {
                return next(error);
            }
        });
    }
};