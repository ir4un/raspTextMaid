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

    ],
    allowedMentions: ["users"]
});

const botToken = process.env.TOKEN
const LoadSlash = process.argv[2] == "load";
const botID = process.env.BOT_CLIENT_ID;
const guildID = process.env.BOT_GUILD_ID;

client.slashcommands = new Discord.Collection();
client.commands = new Discord.Collection();

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

let commands = [];

const slashFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


// Read command files for slash commands
for (const file of slashFiles) {
    const slashcmd = require(`./commands/${file}`);
    try {
        client.slashcommands.set(slashcmd.data.name, slashcmd)
        if (LoadSlash) commands.push(slashcmd.data.toJSON());
    } catch (error) {
        console.log("🚀 ~ file: index.js ~ line 47 ~ error", error)
    }
}

// Read command files for prefix commands
for (const file2 of commandFiles) {
    const commandName = file2.split(".")[0]
    const command = require(`./commands/${file2}`);
    client.commands.set(commandName, command);
}


if (LoadSlash) { // Runs if the bot is turned on with "node index.js load"
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
} else { // Runs if the bot is turned on with "node index.js"

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

    client.on('messageCreate', async (message) => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);
        // console.log(command)
        if (!client.commands.has(commandName)) return;

        try {
            await command.prefixRun(client, message, args) // Executes prefix command
            message.delete(1000);
        } catch (error) {
            console.error(error);
            message.reply('I am sorry master! I cant seem to understand what you are tryna say :^(');
        }
        // ...
    });



    client.login(botToken);
}