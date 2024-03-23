class Page {
    constructor(app) {
        this.app = app;
        this.api = new API();
        this.calendarModule = new CalendarModule(this);

        this.logoutButton = $("[data-logout]");
        this.downloadCalendarButton = $("[data-downloadCalendar]");
        this.popup = $("[data-popup]");
        this.closeButton = $("[data-closeButton]");
        this.confirmButton = $("[data-confirmButton]");

        this.init();
    }

    _getAppointmentBetweenDates = (start, end) => 
        this.user.appointments
            .flat()
            .find(appointment => appointment.start >= start && appointment.end <= end);

    _getAppointmentsBetweenDates = (start, end) =>
        this.user.appointments
            .flat()
            .filter(appointment => appointment.start >= start && appointment.end <= end);

    async init() {
        this.user = (await this.api.getUser()).user;

        this.logoutButton.on("click", this.authLogout.bind(this));
        this.downloadCalendarButton.on("click", this.downloadCalendar.bind(this));
        this.closeButton.on("click", () => $(`[${this.closeButton.attr("data-closeButton")}]`).addClass("!hidden"));
        
        this.calendarModule.load();
        this.app.hideLoader();
    }

    async confirmDelete(uuid) {
        this.popup.removeClass("!hidden");
        this.confirmButton.on("click", this.deleteAppointment.bind(this, uuid));
    }

    async deleteAppointment(uuid) {
        try {
            await this.api.deleteAppointment(uuid);

            this.popup.addClass("!hidden");
            this.user.appointments = this.user.appointments.filter(appointment => appointment.uuid != uuid);
            this.calendarModule.load();
        } catch (error) {
            console.error("An error occurred while deleting appointment:", error);
        }
    }

    async authLogout() {
        try {
            this.logoutButton.prop("disabled", true);

            await this.api.authLogout();
            window.location.href = "/";
        } catch (error) {
            this.logoutButton.addClass("!btn-error");

            console.error("An error occurred while logging out:", error);
            setTimeout(() => this.logoutButton.removeClass("!btn-error").prop("disabled", false), 1500);
        }
    }

}