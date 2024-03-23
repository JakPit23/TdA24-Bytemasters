class Page {
    constructor(app) {
        this.app = app;
        this.api = new API();

        this.logoutButton = $("[data-logout]");

        this.init();
    }


    async init() {

        this.logoutButton.on("click", this.authLogout.bind(this));
       
        this.app.hideLoader();
    }
    async authLogout() {
        try {
            this.logoutButton.prop("disabled", true);
            console.log("Logging out");
            await this.api.authLogout();
            window.location.href = "/";
        } catch (error) {
            this.logoutButton.addClass("btn-error");

            console.error("An error occurred while logging out:", error);
            setTimeout(() => this.logoutButton.removeClass("btn-error").prop("disabled", false), 1500);
        }
    }

}