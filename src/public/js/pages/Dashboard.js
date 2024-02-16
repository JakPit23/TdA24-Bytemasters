class Dashboard {
    constructor(app) {
        this.app = app;
        console.log('Dashboard');
        this.calendar();
    }

    calendar = async () => {
        console.log('calendar');
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
              fixedWeekCount: false
            });
            calendar.render();
          });
    
    }
}

this.cal = new Dashboard();