const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const fs = require('fs');
const { getGuild } = require("../functions")

module.exports = {
    data: {
        name: 'get-list',
        description: 'Get the list of entries, exits, or both.',
        options: [
            {
                name: 'type',
                description: 'Select the type of list to retrieve.',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                choices: [
                    //{ name: 'Both', value: 0 },
                    { name: 'Entries', value: 1 },
                    { name: 'Exits', value: 2 },
                ],
            },
        ],
    },
    async execute(interaction) {
        let { guildId, channelId } = interaction
        let listType = interaction.options.getInteger('type');

        let type;
        switch (listType) {
            /*case 0:
                listMessage = 'Here is the combined list of entries and exits:';
                break;*/
            case 1:
                type = "entries"
                break;
            case 2:
                type = "leaves"
                break;
            default:
                return interaction.reply('Invalid list type selected.');
        }

        let guild = await getGuild(guildId)
        let itemsRaw = guild[type]

        let items = ["USERNAME - ID - TIME"]
        for (let item of itemsRaw) {
            let split = item.split("$") //split[0] is ID, split[1] is username#timestamp
            let split2 = split[1].split("#") // split2[0] is username, split2[1] is timestamp
            let date = new Date(parseInt(split2[1], 10))

            items.push(`${split2[0]} - ${split[0]} - ${date.toLocaleTimeString() + " " + date.toLocaleDateString()}`)
        }

        // Write the list of items to the file
        fs.writeFileSync(guildId + type, items.join('\n'), 'utf-8');

        // Read the file to get its content
        let fileContent = fs.readFileSync(guildId + type, 'utf-8');

        interaction.reply({ content: `Here is the list of ${type}:`, files: [{ attachment: Buffer.from(fileContent), name: type + ".txt" }] });

        fs.unlinkSync(guildId + type);
    },
};