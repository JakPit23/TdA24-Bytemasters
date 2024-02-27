class CalendarModule {
    constructor(app, uuid) {
        this.app = app;
        this.uuid = uuid;
        this.LecturerAPI = new LecturerAPI();
        this.Calendar = FullCalendar.Calendar;
        this.Draggable = FullCalendar.Draggable;
        this.calendarEl = $('[data-calendar]')[0];
        this.draggableEl = $('[data-draggable]')[0];
        this.exportEl = $('[data-export]')[0];
        this.exportEl.addEventListener('click', this.exportCalendar);
        this.init();
    }

    init = async() => {
        this.createCalendar(this.calendarEl);
        this.renderCalendar();
        this.createDraggable(this.draggableEl);
    } 

    createCalendar = async(calendarElement) => {
        let calendar = new this.Calendar(calendarElement, {
            width: '100%',
            locale: 'cs',
            firstDay: 1,
            editable: true,
            droppable: true,
            dayMaxEvents: true,
            buttonText: {
                today: 'Tento měsíc'
            },
            eventClick: function(info) {
                let result = confirm("Opravdu chcete smazat událost?");
                if(result) {
                    info.event.remove();
                }
            },
            drop : function(info) {
                console.log(info);
                calendar.addAllDayEvent(info.eventData.title, info.dateStr);
            }
        });

        this.calendar = calendar;;
        const lecturer = await this.LecturerAPI.getLecturer(this.uuid);
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
            allDay: true,
        });
    } 

    createDraggable = async(element, eventDate) => {
        this.dragObj = new this.Draggable(element, {
            eventData: function (eventEl) {
                console.log({
                    title: eventEl.innerText,
                    date: eventDate,
                    create: true,
                });
                return {
                    title: eventEl.innerText,
                    date: eventDate,
                    create: true,
                };
                }
            }
        );

        console.log(this.dragObj.eventData);
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


    deleteEvent = (event) => {
        event.remove();
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
        const response = await fetch(`/api/lecturers/${this.uuid}/event`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    getEvents = () => {
        return this.calendar.getEvents().map(event => ({
            title: event.title,
            start: event.start.getTime(),
            end: event.end.getTime(),
        }));
    }
}