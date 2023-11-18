class ThemeManager {
    static getDOM() {
        var logo = document.getElementById("logo");
        var icons = document.getElementById("icons");
        var theme = document.getElementsByTagName("link")[4];
        return [logo, icons, theme];
    }

    static getSystemTheme() {
        var systemTheme;
        if(window.matchMedia('(prefers-color-scheme: dark)').matches === true) {
            systemTheme = "dark";
        } else {
            systemTheme = "light";
        }
        return systemTheme;
    }

    static setThemeBySystem() {
        var documentArray = this.getDOM();
        var systemTheme = this.getSystemTheme();
        console.log(documentArray);
        if(systemTheme === "dark") {
            documentArray[2].setAttribute("href", "../public/styles/dark.css");
            documentArray[0].setAttribute("src", "../public/images/logo_dark.png");
            documentArray[1].setAttribute("src", "../public/images/icons_dark.png");
        } else {
            documentArray[2].setAttribute("href", "../public/styles/light.css");
            documentArray[0].setAttribute("src", "../public/images/logo_light.png");
            documentArray[1].setAttribute("src", "../public/images/icons_light.png");
        }

        return "Theme Changed";
    }

    static setTheme() {
        var documentArray = this.getDOM();
        if(documentArray[2].getAttribute("href") == "../public/styles/light.css") {
            documentArray[2].setAttribute("href", "../public/styles/dark.css");
            documentArray[0].setAttribute("src", "../public/images/logo_dark.png");
            documentArray[1].setAttribute("src", "../public/images/icons_dark.png");
        } else {
            documentArray[2].setAttribute("href", "../public/styles/light.css");
            documentArray[0].setAttribute("src", "../public/images/logo_light.png");
            documentArray[1].setAttribute("src", "../public/images/icons_light.png");

        }
    }
}
