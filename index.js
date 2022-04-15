const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { prefix } = require("./config.json");
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const { Player } = require("discord-player");
const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_VOICE_STATES",
        "GUILD_MESSAGES",
        "DIRECT_MESSAGES"
    ]
});

const botToken = process.env.TOKEN
const LoadSlash = process.argv[2] == "load";
const botID = process.env.BOT_CLIENT_ID;
const guildID = process.env.BOT_GUILD_ID;

client.slashcommands = new Discord.Collection();
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

let commands = [];

const slashFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of slashFiles) {
    const slashcmd = require(`./commands/${file}`);
    client.slashcommands.set(slashcmd.data.name, slashcmd);
    if (LoadSlash) commands.push(slashcmd.data.toJSON());
}

if (LoadSlash) {
    const rest = new REST({ version: "10" }).setToken(botToken);
    console.log("Slash commands initiated!");
    rest.put(Routes.applicationGuildCommands(botID, guildID), { body: commands })
        .then(() => {
            console.log("Loaded Sucessfully!");
            process.exit(0);
        })
        .catch((err) => {
            console.log(err);
            process.exit(1);
        })
} else {
    client.on('ready', () => {
        console.log(`${client.user.tag} ready to serve!`);
    });
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return
            const slashCmd = client.slashcommands.get(interaction.commandName);
            if (!slashCmd) interaction.reply("Not a valid slash command, master!");

            await interaction.deferReply();
            await slashCmd.run({ client, interaction });
        }

        handleCommand();
    })
    client.login(botToken);
}