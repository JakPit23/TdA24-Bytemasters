class Page {
    constructor(app) {
        this.app = app;
        this.api = new API();

        this.searchBar = $("[data-searchInput]");
        this.activitiesList = $("[data-activities]");
        this.logoutButton = $("[data-logout]");
        this.activityHistoryButton = $("[data-activityHistory]");

        this.init();
    }

    async init() {
        await this.loadActivities();
        this.searchBar.on("input", () => this.fetchSearch());   
        this.logoutButton.on("click", this.authLogout.bind(this));
        this.activityHistoryButton.on("click", this.loadActivities.bind(this, null, { showOnlyPrivate: true }));

        this.app.hideLoader();
    }

    async loadActivities(activities = null, filters = {}) {
        this.activitiesList.empty();
        if (!activities) {
            console.log("[DEBUG] Activities are null, fetching...");
            const fetchOptions = { limit: 25 };

            const lastActivityUUID = this.activitiesList.last().data("uuid");
            if (lastActivityUUID) {
                console.log(`[DEBUG] UUID of the last activity: ${lastActivityUUID}`);
                fetchOptions["after"] = lastActivityUUID;
            }

            activities = await this.api.getActivities(fetchOptions);

            if (filters && filters.showOnlyPrivate) {
                console.log("[DEBUG] Filtering out public activities");
                activities = activities.filter(activity => activity.public == false);
            }
        }

        this.app.hideLoader("[data-loaderPage='activities']");

        if (activities.length == 0) {
            $("<h1>").text("Žádné aktivity nebyly nalezeny").addClass("col-span-3 mx-auto text-3xl font-bold").appendTo(this.activitiesList);
            return;
        }

        activities.forEach(activity => this.renderActivity(activity));
    }

    async _fetchSearch() {
        if (this.searchNow + 500 > Date.now()) {
            console.log("[DEBUG] Search throttled");
            return;
        }

        this.app.showLoader("[data-loaderPage='activities']");
        const search = this.searchBar.val();
        if (!search || search.length == 0) {
            console.log("[DEBUG] Search is empty, loading all activities");
            this.loadActivities();
            return;
        }

        console.log(`[DEBUG] Searching for "${search}"`);

        const activities = await this.api.searchActivities(search);
        this.loadActivities(activities);
    }

    async fetchSearch() {
        this.searchNow = Date.now();
        setTimeout(() => this._fetchSearch(), 500);
    }

    renderActivity(data) {
        const activityBox = $("<div>")
            .addClass("activity")
            .data("uuid", data.uuid)
            .on("click", () => window.location.href = `/activity/${data.uuid}?edit=true`)
            .appendTo(this.activitiesList);
        
        if (Array.isArray(data.gallery)) {
            data.gallery.some((gallery, galleryIndex) => {
                if (!Array.isArray(gallery.images) && gallery.images.length == 0) {
                    console.log(`[DEBUG] gallery.images[${galleryIndex}] is empty`);
                    return;
                }

                for (const image of gallery.images) {
                    console.log(`[DEBUG] Adding image to activity ${data.uuid}: gallery.images[${galleryIndex}]`);
                    $("<img>").attr("src", image.lowRes || image.highRes).addClass("activity-image").appendTo(activityBox);
                    return;
                }
            });
        }

        const activityDescription = $("<div>").addClass("flex flex-col").appendTo(activityBox);
        $("<h2>").text(data.activityName).addClass("font-bold text-2xl").appendTo(activityDescription);

        if (data.shortDescription || data.description) {
            $("<p>").text(data.shortDescription || data.description).appendTo(activityDescription);
        } else {
            console.log(`[DEBUG] Activity ${data.uuid} has no description`);
        }
    }

    async authLogout() {
        try {
            this.logoutButton.prop("disabled", true);
            await this.api.authLogout();
            window.location.href = "/";
        } catch (error) {
            this.logoutButton.addClass("btn-error");

            console.error("An error occurred while logging out:", error);
            setTimeout(() => this.logoutButton.removeClass("btn-error").prop("disabled", false), 1500);
        }
    }

}