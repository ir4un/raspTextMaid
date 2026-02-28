import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js"; // Import EmbedBuilder correctly
import fs from "fs"; // File system module for reading and writing the JSON file
import path from "path"; // Import path module to handle file paths
import { fileURLToPath } from 'url'; // Import fileURLToPath to convert URL to path
import { findLatestPlateNumber } from "../../support/plate-code.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate to the main project directory from "commands/plate/" 
const mainDirPath = path.join(__dirname, "../../"); // Adjust this to go two levels up to reach the main project folder
const filePath = path.join(mainDirPath, "resources", "userPlates.json"); // Final file path: /resources/userPlates.json


// Check if the userPlates.json file exists, and create it if it doesn't
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

const userPlates = JSON.parse(fs.readFileSync(filePath, "utf8")); // Load the JSON data

// Save updated data back to the file
function saveData() {
    fs.writeFileSync(filePath, JSON.stringify(userPlates, null, 2));
}


export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("listplate")
        .setDescription("View your favourited list of plates."),

    // Handle the slash command: /addplate plate_number
    run: async ({ client, interaction }) => {
        try {

        } catch (error) {
            console.error("Error adding plate:", error);
            await interaction.reply({
                content: "There was an error adding the license plate to your favorites.",
                ephemeral: true,
            });
        }
    },

    // Handle the prefix command: ]addplate plate_number(s)
    prefixRun: async (client, message, args) => {
        try {


        } catch (error) {
            console.error("Error adding plate(s):", error);
            message.reply("There was an error adding the license plate(s) to your favorites.");
        }
    },
};
