class CalendarModule {
    constructor(page) {
        this.page = page;
        this.calendarElement = $("[data-calendar]");

        this.fullCalendar = new FullCalendar.Calendar(this.calendarElement[0], {
            locale: "cs",
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
            },
            firstDay: 1,
            editable: false,
            dayMaxEvents: true,
            buttonText: {
                today: "Tento měsíc"
            }
        });
    }

    load() {
        this._createEvents();
        this.fullCalendar.render();
    }

    /**
     * @param {object} data 
     * @param {number} data.start
     * @param {number} data.end
     * @param {string} data.title
     */
    _createEvents = () => this.page.user.reservations
        .map(reservation => reservation.appointments)
        .filter(appointments => appointments.length > 0)
        .forEach(appointments => appointments.forEach(appointment => this.fullCalendar.addEvent({
            title: `${appointment.firstName} ${appointment.lastName}`,
            start: appointment.start * 1000,
            end: appointment.end * 1000,
        })))
}