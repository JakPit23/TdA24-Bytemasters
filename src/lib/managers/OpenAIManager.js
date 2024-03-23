const { OpenAI } = require("openai");
const Config = require("../Config");

module.exports = class OpenAIManager {
    /**
     * @param {import("../Core")} core
     */
    constructor(core) {
        this.core = core;
        this.openai = new OpenAI({
            apiKey: Config.openAIKey
        });
    }

    /**
     * @param {{ user: string, system: string }} prompts
     * @returns {Promise<string>}
     */
    async complete(prompts) {
        const completion = await this.openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: prompts.system
                },
                {
                    role: "user",
                    content: prompts.user
                }
            ],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0];
    }
}