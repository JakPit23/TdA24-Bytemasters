class CalendarModule {
    constructor(app) {
        this.app = app;
        this.Calendar = FullCalendar.Calendar;
        this.Draggable = FullCalendar.Draggable;
        this.calendarEl = $('[data-calendar]')[0];
        this.draggableEl = $('[data-draggable]')[0];
        this.test();
    }

    createCalendar(calendarElement) {
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
            end: end
        })        
    }

    exportCalendar = async() => {
        const uuid = this.app.getUUID()[0];
        console.log(uuid);
        console.log("exporting events...");
        const upload = await fetch(`/api/lecturers/${uuid}/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                events: [
                    {
                        title: "AHOJDA",
                        start: "2024-02-24T07:30:00.000Z",
                        end: "2024-02-25T12:45:00.000Z"
                    }
                ]
            })
        })
        const response = await fetch(`/api/lecturers/${uuid}/event`);
        console.log(response);  
    }

    test() {
        this.createCalendar(this.calendarEl);
        this.renderCalendar();
        this.createEvent("AHOJDA", "2024-02-24T07:30:00.000Z", "2024-02-25T12:45:00.000Z");
        this.createAllDayEvent('test', '2024-02-21');
        this.createDraggable(this.draggableEl);
        this.exportCalendar();
    }

    getEvents = () => {
        return this.calendar.getEvents().map(event => ({
            title: event.title,
            start: event.start.getTime(),
            end: event.end.getTime(),
        }));
    }
}