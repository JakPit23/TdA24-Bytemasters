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
            },
           eventClick: (info) => {
                const appointment = this.page._getAppointmenBetweenDates((info.event.start.getTime() / 1000), (info.event.end.getTime()) / 1000);
                
                const startTime = new Date(info.event.start).getHours() + ":" + String(new Date(info.event.start).getMinutes()).padStart(2, "0");
                const endTime = new Date(info.event.end).getHours() + ":" + String(new Date(info.event.end).getMinutes()).padStart(2, "0");
                
                tippy(info.el, {
                    placement: 'top',
                    trigger: "click",
                    content: `<div class="flex flex-col"><h1 class="text-3xl font-bold">Výuka - ${info.event.title}</h1><h2 class="text-2xl font-semibold">Lokace: <span class="text-xl ">${appointment.location}</span></h2><h2 class="text-2xl font-semibold">Čas: <span class="text-xl">${startTime} - ${endTime}</span></h2><h2 class="text-2xl">Poznámka: </h2> <span class="text-normal">${appointment.message}</span></div>`,
                    allowHTML: true,
                })
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