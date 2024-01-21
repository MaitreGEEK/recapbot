const { QuickDB } = require("quick.db");
const db = new QuickDB();

/**
 * **Get Guild Object from its ID**
 * @param { String } id - GuildId
 * @returns { Object } The Guild Object
 */
async function getGuild(id) {
    let guild = await db.get("guilds." + id)

    if (!guild) {
        guild = {
            entries: [],
            leaves: []
        }

        await db.set("guilds." + id, guild)
    }

    return guild
}

module.exports = {
    getGuild
}