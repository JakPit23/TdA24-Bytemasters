class Page {
    /**
     * @param {Application} app 
     */
    constructor(app) {
        this.app = app;
        this.api = new API();

        this.loginForm = $('[data-loginForm]');

        this.init();
    }

    async init() {
        this.loginForm.on('submit', this.login.bind(this));
        this.app.hideLoader();
    }

    async login(event) {
        event.preventDefault();

        const loginButton = this.loginForm.find(":submit");
        const username = $('[data-userInput="username"]').val();
        const password = $('[data-userInput="password"]').val();

        try {
            await this.api.authLogin({ username, password });

            setTimeout(() => window.location.href = "/dashboard", 1000);
            loginButton.prop('disabled', true).addClass("!btn-success").text("Úspěšně přihlášeno");
        } catch (error) {
            loginButton.prop("disabled", true).addClass("!btn-error").text(error.displayMessage);
            setTimeout(() => loginButton.prop("disabled", false).removeClass("!btn-error").text("Přihlásit se"), 2500);
        }
    }
}