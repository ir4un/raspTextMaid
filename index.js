import { Client, GatewayIntentBits, Collection, EmbedBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import fs from "fs"; // Node's built-in file system module
import dotenv from "dotenv";
import path from "path"; // Import path module to handle file paths
import { Player } from 'discord-player';
import { YoutubeiExtractor } from "discord-player-youtubei"
import { fileURLToPath } from 'url'; // Import fileURLToPath to convert URL to path
import { dirname } from 'path';
import { getData } from "./support/plate-code.js"; // Adjust the path if necessary

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configData = JSON.parse(fs.readFileSync(path.join(__dirname, "resources/config.json")));
const licenseData = path.join(__dirname, 'resources/licenseData.json');// Path to save the licenseData file
const trackingDataPath = path.join(__dirname, 'resources/trackingData.json');// Path to save the trackingData file
const guildsFilePath = path.join(__dirname, "resources/guilds.json");
const botToken = process.env.BOT_TOKEN;
const LoadSlash = process.argv[2] === "load";
const botID = process.env.BOT_CLIENT_ID;
const rest = new REST({ version: "10" }).setToken(botToken);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    allowedMentions: { parse: ["users"] }
});


client.slashcommands = new Collection();
client.commands = new Collection();
const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

client.player = player;

await player.extractors.loadDefault();
player.extractors.register(YoutubeiExtractor);
let commands = [];
let commandList = [];

// Function to get all command files recursively
const getAllCommandFiles = (dir) => {
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            files = [...files, ...getAllCommandFiles(fullPath)]; // Recursion for directories
        } else if (file.endsWith('.js')) {
            files.push(fullPath); // Collecting the full path
        }
    });
    return files;
};

// Function to clear and reload commands
async function refreshSlashCommands(guildIDs) {
    try {
        console.log('Started refreshing application (/) commands...');

        const deletePromises = guildIDs.map(async guildID => {

            console.log('Started clearing global commands...');
            await rest.put(Routes.applicationCommands(botID), { body: [] })

            console.log('Successfully deleted all global commands.');

            // Fetch current guild commands
            const commands = await rest.get(Routes.applicationGuildCommands(botID, guildID));
            // Delete each command
            const deletePromises = commands.map(command =>
                rest.delete(Routes.applicationGuildCommand(botID, guildID, command.id))
            );
            await Promise.all(deletePromises);
            console.log(`Deleted commands in guild ${guildID}`);

            // Re-register the updated commands
            await rest.put(Routes.applicationGuildCommands(botID, guildID), { body: commandsToRegister });
            console.log(`Re-registered commands in guild ${guildID}`);
        });

        await Promise.all(deletePromises);

        console.log('Successfully refreshed application (/) commands.');
    } catch (error) {
        console.error('Error refreshing commands:', error);
    }
}

// Get all command files
const commandFiles = getAllCommandFiles(path.join(process.cwd(), 'commands')); // Use process.cwd() for the root directory

// Read command files for slash commands
for (const file of commandFiles) {
    const slashcmd = await import("file://" + file); // Convert backslashes to forward slashes
    const commandName = path.basename(file, '.js'); // Extract command name without .js extension
    const commandEntry = { name: commandName, prefix: '✅', slash: '✅' }; // Default values

    try {
        if (slashcmd.commandTitle && slashcmd.commandTitle.data && slashcmd.commandTitle.data.name) {
            client.slashcommands.set(slashcmd.commandTitle.data.name, slashcmd);
            if (LoadSlash) commands.push(slashcmd.commandTitle.data.toJSON());
        } else {
            commandEntry.slash = '❌'; // Mark slash command with 'x'
        }
    } catch (error) {
        console.error(`Error loading slash command from ${file}:`, error);
    }

    try {
        // Convert to file URL format for import
        if (slashcmd.commandTitle && slashcmd.commandTitle.prefixRun) {
            const command = await import(`file://${path.resolve(file)}`); // Use path.resolve to get absolute path
            client.commands.set(commandName.toLowerCase(), command); // Store command using the command name
        } else {
            commandEntry.prefix = '❌'; // Mark slash command with 'x'
        }

    } catch (error) {
        console.error(`Error loading prefix command from ${file}:`, error);
    }

    commandList.push(commandEntry);
}



