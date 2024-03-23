/**
 * @typedef {object} UserData
 * @property {string} uuid
 * @property {import("./user/UserType")} type
 * @property {string} username
 * @property {string} password
 * @property {Date} createdAt
*/

/**
 * @typedef {object} UserIdentification
 * @property {string} uuid
 * @property {string} username
*/

/**
 * @typedef {object} ActivityData
 * @property {string} uuid
 * @property {boolean} public
 * @property {string} activityName
 * @property {string} description
 * @property {string[]} objectives
 * @property {string} classStructure
 * @property {number} lengthMin
 * @property {number} lengthMax
 * @property {string[]} edLevel
 * @property {string[]} tools
 * @property {Array<{title: string, warn: string, note: string}>} homePreparation
 * @property {Array<{title: string, warn: string, note: string}>} instructions
 * @property {Array<{duration: number, title: string, description: string}>} agenda
 * @property {Array<{title: string, url: string}>} links
 * @property {Array<{title: string, images: Array<{lowRes: string, highRes: string}>}>} gallery
 * @property {string} shortDescription
 * @property {string} summary
 */

module.exports = {
    UserData,
    UserIdentification,
    ActivityData
}