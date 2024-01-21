const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const { getGuild } = require("./functions")

const { TOKEN, ClientId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data);
    client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(ClientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (!client.commands.has(commandName)) return;

    try {
        const command = client.commands.get(commandName);
        command.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('guildMemberAdd', async member => {
    let guild = await getGuild(member.guild.id)

    guild.entries.push(`${member.user.id}$${member.user.tag}#${Date.now()}`)

    await db.set("guilds." + member.guild.id, guild)
});

client.on('guildMemberRemove', async member => {
    let guild = await getGuild(member.guild.id)

    guild.leaves.push(`${member.user.id}$${member.user.tag}#${Date.now()}`)

    await db.set("guilds." + member.guild.id, guild)
});


client.login(TOKEN);

