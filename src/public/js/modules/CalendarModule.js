class CalendarModule {
    constructor(page) {
        this.page = page;
        this.calendarElement = $("[data-calendar]");
        this.modal = $("[data-modal]");
        this.modalContent = this.modal.find("[data-modalContent]");
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
                console.log(info.event);
                const remove = confirm("Opravdu chcete smazat tuto rezervaci?");
                if (remove) {
                    info.event.remove();
                }
            },
            eventMouseEnter: (info) => {
                const appointment = this.page._getAppointmenBetweenDates((info.event.start.getTime() / 1000), (info.event.end.getTime()) / 1000);
                
                const startTime = new Date(info.event.start).getHours() + ":" + String(new Date(info.event.start).getMinutes()).padStart(2, "0");
                const endTime = new Date(info.event.end).getHours() + ":" + String(new Date(info.event.end).getMinutes()).padStart(2, "0");
                
                this.tolltip = tippy(info.el, {
                    placement: 'top',
                    trigger: "click",
                    content: `<div class="flex flex-col"><h1 class="text-3xl font-bold">Výuka - ${info.event.title}</h1><h2 class="text-2xl font-semibold">Lokace: <span class="text-xl ">${appointment.location}</span></h2><h2 class="text-2xl font-semibold">Čas: <span class="text-xl">${startTime} - ${endTime}</span></h2><h2 class="text-2xl">Poznámka: </h2> <span class="text-normal">${appointment.message}</span></div>`,
                    allowHTML: true,
                });
            },

            eventMouseLeave: (info) => {
                this.tooltip.hide();
            },
            dateClick: (info) => {
                this.createEventBox(info);
            }
        });
    }

    load() {
        this._createEvents();
        this.fullCalendar.render();
    }

    createEventBox = (info) => {
        this.modalContent.empty();
        const start = (new Date(info.dateStr).getTime() / 1000) - 3600;
        const end = start + 86400
        const appointments = this.page._getAppointmentsBetweenDates(start, end);
                
        if (appointments.length === 0) {
            $('<h1>').text("Žádné rezervace").appendTo(this.modalContent).addClass('text-2xl font-semibold mx-auto');
        }
        appointments.forEach(appointment => {
            var eventContainer = $('<div>').appendTo(this.modalContent).addClass('flex flex-col border-2 border-dark-900 shadow-md px-4 py-2 w-full mx-auto my-4 rounded-md bg-white h-auto');
            $('<h1>').text(`Výuka - ${appointment.firstName} ${appointment.lastName}`).appendTo(eventContainer).addClass('text-2xl font-semibold mx-auto');  
            $('<h2>').text(`Lokace: ${appointment.location}`).appendTo(eventContainer);
            var startHours = new Date(appointment.start * 1000).getHours();
            var startMinutes = String(new Date(appointment.start * 1000).getMinutes()).padStart(2, "0");
            var endHours = new Date(appointment.end * 1000).getHours();
            var endMinutes = String(new Date(appointment.end * 1000).getMinutes()).padStart(2, "0");
            $('<h2>').text(`Čas: ${startHours}:${startMinutes} - ${endHours}:${endMinutes}`).appendTo(eventContainer);
            var mail = $('<h2>').text(`Kontakt: `).appendTo(eventContainer);
            $('<a>').text(`${appointment.email}`).attr('href', `mailto:${appointment.email}`).appendTo(mail);
            var phone = $('<h2>').text(`Telefon: `).appendTo(eventContainer);
            $('<a>').text(`${appointment.phoneNumber}`).attr('href', `tel:${appointment.phoneNumber}`).appendTo(phone);
            $('<h2>').text(`Poznámka: ${appointment.message}`).appendTo(eventContainer).addClass('text-wrap');
        })

        this.modal.show();
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