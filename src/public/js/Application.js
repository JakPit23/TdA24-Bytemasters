class Application {
    constructor() {
        this.page = new Page(this);
        this.themeSwitcher = $('[data-themeSwitcher]');
        this.themeSwitcherDarkIcon = $('[data-themeSwitcher-icon="dark"]');
        this.themeSwitcherLightIcon = $('[data-themeSwitcher-icon="light"]');

        this.themeSwitcher.on('click', () => this.toggleTheme());
        this.initTheme();
    }

    initTheme = () => {
        if (localStorage.theme === 'light' || (!(localStorage.theme) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            this.themeSwitcherLightIcon.hide();
            return;
        }
        
        $('html').addClass('dark');
        this.themeSwitcherDarkIcon.hide();
    }

    toggleTheme = () => {
        if (localStorage.theme == 'light') {
            $('html').addClass('dark');
            localStorage.theme = 'dark';

            this.themeSwitcherLightIcon.show();
            this.themeSwitcherDarkIcon.hide();
            return;
        }
        
        $('html').removeClass('dark');
        localStorage.theme = 'light';

        this.themeSwitcherDarkIcon.show();
        this.themeSwitcherLightIcon.hide();
    }

    hideLoader() {
        $('[data-loader]').css("opacity", 0);
        $('[data-loader]').remove();
    }
}

this.app = new Application();