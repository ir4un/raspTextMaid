import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js"; // Import EmbedBuilder correctly
import fs from "fs"; // File system module for reading and writing the JSON file
import path from "path"; // Import path module to handle file paths
import { fileURLToPath } from 'url'; // Import fileURLToPath to convert URL to path
import { getData } from "../../support/plate-code.js";

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

async function findLatestPlateNumber(plate) {
    try {
        const regions = await getData();
        const firstLetter = plate.charAt(0).toUpperCase();
        const secondLetter = plate.charAt(1).toUpperCase();

        for (const region of Object.values(regions)) {
            for (const state of region) {
                if (state.plate.charAt(0) === firstLetter) {
                    if (firstLetter === 'S' && (state.plate.charAt(1) === secondLetter)) {
                        return state.plate;
                    } else if (firstLetter === 'Q' && (state.plate.charAt(1) === secondLetter)) {
                        return state.plate;
                    } else if (firstLetter !== 'S' && firstLetter !== 'Q') {
                        return state.plate;
                    }
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error finding latest plate number:", error);
        return null;
    }
}

async function validatePlate(inputPlate) {
    try {
        const latestPlate = await findLatestPlateNumber(inputPlate);

        const inputPlateUpper = inputPlate.trim().toUpperCase();
        const latestPlateUpper = latestPlate.trim().toUpperCase();

        const inputLetters = inputPlateUpper.match(/^[A-Z]+/)?.[0] || ""; // Safely extract letters
        const inputNumbers = parseInt(inputPlateUpper.match(/\d+$/)?.[0] || "0", 10);

        const latestLetters = latestPlateUpper.match(/^[A-Z]+/)[0];
        const latestNumbers = parseInt(latestPlateUpper.match(/\d+$/)?.[0] || "0", 10);

        if (!latestPlate) {
            return { isValid: false, message: "❌ The license plate does not belong to any Malaysian state!" }; // No matching state found
        } else if (/[IOZ]/i.test(inputPlate)) {
            // Check for illegal letters
            // Case-insensitive match for I, O, Z
            return { isValid: false, message: "❌ The license plate contains illegal letters (I, O, Z)." };
        } else if (inputLetters.length > 3 || !/[A-Za-z]/.test(inputPlateUpper) || !/\d/.test(inputPlateUpper)) {
            // Check if input plate letters contains at least 3 letters in the first few inputs
            // Also checks if the user puts in only letters or only numbers
            return { isValid: false, message: `❌ The value: ${inputPlateUpper} is not a valid license plate.` };
        } else if (inputLetters < latestLetters) {
            // Check if input plate letters are order or not
            return { isValid: false, message: "❌ The license plate is no longer available" };
        } else if (inputNumbers > 9999) {
            // Check if input plate numbers are valid with 4 digits
            return { isValid: false, message: "❌ The license plate number cannot be longer than 4 digits!" };
        } else if (inputLetters == latestLetters) {
            // When plate letters are the same, check if input plate numbers are valid or not
            if (inputNumbers <= latestNumbers) {
                return { isValid: false, message: "❌ The license plate number is no longer available" };
            }
            return { isValid: true };
        } else {
            // Else catcher
            return { isValid: false, message: `❌ The value: ${inputPlateUpper} is not valid.` };

        }

    } catch (error) {
        console.error("Error validating plate:", error);
        return { isValid: false };
    }
}

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("addplate")
        .setDescription("Add a license plate to your favourites.")
        .addStringOption(option =>
            option
                .setName("plate")
                .setDescription("License plate number (e.g., ABC1234) I, O, Z letters are not allowed!")
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
                userPlates[userId] = [];
            }

            // Add the plate if it's not already in the user's list
            if (!userPlates[userId].includes(plate)) {
                userPlates[userId].push(plate);
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
                userPlates[userId] = [];
            }

            let validPlates = [];
            let invalidPlates = [];

            // Validate each plate
            for (const plate of inputPlates) {
                const validationResult = await validatePlate(plate);
                if (validationResult.isValid) {
                    // Add valid plates to the user's list (avoid duplicates)
                    if (!userPlates[userId].includes(plate)) {
                        userPlates[userId].push(plate);
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
