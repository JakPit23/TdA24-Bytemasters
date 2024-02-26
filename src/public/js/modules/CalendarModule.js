class CalendarModule {
    constructor(app) {
        this.app = app;
        this.LecturerAPI = new LecturerAPI();
        this.Calendar = FullCalendar.Calendar;
        this.Draggable = FullCalendar.Draggable;
        this.calendarEl = $('[data-calendar]')[0];
        this.draggableEl = $('[data-draggable]')[0];
        this.exportEl = $('[data-export]')[0];
        this.exportEl.addEventListener('click', this.exportCalendar);
        this.test();
    }

    createCalendar = async(calendarElement) => {
        let calendar = new this.Calendar(calendarElement, {
            locale: 'cs',
            firstDay: 1,
            editable: true,
            droppable: true,
            dayMaxEvents: true,
            buttonText: {
                today: 'Tento měsíc'
            }
        });

        this.calendar = calendar;
        // getLecturers from LecturerAPI and filter it by uuid
        const uuid = this.app.getUUID()[0];
        const lecturer = await this.LecturerAPI.getLecturer(uuid);
        const events = lecturer.events;
        console.log(events);
        this.createEvents(events);
    }

    renderCalendar() {
        this.calendar.setOption('editable', false);
        this.calendar.render();
    }

    createAllDayEvent(title, date) {
        this.calendar.addEvent({
            title: title,
            start: date,
            allDay: true
        });
    }

    createDraggable(element, eventDate) {
        new this.Draggable(element, {
            eventData: function (eventEl) {
                return {
                    title: eventEl.innerText,
                    date: eventDate
                };
            }
        });
    }

    createEvent(title, start, end) {
        this.calendar.addEvent({
            title: title,
            start: start,
            end: end,
            displayEventEnd: true,
        })
        return;        
    }

    createEvents(events) {
        // input data is JSON array of events
        console.log("Generating");
        events.forEach(event => {
            console.log(new Date(event.event.start).toISOString());
            this.createEvent(event.event.name, new Date(event.event.start).toISOString(), new Date(event.event.end).toISOString());
        });
    }

    exportCalendar = async() => {
        const uuid = this.app.getUUID()[0];
        const response = await fetch(`/api/lecturers/${uuid}/event`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    test() {
        this.createCalendar(this.calendarEl);
        this.renderCalendar();
        this.createDraggable(this.draggableEl);
    }

    getEvents = () => {
        return this.calendar.getEvents().map(event => ({
            title: event.title,
            start: event.start.getTime(),
            end: event.end.getTime(),
        }));
    }
}