class Application {
    constructor() {
        this.page = new Page(this);
    }

    hideLoader() {
        $('[data-loader]').css("opacity", 0);
        $('[data-loader]').remove();
    }
}

this.app = new Application();