class Application {
    constructor() {
        this.themeSwitcher = $('[data-themeSwitcher]');
        this.themeSwitcherIcon = $('[data-themeSwitcher-icon]');

        this.themeSwitcher.on("click", () => this.toggleTheme());
        this.init();
    }

    init() {
        this.initTheme();
    }

    initTheme() {
        if (localStorage.theme == "light" || (!localStorage.theme && window.matchMedia("(prefers-color-scheme: light)").matches)) {
            return this.themeSwitcherIcon.addClass("fa-moon");
        }
        
        $('html').addClass('dark');
        return this.themeSwitcherIcon.addClass("fa-sun");
    }

    toggleTheme = () => {
        if (localStorage.theme == 'light') {
            $('html').addClass('dark');
            localStorage.theme = 'dark';

            return this.themeSwitcherIcon.removeClass("fa-moon").addClass("fa-sun");
        }
        
        $('html').removeClass('dark');
        localStorage.theme = 'light';
        
        return this.themeSwitcherIcon.removeClass("fa-sun").addClass("fa-moon");
    }

    hideLoader = (id = "[data-loaderPage]") => $(id).css("opacity", 0).remove()

    
    /**
     * @param {string} val 
     * @returns {Date} 
     */
    getDateTimeFromString(val) {
        const [ date, time ] = val.split('T');
        const [ year, month, day ] = date.split('-');
        const [ hour, minute ] = time.split(':');

        return new Date(year, month - 1, day, hour, minute);
    }

    /**
     * @param {string} val 
     * @returns {Date} 
     */
    getTimeFromString(val) {
        const [ hour, minute ] = val.split(':');

        const date = new Date();
        date.setHours(hour, minute);
        return date;
    }
}