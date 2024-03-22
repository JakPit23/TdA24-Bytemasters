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
     * @param {string} prompt
     * @returns {Promise<string>}
     */
    async complete(prompt) {
        const completion = await this.openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "gpt-3.5-turbo",
        })

        return completion.choices[0];
    }
}