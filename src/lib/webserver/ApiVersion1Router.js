const express = require("express");
const crypto = require("crypto");
const Core = require("../Core");
const Logger = require("../Logger");

/**
 * The ApiVersion1Router class is responsible for defining routes related to API version 1.
 * @class
 */
class ApiVersion1Router {
    /**
     * Create a new ApiVersion1Router instance.
     * @constructor
     * @param {Core} core - The application core.
     */
    constructor(core) {
        this.core = core;

        // Initialize an Express router for API version 1 routes.
        this.router = express.Router({
            mergeParams: true
        });

        // Initialize the routes defined in the class.
        this.initRoutes();
    }

    /**
     * Get the Express router configured with the defined API version 1 routes.
     * @returns {express.Router} An Express router for API version 1 routes.
     */
    getRouter() {
        return this.router;
    }

    /**
     * Initialize the API version 1 routes.
     */
    initRoutes() {
        this.router.get("/", (req, res) => {
            res.json({
                secret: "The cake is a lie"
            });
        });

        const log = [];
        this.router.get("/log", (req, res) => {
            res.json(log);
        });

        this.router.post("/lecturers", (req, res) => {
            try {
                const data = req.body;
    
                log.push("Body data:" + JSON.stringify(data));
                console.log("Body data:", data);
                
                const lecturer = this.core.getLecturerManager().createLecturer(this.core.getLecturerManager().generateUUID(), data);

                console.log("Lecturer:", lecturer);
                log.push("Lecturer: " + JSON.stringify(lecturer));
                
                if (data.tags && Array.isArray(data.tags)) {
                    for (const tag of data.tags) {
                        if (this.core.getLecturerManager().isValidTag(tag)) {
                            log.push("Valid Tag: " + JSON.stringify(tag));
                            Logger.debug(Logger.Type.Webserver, "Valid Tag:", tag);
                            continue;
                        }

                        log.push("Invalid Tag: " + JSON.stringify(tag));
                        Logger.debug(Logger.Type.Webserver, "Invalid Tag:", tag);
                        // return res.status(200).json({ code: 400, error: "Invalid tag." });
                    }
                }


                return res.status(200).json(lecturer.toJSON());

                // if (data.first_name === undefined || data.last_name === undefined || data.contact === undefined) {
                //     Logger.debug(Logger.Type.Webserver, "Responding with \"400 Missing Required Fields\"");
                //     return res.status(400).json({ code: 400, error: "Missing required fields." });
                // }
    
                // if (!this.core.getLecturerManager().isValidContact(data.contact)) {
                //     Logger.debug(Logger.Type.Webserver, "Invalid contact");
                //     // res.status(200).json({
                //     //     code: 400,
                //     //     error: "Invalid contact information.",
                //     //     ...data,
                //     //     contact: {
                //     //         telephone_numbers: data.telephone_numbers || [],
                //     //         emails: data.emails || [],
                //     //     },
                //     // });
                //     // return;
                // }
                
                // const lecturer = this.core.getLecturerManager().createLecturer(this.core.getLecturerManager().generateUUID(), data);
                // Logger.debug(Logger.Type.Webserver, "Lecturer:", lecturer.toJSON()); 
                // return res.status(200).json(lecturer.toJSON());
            } catch(error) {
                // Catch known errors, otherwise pass them to error handler.
                if (error.message == "LECTURER_ALREADY_EXISTS") {
                    res.status(200).json({ code: 400, error: "Lecturer already exists." });
                    return;
                }

                throw error;
            }
        });

        // this.router.get("/lecturers", (req, res) => {
            // const lecturers = this.core.getLecturerManager().getLecturers();

            // if (!lecturers || lecturers.length === 0) {
            //     return res.status(200).json([]);
            // }

            // res.status(200).json(lecturers.map(lecturer => lecturer.toJSON()));
        // });

        // this.router.get("/lecturers/:lecturerId", (req, res) => {
            // const { lecturerId } = req.params;
            // const lecturer = this.core.getLecturerManager().getLecturer(lecturerId);

            // if (!lecturer) {
            //     return res.status(404).send({
            //         code: 404,
            //         message: "Lecturer not found",
            //     });
            // }

            // res.status(200).json(lecturer);
        // });

        // this.router.delete("/lecturers/:lecturerId", (req, res) => {
            // const { lecturerId } = req.params;
            // const lecturer = this.core.getLecturerManager().getLecturer(lecturerId);

            // if (!lecturer) {
            //     return res.status(404).json({
            //         code: 404,
            //         message: "Lecturer not found",
            //     });
            // }

            // this.core.getLecturerManager().deleteLecturer(lecturerId);
            
            // res.status(200).json({
            //     code: 200,
            //     success: true,
            // });
        // });

        // TODO: Check if lecturer exists before updating. etc.. and if the syntax of some values is correct.
        // this.router.put("/lecturers/:lecturerId", (req, res) => {
            // const data = req.body;
            // const lecturerId = req.params.lecturerId;
            // const lecturer = this.core.getLecturerManager().getLecturer(lecturerId);

            // if (!lecturer) {
            //     return res.status(404).send({
            //         code: 404,
            //         message: "Lecturer not found",
            //     });
            // }

            // if (data.contact) {
            //     if (data.contact.emails && !data.contact.emails.every(email => this.core.getLecturerManager().isValidEmail(email))) {
            //         res.status(200).json({ code: 400, error: "Invalid emails." });
            //         return;
            //     }

            //     if (data.contact.telephone_numbers && !data.contact.telephone_numbers.every(telephoneNumber => this.core.getLecturerManager().isValidPhoneNumber(telephoneNumber))) {
            //         res.status(200).json({ code: 400, error: "Invalid telephone numbers." });
            //         return;
            //     }
            // }


            // if (data.tags && Array.isArray(data.tags)) {
            //     for (const tag of data.tags) {
            //         if (this.core.getLecturerManager().isValidTag(tag)) {
            //             continue;
            //         }

            //         return res.status(200).json({ code: 400, error: "Invalid tag." });
            //     }
            // }

            // const editedLecturer = this.core.getLecturerManager().editLecturer(lecturerId, data);
            // res.status(200).json(editedLecturer);
        // });

        this.router.get("*", (req, res) => {
            res.json({
                code: 404,
                error: true
            });
        });
    }
}

module.exports = ApiVersion1Router;