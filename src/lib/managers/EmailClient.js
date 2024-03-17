const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const Config = require("../Config");
const Utils = require("../Utils");
const Logger = require("../Logger");

module.exports = class EmailClient {
    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;

        this.transporter = nodemailer.createTransport(
            {
                service: Config.smtpService,
                host: Config.smtpHost,
                port: Config.smtpPort,
                secure: Config.smtpUseSSL,
                auth: {
                    user: Config.smtpUsername,
                    pass: Config.smtpPassword
                }
            },
            // {
            //     from: Config.smtpFrom,
            // }
        );

        this.loadTemplates();
    }

    loadTemplates() {
        this.templates = {};

        const templatesPath = path.join(__dirname, "../../emailTemplates");
        if (!fs.existsSync(templatesPath)) {
            fs.mkdirSync(templatesPath);
        }

        for (const file of fs.readdirSync(templatesPath).filter(file => file.endsWith(".ejs"))) {
            const templateName = path.basename(file, ".ejs");
            const templateContent = fs.readFileSync(path.join(templatesPath, file), "utf-8");
            this.templates[templateName] = templateContent;
        }
    }

    /**
     * @private
     * @param {object} options
     * @param {string} options.to
     * @param {string} options.subject 
     * @param {string} options.html 
     */
    _send(options) {
        if (Utils.isDev) {
            Logger.debug(Logger.Type.EmailClient, "Email not sent due to development environment.");
            return;
        }

        return this.transporter.sendMail({
            from: Config.smtpFrom,
            to: options.to,
            subject: options.subject,
            html: options.html
        }, (error, info) => {
            if (error) {
                Logger.error(Logger.Type.EmailClient, "An error occurred while sending an email:", error);
                return;
            }

            Logger.debug(Logger.Type.EmailClient, "Email sent:", info.response);
        })
    }

    /**
     * @param {import("../types/user/Lecturer")} lecturer 
     * @param {import("../types/Appointment")} appointment 
     */
    async sendAppointmentConfirmation(lecturer, appointment) {
        const lecturerName = `${lecturer.first_name}${lecturer.middle_name ? ` ${lecturer.middle_name}` : ""} ${lecturer.last_name}`;
        const appointmentName = `${appointment.firstName} ${appointment.lastName}`;

        const template = ejs.render(this.templates["appointmentConfirmation"], {
            lecturerName,
            appointmentName,
            appointmentDate: Utils.formatDate(appointment.startDate),
            appointmentStart: Utils.formatTime(appointment.startDate),
            appointmentEnd: Utils.formatTime(appointment.endDate),
            appointmentLocation: appointment.location
        });

        return this._send({
            to: appointment.email,
            subject: `Informace o schůzce s ${lecturerName}`,
            html: template
        });
    }

    /**
     * @param {import("../types/user/Lecturer")} lecturer 
     * @param {import("../types/Appointment")} appointment 
     */
    async sendAppointmentCancellation(lecturer, appointment) {
        const lecturerName = `${lecturer.first_name}${lecturer.middle_name ? ` ${lecturer.middle_name}` : ""} ${lecturer.last_name}`;
        const appointmentName = `${appointment.firstName} ${appointment.lastName}`;

        const template = ejs.render(this.templates["appointmentCancellation"], {
            lecturerName,
            appointmentName,
            appointmentDate: Utils.formatDate(appointment.startDate),
            appointmentStart: Utils.formatTime(appointment.startDate),
            appointmentEnd: Utils.formatTime(appointment.endDate),
        });

        return this._send({
            to: appointment.email,
            subject: `Schůzka s ${lecturerName} byla zrušena`,
            html: template
        });
    }
}