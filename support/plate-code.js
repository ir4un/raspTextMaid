import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { EmbedBuilder } from "discord.js";

// Define __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mainDirPath = path.join(__dirname, "../"); // Adjust this to go two levels up to reach the main project folder
const licenseData = path.join(mainDirPath, 'resources/licenseData.json');// Path to save the licenseData file
const trackingDataPath = path.join(__dirname, '../resources/trackingData.json');// Path to save the trackingData file
const reminderFilePath = path.join(__dirname, '../resources/userPlates.json'); // Path to userPlates.json


// Function to sanitize and clean input
const cleanText = (text) => {
    return text.replace(/<[^>]*>/g, '').trim(); // Remove any HTML tags and trim whitespace
};

export async function getData() {
    try {
        // Fetch the HTML content from the URL
        const { data: html } = await axios.get("https://www.jpj.my/JPJ_Latest_Number_Plates.htm");

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);
        const regions = {
            Peninsular: [],
            Sarawak: [],
            Sabah: []
        };

        // Target each item1, item2, item3 class container
        $('.grid-container .item1, .grid-container .item2, .grid-container .item3').each((index, element) => {
            // Extract the text and split by line breaks
            const lines = $(element).find('p').html().split('<br>').map(item => item.trim()).filter(item => item !== '');

            let currentRegion = $(element).hasClass('item1') ? 'Peninsular' :
                $(element).hasClass('item2') ? 'Sarawak' :
                    'Sabah'; // Default to 'Sabah' for item3

            // Extract state and plate information
            lines.forEach(line => {
                const match = line.match(/^(.*?)-\s*(.*)$/); // Match the state and plate
                if (match) {
                    const state = cleanText(match[1]); // Clean the state text
                    const plate = cleanText(match[2]); // Clean the plate text
                    regions[currentRegion].push({ state, plate });
                }
            });
        });

        // Sort data within each region by state name
        for (const region in regions) {
            regions[region].sort((a, b) => a.state.localeCompare(b.state));
        }

        // Write data to JSON file

        fs.writeFileSync(licenseData, JSON.stringify(regions, null, 2)); // Save newData as the initial data


        return regions;

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
}

// Function to fetch the date details
export async function getDate() {
    try {
        const { data: html } = await axios.get("https://www.jpj.my/JPJ_Latest_Number_Plates.htm");
        const $ = cheerio.load(html);

        const dateText = $("p:contains('as on')").text().match(/as on (.+):/);
        return dateText ? dateText[1].trim() : "Date not available";
    } catch (error) {
        console.error("Error fetching date:", error);
        return "Date not available";
    }
}

export const trackLicensePlates = async () => {
    try {
        const newData = await getData(); // Fetch new data

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

export const plateReminder = async (client) => {
    try {
        // Check if the reminder data file exists
        if (!fs.existsSync(reminderFilePath)) {
            return;
        }


        // Load userPlates.json
        const userPlates = JSON.parse(fs.readFileSync(reminderFilePath, "utf8"));
        // Load tracking data
        const trackingData = JSON.parse(fs.readFileSync(trackingDataPath, "utf8"));

        const targetDifferences = [500, 250, 100, 50, 20, 10, 5, 1];

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("License Plate Updates")
            .setDescription("Here are the differences between your favorited plates and the latest plates:");


        let hasDifferences = false;

        // Iterate through each user
        for (const [userId, userData] of Object.entries(userPlates)) {

            // Check if togglestatus is true
            if (!userData.togglestatus) {
                continue; // Skip to the next user if togglestatus is false
            }

            embed.addFields({
                name: `------------------------------------------------------------------------------`,
                value: `<@${userId}>`,
                inline: false,
            });
            var count = 0;

            // Iterate through each plate in the user's plates object
            for (const [plate, notifiedDifferences] of Object.entries(userData.plates)) {
                // Get the latest plate number for the given plate
                const latestPlate = await findLatestPlateNumber(plate);

                if (!latestPlate) {
                    console.log(`No latest plate found for ${plate}`);
                    continue;
                }

                // Calculate the letter difference
                const difference = calculatePlateDifference(plate, latestPlate);

                // Find all target differences that are surpassed or equal to the current difference
                const surpassedDifferences = targetDifferences.filter(
                    (target) => difference >= target && !notifiedDifferences.includes(target)
                );

                if (surpassedDifferences.length > 0) {
                    count += 1;
                    // Add the difference to the embed
                    embed.addFields({
                        name: ` `,
                        value: `${count}. ${latestPlate} ➡️ ${plate} **${difference} letters away**`,
                        inline: false,
                    });

                    // Mark all surpassed differences as notified
                    notifiedDifferences.push(...surpassedDifferences);
                    hasDifferences = true;
                }
            }


        }

        // Send the embed to the appropriate channel if there are differences
        if (hasDifferences) {
            for (const [key, value] of Object.entries(trackingData.channelTracking)) {
                if (value.toggle) {
                    const channelId = key.split('_')[1];
                    try {
                        const channel = await client.channels.fetch(channelId);
                        if (channel) {
                            // Send the embed only once after processing all users
                            await channel.send({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.error(`Failed to send embed to channel ${channelId}:`, error);
                    }
                }
            }
        }
        // Save the updated userPlates.json with the notified differences
        fs.writeFileSync(reminderFilePath, JSON.stringify(userPlates, null, 2));
        console.log("Updated userPlates.json with notified differences.");
    } catch (error) {
        console.error("Error in plateReminder function:", error);
    }
};

// Helper function to calculate the difference between two plates (letters only)
const calculatePlateDifference = (currentPlate, latestPlate) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Extract letters from the plates
    const currentLetters = currentPlate.slice(0, 3); // First 3 characters
    const latestLetters = latestPlate.slice(0, 3);

    let letterDifference = 0;

    // Compare each letter position
    for (let i = 0; i < 3; i++) {
        const currentIndex = alphabet.indexOf(currentLetters[i]);
        const latestIndex = alphabet.indexOf(latestLetters[i]);

        if (currentIndex !== -1 && latestIndex !== -1) {
            letterDifference += Math.abs(latestIndex - currentIndex);
        }
    }

    // Return only the letter difference
    return letterDifference;
};

export async function findLatestPlateNumber(plate) {
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
