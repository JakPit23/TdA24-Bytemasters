class DashboardPage {
    constructor(app) {
        this.app = app;
        this.calendar = new CalendarModule();
        this.calendar.test();
    }
    
    test() {
      this.createCalendar(document.getElementById('calendar'));
      this.renderCalendar();
      this.createAllDayEvent('test', '2024-02-21');
      this.createDraggable(document.getElementById('external-events'));
    }
}

new DashboardPage();