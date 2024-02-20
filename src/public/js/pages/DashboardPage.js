class DashboardPage {
    constructor(app) {
        this.app = app;
        this.calendar = new CalendarModule();
        this.calendar.test();
    }
    
    test() {
      this.createCalendar(this.calendarElement[0]);
      this.renderCalendar();
      this.createAllDayEvent('test', '2024-02-21');
      this.createDraggable(this.draggableElement[0]);
    }
}

this.dash = new DashboardPage(this.app);