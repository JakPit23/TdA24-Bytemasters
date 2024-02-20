class Dashboard {
    constructor(app) {
        this.app = app;
        this.Calendar = FullCalendar.Calendar;
        this.Draggable = FullCalendar.Draggable;
        this.test();
    }
    
    createCalendar(calendarElement) {
      let calendar = new this.Calendar(calendarElement, {
        editable: true,
        droppable: true,
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

    createDraggable(element) {
      new this.Draggable(element, {
        eventData: function(eventEl) {
          return {
            title: eventEl.innerText,
            date: '2024-02-21'
          };
        }
      });
    
    }
    
    test() {
      this.createCalendar(document.getElementById('calendar'));
      this.renderCalendar();
      this.createAllDayEvent('test', '2024-02-21');
      this.createDraggable(document.getElementById('external-events'));
    }
}

new Dashboard();