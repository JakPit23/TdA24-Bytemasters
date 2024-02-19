class Dashboard {
    constructor(app) {
        this.app = app;
        this.caledarEl = document.getElementById('calendar');
        this.freeTime = $(['data-freeTime']);
        this.init();
    }

    init = async() => {
        this.calendar();
    }

    calendar = async () => {
      const Calendar = tui.Calendar;
      
      // ToastUI calendar - month view
      const calendar = new Calendar(this.caledarEl, {
        defaultView: 'month',
        taskView: false,
        scheduleView: true,
        useCreationPopup: true,
        useDetailPopup: true,
        template: {
          monthDayname: function(dayname) {
            return '<span class="calendar-week-dayname-name">' + dayname.label + '</span>';
          },
          monthDayname: function(model) {
            return '<span class="tui-full-calendar-weekday-grid-date tui-full-calendar-weekday-grid-date-' + model.day + '">' + model.renderDate + '</span>';
          }
        },
      });

      // next and prev month
      const prevBtn = document.getElementById('prev');
      const nextBtn = document.getElementById('next');
      prevBtn.addEventListener('click', function() {
        calendar.prev();
      });

      nextBtn.addEventListener('click', function() {
        calendar.next();
      });

      // Switch to week selected in month view
      calendar.on('clickSchedule', function(event) {
        const schedule = event.schedule;
        console.log(schedule);
        calendar.changeView('week', true);
      });

      calendar.setTheme({
        common: {
          backgroundColor: '#333',
          border: '1px solid #fff',
          gridSelection: {
            backgroundColor: '#333',
            border: '1px solid rgba(254, 203, 46, 1)'
          },
          dayName: {color: '#fff'},
          holiday: {color: '#fff'},
          saturday: {color: '#fff'},
          today: {color: '#fff', backgroundColor: 'rgba(254, 203, 46, 1)'}
        },
      }) 

  }}
this.cal = new Dashboard();