class Application {
    showLoader = (id = "[data-loaderPage]") => $(id).css("opacity", 1).show()
    hideLoader = (id = "[data-loaderPage]") => $(id).css("opacity", 0).hide()

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