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
        .setName("deleteplate")
        .setDescription("Delete a plate from your favourited list.")
        .addStringOption(option =>
            option
                .setName("plate")
                .setDescription("Please enter the license plate number you want to delete.")
                .setRequired(true)
        ),

    // Handle the slash command: /addplate plate_number
    run: async ({ client, interaction }) => {
        try {
            const userId = interaction.user.id; // Get the user's Discord ID
            var plate = interaction.options.getString("plate").toUpperCase();
            plate = plate.replace(/\s+/g, ""); // Remove all spaces from the plate

            const validationResult = await validatePlate(plate); // Store the returned object
            const isValid = validationResult.isValid;

            if (!isValid) {
                const message = validationResult.message;
                await interaction.editReply({
                    content: message,
                    ephemeral: true,
                });
                return;
            }

            // Check if the user has an entry; if not, create one
            if (!userPlates[userId]) {
                userPlates[userId] = {
                    togglestatus: true, // Default value for togglestatus
                    plates: {}          // Initialize an empty plates array
                };
            }

            // Add the plate if it's not already in the user's list
            if (!userPlates[userId].plates[plate]) {
                userPlates[userId].plates[plate] = [];
                saveData(); // Save the updated list to the JSON file
                await interaction.editReply({
                    content: `✅ License plate **${plate}** has been added to your favorites!`,
                    ephemeral: true,
                });
            } else {
                await interaction.editReply({
                    content: `⚠️ License plate **${plate}** is already in your favorites.`,
                    ephemeral: true,
                });
            }



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

            // Check if input is empty
            if (args.length === 0) {
                return message.reply("Please provide at least one license plate number.");
            }

            const userId = message.author.id; // Get the user's Discord ID
            const inputPlates = args.map(plate => plate.toUpperCase().replace(/\s+/g, ""));
            console.log('inputPlates', inputPlates);


            // Check if the user has an entry; if not, create one
            if (!userPlates[userId]) {
                userPlates[userId] = {
                    togglestatus: true,
                    plates: {}
                };
            }

            let validPlates = [];
            let invalidPlates = [];

            // Validate each plate
            for (const plate of inputPlates) {
                const validationResult = await validatePlate(plate);
                if (validationResult.isValid) {
                    // Add valid plates to the user's list (avoid duplicates)
                    if (!userPlates[userId].plates[plate]) {
                        userPlates[userId].plates[plate] = []; // Initialize an empty array for notified differences
                        validPlates.push(plate);
                    } else {
                        invalidPlates.push(`${plate} ⚠️ Already in your favorites.`);
                    }
                } else {
                    invalidPlates.push(`${plate} ❌ ${validationResult.message}`);
                }
            }

            saveData(); // Save the updated list to the JSON file

            // Prepare the reply message
            let replyMessage = "";
            if (validPlates.length > 0) {
                replyMessage += `✅ Successfully added the following plates to your favorites: ${validPlates.join(", ")}.\n`;
            }
            if (invalidPlates.length > 0) {
                replyMessage += `\nThe following plates could not be added:\n${invalidPlates.join("\n")}`;
            }

            // Send the reply
            message.reply(replyMessage);
        } catch (error) {
            console.error("Error adding plate(s):", error);
            message.reply("There was an error adding the license plate(s) to your favorites.");
        }
    },
};
