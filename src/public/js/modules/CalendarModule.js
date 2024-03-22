class CalendarModule {
    constructor(page) {
        this.page = page;

        this.currentCalendarDay = new Date();
        this.calendarDate = new Date();
        this.calendarElement = $("[data-calendar]");
        this.calendarDateElement = $("[data-calendarDate]");
        this.calendarPrevious = $("[data-calendarPrevious]");
        this.calendarNext = $("[data-calendarNext]");
        
        this.appointments = $("[data-appointments]");

        this.modal = $("[data-modal]");
        this.modalTitle = $("[data-modalTitle]");
        this.modalContent = $("[data-modalContent]");
    }

    /**
     * @param {object} data 
     */
    _renderAppointment(data) {
        const appointmentElement = $("<div>").addClass("appointment").appendTo(this.appointments);

        const appointmentHeader = $("<div>").addClass("appointment-header").appendTo(appointmentElement);
        $("<h1>").text(`${data.firstName} ${data.lastName}`).appendTo(appointmentHeader);

        const appointmentDelete = $("<div>").addClass("appointment-delete").appendTo(appointmentHeader);
        $("<button>").data("data-appointment-uuid", data.uuid).append($("<i>").addClass("fa-solid fa-trash")).appendTo(appointmentDelete);

        const appointmentContent = $("<div>").addClass("appointment-content").appendTo(appointmentElement);

        const start = new Date(data.start * 1000);
        const end = new Date(data.end * 1000);
        const startTime = `${start.getHours()}:${String(start.getMinutes()).padStart(2, "0")}`;
        const endTime = `${end.getHours()}:${String(end.getMinutes()).padStart(2, "0")}`;
        $("<span>").text(`${startTime} - ${endTime}`).appendTo(
            $("<p>").text("Čas: ").appendTo(appointmentContent)
        );

        $("<span>").text(data.location).appendTo(
            $("<p>").text("Místo: ").appendTo(appointmentContent)
        )
        
        $("<p>").text(`Telefon: `).append($("<a>").attr("href", `tel:${data.phoneNumber}`).text(data.phoneNumber)).appendTo(appointmentContent);
        $("<p>").text(`Email: `).append($("<a>").attr("href", `mailto:${data.email}`).text(data.email)).appendTo(appointmentContent);

        $("<span>").text(data.message).appendTo(
            $("<p>").text("Poznámka: ").appendTo(appointmentContent)
        )

        appointmentDelete.find("button").on("click", (event) => {
            let uuid = $(event.target).data("data-appointment-uuid");
            if (!uuid) uuid = $(event.target).parent().data("data-appointment-uuid");

            this.page.confirmDelete(uuid);
        });
    }

    _renderAppointments(date) {
        if (!date) {
            console.log("_renderAppointments: invalid date");
            return;
        }

        date = new Date(date);
        date.setHours(0, 0, 0, 0);

        this.appointments.empty();

        const appointments = this.page._getAppointmentsBetweenDates(date.getTime() / 1000, (date.getTime() / 1000) + 86400);
        if (appointments.length == 0) {
            $("<h1>").text("Žádné schůzky").addClass("text-lg font-bold").appendTo(this.appointments);
            return;
        }

        appointments.forEach(appointment => this._renderAppointment(appointment));
    }

    _onCalendarCellClick(event) {
        const date = $(event.target).data("date");
        if (!date) {
            console.log("_onCalendarCellClick: invalid date");
            return;
        }

        this.calendarElement.find("td").removeClass("selected");
        $(event.target).addClass("selected");
        this.currentCalendarDay = date;

        this._renderAppointments(this.currentCalendarDay);
    }

    _renderCalendar() {
        this.calendarElement.empty();
        const thead = $("<thead>").appendTo(this.calendarElement);
        const tbody = $("<tbody>").appendTo(this.calendarElement);
        const tr = $("<tr>").appendTo(thead);
        ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].forEach(day => $("<th>").text(day).appendTo(tr));
        
        const startingDay = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1).getDay() - 1;
        const totalDays = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 0).getDate();

        let currentDay = 1;
        for (let i = 0; i < 6; i++) {
            const row = $("<tr>").appendTo(tbody);

            for (let j = 0; j < 7; j++) {
                // The end of the month has been reached
                if (currentDay > totalDays) {
                    break;
                }

                // Empty cell before the starting day of the month
                if (i === 0 && j < startingDay) {
                    $("<td>").appendTo(row);
                    continue;
                }

                const cell = $("<td>")
                    .data("date", new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), currentDay))
                    .text(currentDay)
                    .on("click", (event) => this._onCalendarCellClick(event))
                    .appendTo(row);

                if (!this.currentCalendarDay) {
                    this.currentCalendarDay = this.calendarDate;
                }

                if (this.currentCalendarDay && this.currentCalendarDay.getDate() == currentDay && this.currentCalendarDay.getMonth() == this.calendarDate.getMonth() && this.currentCalendarDay.getFullYear() == this.calendarDate.getFullYear()) {
                    cell.addClass("selected");
                }

                currentDay++;
            }
        }

        this.calendarDateElement.text(this.calendarDate.toLocaleString("cs-cz", { month: "short", year: "numeric" }));
        this.calendarElement.append(this.calendarElement);
    }

    load() {
        this.calendarPrevious.on("click", () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this._renderCalendar();
        });

        this.calendarNext.on("click", () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
            this._renderCalendar();
        });

        this._renderCalendar();
        this._renderAppointments(this.currentCalendarDay);
    }
}