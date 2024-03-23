const Logger = require("../Logger");
const Utils = require("../Utils");
const APIError = require("../types/APIError");
const Activity = require("../types/Activity");

module.exports = class ActivitiesManager {
    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;

        /**
         * @private
         * @type {import("../types/Activity")[]}
         */
        this._cache = [];
    }

    /**
     * @private
     * @param {import("../types/Activity")} activity
     */
    _addToCache(activity) {
        if (!(activity instanceof Activity)) {
            throw APIError.InvalidValueType("activity", "Activity");
        }

        if (this._getFromCache(activity)) {
            Logger.debug(Logger.Type.ActivitiesManager, `&c${activity.uuid}&r already exists in cache, updating...`);
            this._cache = this._cache.map(data => data.uuid == activity.uuid ? activity : data);
        } else {
            Logger.debug(Logger.Type.ActivitiesManager, `Caching activity &c${activity.uuid}&r...`);
            this._cache.push(activity);
        }
    }

    /**
     * @private
     * @param {import("../types/DocTypes").ActivityData} options
     */
    _removeFromCache(options) {
        this._cache = this._cache.filter(data => data.uuid != options.uuid);
    }

    /**
     * @private
     * @param {import("../types/DocTypes").ActivityData} options 
     * @returns {import("../types/Activity") | null}
     */
    _getFromCache = (options) => this._cache.find(data => data.uuid == options.uuid)

    _parseActivity(data) {
        if (Utils.validateNumber(data.public)) { data.public = Boolean(data.public) }
        if (data.objectives) { data.objectives = JSON.parse(data.objectives) }
        if (data.edLevel) { data.edLevel = JSON.parse(data.edLevel) }
        if (data.tools) { data.tools = JSON.parse(data.tools) }
        if (data.homePreparation) { data.homePreparation = JSON.parse(data.homePreparation) }
        if (data.instructions) { data.instructions = JSON.parse(data.instructions) }
        if (data.agenda) { data.agenda = JSON.parse(data.agenda) }
        if (data.links) { data.links = JSON.parse(data.links) }
        if (data.gallery) { data.gallery = JSON.parse(data.gallery) }
        
        return data;
    }
    /**
     * @private
     * @param {import("../types/Activity")} activity
     * @param {boolean} edit
     */
    async _saveActivity(activity, edit = false) {
        if (!(activity instanceof Activity)) {
            throw APIError.InvalidValueType("activity", "Activity");
        }
        
        if (await this.getActivity({ uuid: activity.uuid }) && !edit) {
            Logger.debug(Logger.Type.ActivitiesManager, `Not saving activity &c${activity.uuid}&r because it &cexists&r in database and it's not an &cedit&r...`);
            return null;
        }

        if (edit) {
            Logger.debug(Logger.Type.ActivitiesManager, `Updating activity data for &c${activity.uuid}&r in database...`);
            this.core.getDatabase().exec("UPDATE `activities` SET `public` = $public, `activityName` = $activityName, `description` = $description, `objectives` = $objectives, `classStructure` = $classStructure, `lengthMin` = $lengthMin, `lengthMax` = $lengthMax, `edLevel` = $edLevel, `tools` = $tools, `homePreparation` = $homePreparation, `instructions` = $instructions, `agenda` = $agenda, `links` = $links, `gallery` = $gallery `shortDescription` = $shortDescription WHERE `uuid` = $uuid", {
                uuid: activity.uuid,
                public: activity.public ? 1 : 0,
                activityName: activity.activityName,
                description: activity.description,
                objectives: JSON.stringify(activity.objectives),
                classStructure: activity.classStructure,
                lengthMin: activity.lengthMin,
                lengthMax: activity.lengthMax,
                edLevel: JSON.stringify(activity.edLevel),
                tools: JSON.stringify(activity.tools),
                homePreparation: JSON.stringify(activity.homePreparation),
                instructions: JSON.stringify(activity.instructions),
                agenda: JSON.stringify(activity.agenda),
                links: JSON.stringify(activity.links),
                gallery: JSON.stringify(activity.gallery),
                shortDescription: activity.shortDescription
            });
        } else {
            Logger.debug(Logger.Type.ActivitiesManager, `Creating activity data for &c${activity.uuid}&r in database...`);
            this.core.getDatabase().exec("INSERT INTO `activities` (`uuid`, `public`, `activityName`, `description`, `objectives`, `classStructure`, `lengthMin`, `lengthMax`, `edLevel`, `tools`, `homePreparation`, `instructions`, `agenda`, `links`, `gallery`, `shortDescription`) VALUES ($uuid, $public, $activityName, $description, $objectives, $classStructure, $lengthMin, $lengthMax, $edLevel, $tools, $homePreparation, $instructions, $agenda, $links, $gallery, $shortDescription)", {
                uuid: activity.uuid,
                public: activity.public ? 1 : 0,
                activityName: activity.activityName,
                description: activity.description,
                objectives: JSON.stringify(activity.objectives),
                classStructure: activity.classStructure,
                lengthMin: activity.lengthMin,
                lengthMax: activity.lengthMax,
                edLevel: JSON.stringify(activity.edLevel),
                tools: JSON.stringify(activity.tools),
                homePreparation: JSON.stringify(activity.homePreparation),
                instructions: JSON.stringify(activity.instructions),
                agenda: JSON.stringify(activity.agenda),
                links: JSON.stringify(activity.links),
                gallery: JSON.stringify(activity.gallery),
                shortDescription: activity.shortDescription
            });
        }

        this._addToCache(activity);
    }

    saveActivities = (activities) => Promise.all(activities.map(activity => this._saveActivity(activity)))

    /**
     * @returns {Promise<import("../types/Activity")[]>}
     */
    async getActivities() {
        const activities = await this.core.getDatabase().query("SELECT * FROM `activities`");
        Logger.debug(Logger.Type.ActivitiesManager, `Loaded &c${activities.length}&r activities from database`);

        return activities.map(data => new Activity(this._parseActivity(data)));
    }

    /**
     * @param {import("../types/DocTypes").ActivityData} options
     * @returns {Promise<import("../types/Activity") | null>}
     */
    async getActivity(options = {}) {
        let activity = this._getFromCache(options);

        if (!activity) {
            const data = await this.core.getDatabase().query("SELECT * FROM `activities` WHERE `uuid` = ?", [ options.uuid ]);

            if (!Array.isArray(data) || data.length == 0) {
                Logger.debug(Logger.Type.ActivitiesManager, `Activity &c${options.uuid}&r not found`);
                return null;
            }

            activity = new Activity(this._parseActivity(data[0]));
            this._addToCache(activity);
            Logger.debug(Logger.Type.ActivitiesManager, `Loaded activity &c${activity.uuid}&r from database, caching...`);
        } else {
            Logger.debug(Logger.Type.ActivitiesManager, `Found activity &c${activity.uuid}&r in cache`);
        }

        return activity;
    }

    /**
     * @param {import("../types/DocTypes").ActivityData} data
     * @returns {Promise<import("../types/Activity")>}
     */
    async createActivity(data) {
        if (!Utils.validateUUID(data.uuid)) {
            data.uuid = Utils.newUUID();
            while (await this.getActivity({ uuid: data.uuid })) { data.uuid = Utils.newUUID() }
        }

        try {
            const shortDescription = await this.core.getOpenAIManager().complete({
                system: `Vytvoř krátký popis aktivity s názvem "activityName" a popiskem "description" a vrať ho do 3 vět a ve formátu string:\nactivityName: ${data.activityName}\ndescription: ${data.description}`,
                user: `Chci vytvořit novou aktivitu s názvem "${data.activityName}" a popiskem "${data.description}"`
            });

            if (!shortDescription) {
                throw new Error("Failed to generate short description");
            }

            data.shortDescription = shortDescription;
        } catch (error) {
            Logger.warn(Logger.Type.ActivitiesManager, `Failed to generate short description for activity &c${data.uuid}&r: ${error.message}`);
        }

        const activity = new Activity(data);
        await this._saveActivity(activity);
        Logger.debug(Logger.Type.ActivitiesManager, `Created new activity &c${activity.uuid}&r, caching...`);

        return activity;
    }

    createActivities = (data) => Promise.all(data.map(activity => this.createActivity(activity)))
    
    /**
     * @param {import("../types/DocTypes").ActivityData} options 
     * @returns {Promise<boolean>}
     */
    async deleteActivity(options = {}) {
        if (!(await this.getActivity(options))) {
            throw APIError.KeyNotFound("activity");
        }
        
        const result = this.core.getDatabase().exec("DELETE FROM `activities` WHERE `uuid` = ?", [ options.uuid ]);
        if (result.changes != 1) {
            throw APIError.KeyNotDeleted("activity");
        }

        this._removeFromCache(options);
        return true;
    }

    /**
     * @param {import("../types/Activity")} activity
     * @param {import("../types/DocTypes").ActivityData} data 
     * @returns {Promise<import("../types/Activity")>}
     */
    async editActivity(activity, data) {
        if (!(activity instanceof Activity)) {
            throw APIError.InvalidValueType("activity", "Activity");
        }

        activity.edit(data);
        await this._saveActivity(activity, true);

        return activity;
    }

    /**
     * @param {string} query 
     * @returns {Promise<import("../types/Activity")[]>}
     */
    async searchForSameActivitiesWithOpenAI(query) {
        const activities = await this.getActivities();
        const activitiesPrompt = activities.map(activity => {
            const json = {
                uuid: activity.uuid,
                activityName: activity.activityName,
                objectives: activity.objectives.join(", "),
            };

            if (activity.description) { json.description = activity.description; }

            return json;
        }).map(activity => `Activity uuid: "${activity.uuid}", Activity name: "${activity.activityName}", description: "${activity.description}", objectives: "${activity.objectives}"`).join("\n");

        const response = await this.core.getOpenAIManager().complete({
            system: `Prohledej pole "activitiesPrompt" které obsahuje data aktivit a najdi relevantní věci, který se musí spojovat s variablem "query" a vrať to ve formátu UUID[]:\nactivitiesPrompt: ${activitiesPrompt}`,
            user: `Chci najít všechny aktivity. Moje query: ${query}`
        });
        Logger.debug(Logger.Type.ActivitiesManager, `OpenAI response: ${response}`);

        if (!response) {
            return null;
        }

        try {
            return JSON.parse(response);
        } catch (error) {
            if (error instanceof SyntaxError) {
                Logger.debug(Logger.Type.ActivitiesManager, `Failed to parse OpenAI response as JSON, trying to get UUIDs from text...`);

                const matches = response.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
                if (!matches) {
                    return null;
                }

                return matches;
            }

            return null;
        }
    }
}