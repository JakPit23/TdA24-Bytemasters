class Dashboard {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init = async() => {
        this.calendar();
    }

    calendar = async () => {
        document.addEventListener('DOMContentLoaded', function() {
            var calendarEl = document.getElementById('calendar');
            var calendar = new FullCalendar.Calendar(calendarEl, {
              initialView: 'dayGridMonth',
              locale: 'eu',
              firstDay: 1,
              buttonText: {
                today: 'Dnes',
                month: 'Měsíc',
                week: 'Týden',
                day: 'Den',
                list: 'Seznam'
              },
              fixedWeekCount: false,
            });
            calendar.render();
          });
    
    }
}

this.cal = new Dashboard();