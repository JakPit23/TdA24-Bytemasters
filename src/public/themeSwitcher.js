function toogleTheme() {
    var theme = document.getElementsByTagName("link")[4];
    var logo = document.getElementById("logo");
    var icons = document.getElementById("icons");
    if(theme.getAttribute('href') == 'light.css') {
        theme.setAttribute('href', '../public/styles/dark.css')
        logo.setAttribute('src', "../public/images/logo_dark.png");
        icons.setAttribute('src', '#')
        console.log("THEME DARK")
    } else {
        theme.setAttribute('href' ,'../public/styles/light.css');
    }
}