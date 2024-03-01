class CalendarModule {
    constructor(page) {
        this.page = page;

        this.calendarElement = $("[data-calendar]");
        this.modal = $("[data-modal]");
        this.modalTitle = $("[data-modalTitle]");
        this.modalContent = $("[data-modalContent]");

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
                const appointment = this.page._getAppointmentBetweenDates((info.event.start.getTime() / 1000), (info.event.end.getTime()) / 1000);
            
                const startTime = new Date(info.event.start).getHours() + ":" + String(new Date(info.event.start).getMinutes()).padStart(2, "0");
                const endTime = new Date(info.event.end).getHours() + ":" + String(new Date(info.event.end).getMinutes()).padStart(2, "0");
            
                this.tolltip = tippy(info.el, {
                    placement: 'top',
                    trigger: "click",
                    content: `<div class="flex flex-col"><h1 class="text-3xl font-bold">Výuka - ${info.event.title}</h1><h2 class="text-2xl font-semibold">Lokace: <span class="text-xl ">${appointment.location}</span></h2><h2 class="text-2xl font-semibold">Čas: <span class="text-xl">${startTime} - ${endTime}</span></h2><h2 class="text-2xl">Poznámka: </h2> <span class="text-normal">${appointment.message}</span></div>`,
                    allowHTML: true,
                });
            },
            dateClick: (info) => {
                this.createEventBox(info);
            }
        });
    }

    /**
     * @param {object} data 
     */
    _renderAppointment(data) {
        const eventContainer = $('<div>').appendTo(this.modalContent).addClass('appointment-details');

        const start = new Date(data.start * 1000);
        const end = new Date(data.end * 1000);
        const startTime = `${start.getHours()}:${String(start.getMinutes()).padStart(2, "0")}`;
        const endTime = `${end.getHours()}:${String(end.getMinutes()).padStart(2, "0")}`;

        $('<h1>').addClass('appointment-title').text(`${data.firstName} ${data.lastName} (${startTime} - ${endTime})`).appendTo(eventContainer);

        $("<p>").text(data.location).appendTo(
            $('<h2>').addClass("appointment-location").text("Lokace: ").appendTo(eventContainer)
        );

        const contactContainer = $('<div>').appendTo(eventContainer).addClass('contact-container');
        // janky af :tf:
        const emailContactInfo = $('<div>').addClass("contact-info").appendTo(contactContainer);
        const phoneNumberContactInfo = $('<div>').addClass("contact-info").appendTo(contactContainer);

        $('<h2>').text("Email: ").appendTo(emailContactInfo);
        $('<a>').text(`${data.email}`).attr('href', `mailto:${data.email}`).appendTo(emailContactInfo);

        $('<h2>').text("Telefon: ").appendTo(phoneNumberContactInfo);
        $('<a>').text(data.phoneNumber).attr('href', `tel:${data.phoneNumber}`).appendTo(phoneNumberContactInfo);

        $("<p>").text(data.message).appendTo(
            $('<h2>').text("Poznámka: ").appendTo(eventContainer)
        );

        window.location.href = "#modal";
    }

    load() {
        this._createEvents();
        this.fullCalendar.render();
    }

    createEventBox(info) {
        this.modalContent.empty();
        this.modal.toggleClass("!hidden");

        const start = (new Date(info.dateStr).getTime() / 1000) - 3600;
        const end = start + 86400;
        const appointments = this.page._getAppointmentsBetweenDates(start, end);

        this.modalTitle.text(`Schůzky na ${new Date(info.dateStr).getDate()}.${new Date(info.dateStr).getMonth() + 1}.${new Date(info.dateStr).getFullYear()}`);
                
        if (appointments.length == 0) {
            $('<h1>').text("Žádné schůzky").appendTo(this.modalContent).addClass('text-2xl font-semibold mx-auto');
            return;
        }

        appointments.forEach(appointment => this._renderAppointment(appointment));
    }
    /**
     * @param {object} data 
     * @param {number} data.start
     * @param {number} data.end
     * @param {string} data.title
     */
    _createEvents = () => this.page.user.appointments
        .forEach(appointment => this.fullCalendar.addEvent({
            title: `${appointment.firstName} ${appointment.lastName}`,
            start: appointment.start * 1000,
            end: appointment.end * 1000,
        }))
}