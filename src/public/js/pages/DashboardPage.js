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
            this.logoutButton.addClass("!bg-red-500");

            console.error("An error occurred while logging out:", error);
            setTimeout(() => this.logoutButton.removeClass("!bg-red-500").prop("disabled", false), 1500);
        }
    }

    async addReservation(event) {
        event.preventDefault();
        
        const reserveButton = this.reservationForm.find(":submit");
        // nejvic messy vec :3
        const reservationTimeStart = this.app.getDateTimeFromString($('[data-reservationInput="timeStart"]').val());
        const reservationTimeEnd = this.app.getTimeFromString($('[data-reservationInput="timeEnd"]').val());
        reservationTimeEnd.setDate(reservationTimeStart.getDate());
        reservationTimeEnd.setMonth(reservationTimeStart.getMonth());
        reservationTimeEnd.setFullYear(reservationTimeStart.getFullYear());

        try {
            await this.api.addUserSettings({
                reservations: [
                    {
                        start: Math.floor(reservationTimeStart.getTime() / 1000),
                        end: Math.floor(reservationTimeEnd.getTime() / 1000),
                    }
                ]
            });

            reserveButton.prop("disabled", true).addClass("!bg-green-500").text("Rezervace úspěšně přidána");
            setTimeout(() => reserveButton.prop("disabled", false).removeClass("!bg-green-500").text("Přidat"), 1500);
        } catch (error) {
            console.error("An error occurred while adding a reservation:", error);
            console.log(error);
            const errorMessage = error.displayMessage || "Nastala chyba při rezervaci";
            reserveButton.prop("disabled", true).addClass("!bg-red-500").text(errorMessage);
            setTimeout(() => reserveButton.prop("disabled", false).removeClass("!bg-red-500").text("Přidat"), 2500);
        }
    }

    async downloadCalendar() {
        try {
            const blob = await this.api.getUserAppointmentsICS();
            const url = window.URL.createObjectURL(blob);
            const a = $('<a>').attr('href', url).attr('download', `${new Date().toISOString().split("T")[0]}_plan-vyuky.ical`);

            $('body').append(a);
            a[0].click();

            setTimeout(() => {
                a.remove();
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error("An error occurred while downloading ICS:", error);

            this.downloadCalendarButton.prop("disabled", true).addClass("!bg-red-500");
            setTimeout(() => this.downloadCalendarButton.prop("disabled", false).removeClass("!bg-red-500"), 2500);
        }
    }
}