// Load command registration only if needed
if (LoadSlash) {


    // Get all guild IDs the bot is currently in
    const guildIDslist = loadGuildIDs();
    const currentGuildIDs = client.guilds.cache.map(guild => guild.id);

    // Save guild IDs to the JSON file if not already saved
    currentGuildIDs.forEach(guildID => {
        if (!guildIDslist.includes(guildID)) {
            guildIDslist.push(guildID);
            console.log(`Added guild ID: ${guildID}`);
        }
    });

    // Save the updated guild IDs back to the JSON file
    saveGuildIDs(guildIDslist);

    console.log("Guild IDs saved to guilds.json.");
    const guildIDs = JSON.parse(fs.readFileSync('resources/guilds.json')); // Populate this array with your target guild IDs

    refreshSlashCommands(guildIDs);

    const promises = guildIDs.map(guildID => {
        return rest.put(Routes.applicationGuildCommands(botID, guildID), { body: commands })
            .then(() => console.log(`Loaded commands for guild ${guildID} successfully!`))
            .catch(err => console.error(`Failed to load commands for guild ${guildID}:`, err));
    });

    Promise.all(promises)
        .then(() => {
            // After the loop, log the complete command list
            console.log(`--- List of Added Commands ---`);
            const nameWidth = 15; // Width for command names
            const prefixWidth = 8; // Width for prefix column
            const slashWidth = 8; // Width for slash column

            console.log(`Name${' '.repeat(nameWidth - 4)}Prefix${' '.repeat(prefixWidth - 6)}Slash`); // Print the header
            commandList.forEach(cmd => {
                // Format each command's details with fixed width
                console.log(`${cmd.name.padEnd(nameWidth)}${cmd.prefix.padEnd(prefixWidth)}${cmd.slash.padEnd(slashWidth)}`);
            });
            console.log("All commands loaded successfully!");
            process.exit(0);
        })
        .catch(err => {
            console.error("Error loading commands:", err);
            process.exit(1);
        });
} else {

    client.on('ready', () => {
        console.log(`${client.user.tag} ready to serve!`);

        setInterval(trackLicensePlates, 1800000);
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;


        const slashCmd = client.slashcommands.get(interaction.commandName);
        if (!slashCmd) {
            console.error(`Command not found: ${interaction.commandName}`);
            return interaction.reply("Not a valid slash command, master!");
        }

        await interaction.deferReply(); // Defer the reply to indicate processing time

        try {
            // Execute the command, passing the interaction to it
            await slashCmd.commandTitle.run({ client, interaction });
            // Assuming the command handles its own response
        } catch (error) {
            console.error('Error executing command:', error);
            // If the command didn't reply, we can send an error message
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });

    // Handle incoming messages
    client.on('messageCreate', async (message) => {

        if (message.author.bot) return; // Ignore bot messages

        if (!message.content.startsWith(configData.prefix)) return;

        const args = message.content.slice(configData.prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        const command = await client.commands.get(commandName);

        try {
            // Check if prefixRun exists in the commandTitle object, if not, it will ignore
            if (command.commandTitle && typeof command.commandTitle.prefixRun === 'function') {
                await command.commandTitle.prefixRun(client, message, args); // Executes prefix command
            }
            // await message.delete(); // Deletes the message
        } catch (error) {
            console.error(error);
            await message.reply('I am sorry master! I can’t seem to understand what you are trying to say :^(');
        }
    });



}

// Function to load existing guild IDs from the JSON file
function loadGuildIDs() {
    if (fs.existsSync(guildsFilePath)) {
        const data = fs.readFileSync(guildsFilePath, "utf8");
        return JSON.parse(data);
    }
    return []; // Return an empty array if the file does not exist
}

// Store the guild IDs
function saveGuildIDs(guildIDs) {
    fs.writeFileSync(guildsFilePath, JSON.stringify(guildIDs, null, 2), "utf8");
}

const trackLicensePlates = async () => {
    try {
        const newData = await getData(); // Fetch new data

        // Check if the licenseData file exists
        if (!fs.existsSync(licenseData)) {
            console.log("licenseData file not found, creating it with initial data.");
            fs.writeFileSync(licenseData, JSON.stringify(newData, null, 2)); // Save newData as the initial data
            console.log("Initial licenseData file created.");
            return; // Exit the function as this is the first data set
        }

        // Check if the tracking data file exists
        if (!fs.existsSync(trackingDataPath)) {
            return; // Exit the function if the tracking data file does not exist
        }

        // Read current license data from the file
        const currentData = JSON.parse(fs.readFileSync(licenseData, "utf8"));

        // Check if the current data is the same as the retrieved data
        if (JSON.stringify(newData) === JSON.stringify(currentData)) {
            console.log("No changes detected, skipping update.");
            return; // Exit the function if there's no change
        }

        const changes = {};
        for (const region in newData) {
            changes[region] = newData[region].filter(currPlate => {
                const prevPlate = currentData[region]?.find(p => p.state === currPlate.state);
                return !prevPlate || prevPlate.plate !== currPlate.plate; // Identify changed plates
            });
        }

        // Define categories
        const regions = {
            Peninsular: ["JOHOR", "KEDAH", "KELANTAN", "MELAKA", "NEGERI SEMBILAN", "PAHANG", "PENANG", "PERAK", "PERLIS", "SELANGOR", "TERENGGANU", "KUALA LUMPUR"],
            Sarawak: ["KAPIT", "BINTULU", "MIRI", "SIBU"],
            Sabah: ["BEAUFORT", "KENINGAU", "TAWAU", "KOTA KINABALU"]
        };

        // Prepare embed message for changes
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("License Plate Updates")
            .setDescription("Here are the latest changes in license plates:");

        let hasChanges = false;

        // Group changes by region
        for (const [regionName, states] of Object.entries(regions)) {
            let regionChanged = false;
            let regionText = '';

            for (const state of states) {
                const stateChanges = changes[regionName]?.filter(item => item.state === state) || [];

                if (stateChanges.length > 0) {
                    regionChanged = true;
                    for (const item of stateChanges) {
                        const prevPlate = currentData[regionName]?.find(p => p.state === item.state);
                        const oldPlate = prevPlate ? prevPlate.plate : 'N/A';
                        regionText += `${oldPlate} ➡️ ${item.plate} - ${item.state}\n`;
                    }
                }
            }

            if (regionChanged) {
                hasChanges = true;
                embed.addFields({
                    name: `${regionName}`,
                    value: regionText,
                    inline: false,
                });
            }
        }

        // Check tracking data for channels with the toggle on and send the embed
        const trackingData = JSON.parse(fs.readFileSync(trackingDataPath, "utf8"));

        for (const [key, value] of Object.entries(trackingData.channelTracking)) {
            if (value.toggle) {
                const channelId = key.split('_')[1];
                const channel = await client.channels.fetch(channelId);

                if (hasChanges && channel) {
                    await channel.send({ embeds: [embed] });
                }
            }
        }

        // Update the license data with the new data
        fs.writeFileSync(licenseData, JSON.stringify(newData, null, 2));
        console.log("License plate data retrieved and updated!");

    } catch (error) {
        console.error("Error updating license plate data:", error);
    }
};







client.login(botToken);
