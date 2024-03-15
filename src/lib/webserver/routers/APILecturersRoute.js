const express = require("express");
const APIResponse = require("../APIResponse");
const APIError = require("../../types/APIError");

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

                const lecturer = await this.webserver.getCore().getLecturerManager().createLecturer(data);
                return APIResponse.OK.send(res, lecturer.toJSON());
            } catch (error) {
                if (error instanceof APIError) {
                    if (error == APIError.MissingRequiredValues) {
                        return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                    }
                    
                    if (error == APIError.LecturerAlreadyExists) {
                        return APIResponse.LECTURER_ALREADY_EXISTS.send(res);
                    }

                    if (error == APIError.UsernameDoesntMeetMinimalRequirements) {
                        return APIResponse.USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS.send(res);
                    }

                    if (error == APIError.UsernameDoesntMeetMaximalRequirements) {
                        return APIResponse.USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS.send(res);
                    }
                }

                return next(error);
            }
        });

        this.router.get("/", async (req, res, next) => {
            try {
                const { limit, before, after } = req.query;
                let lecturers = await this.webserver.getCore().getLecturerManager().getLecturers();

                if (!lecturers || lecturers.length == 0) {
                    return res.status(200).json([]);
                }

                if (before) {
                    const index = lecturers.findIndex(lecturer => lecturer.uuid == before);
                    if (index == -1) {
                        throw APIError.LecturerNotFound;
                    }

                    lecturers = lecturers.slice(0, index);
                }

                if (after) {
                    const index = lecturers.findIndex(lecturer => lecturer.uuid == after);
                    if (index == -1) {
                        throw APIError.LecturerNotFound;
                    }

                    lecturers = lecturers.slice(index + 1);
                }

                if (!isNaN(limit) && limit > 0) {
                    lecturers = lecturers.slice(0, limit);
                }

                return res.status(200).json(lecturers);
            } catch (error) {
                if (error == APIError.LecturerNotFound) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }

                return next(error);
            }
        });

        this.router.get("/:uuid", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
    
                if (!lecturer) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }
    
                return APIResponse.OK.send(res, lecturer.toJSON());
            } catch (error) {
                return next(error);
            }
        });

        this.router.delete("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                
                await this.webserver.getCore().getLecturerManager().deleteLecturer(uuid);
                return APIResponse.OK.send(res);
            } catch (error) {
                if (error == APIError.LecturerNotFound) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }

                return next(error);
            }
        });

        this.router.put("/:uuid", this.webserver.middlewares["APIAuthMiddleware"].run, async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;
                
                const lecturer = await this.webserver.getCore().getLecturerManager().editLecturer(uuid, data);
                return APIResponse.OK.send(res, lecturer.toJSON()); 
            } catch (error) {
                if (error == APIError.LecturerNotFound) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res); 
                }

                return next(error);
            }
        });

        this.router.post("/:uuid/appointment", async (req, res, next) => {
            try {
                const { uuid } = req.params;
                const data = req.body;

                const lecturer = await this.webserver.getCore().getLecturerManager().getLecturer({ uuid });
                if (!lecturer) {
                    return APIResponse.LECTURER_NOT_FOUND.send(res);
                }

                const appointment = lecturer.createAppointment(data);

                this.webserver.getCore().getEmailClient().sendAppointmentConfirmation(lecturer, appointment);
                return APIResponse.OK.send(res);
            } catch (error) {
                if (error == APIError.MissingRequiredValues) {
                    return APIResponse.MISSING_REQUIRED_VALUES.send(res);
                }
                
                if (error == APIError.TimeSlotNotAvailable || error == APIError.ReservationNotFound) {
                    return APIResponse.TIME_SLOT_NOT_AVAILABLE.send(res);
                }

                if (error == APIError.InvalidValueType) {
                    return APIResponse.INVALID_VALUE_TYPE.send(res);
                }

                if (error == APIError.InvalidValueLength) {
                    return APIResponse.INVALID_VALUE_LENGTH.send(res);
                }

                if (error == APIError.InvalidDates) {
                    return APIResponse.INVALID_DATES.send(res);
                }

                return next(error);
            }
        });
    }
};