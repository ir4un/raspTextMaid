import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const trackingFilePath = path.join(__dirname, '../../resources/userPlates.json');

// Function to load tracking data
const loadTrackingData = () => {
    if (fs.existsSync(trackingFilePath)) {
        const data = fs.readFileSync(trackingFilePath);
        return JSON.parse(data);
    }
    return { channelTracking: {} };
};

// Function to save tracking data
const saveTrackingData = (data) => {
    fs.writeFileSync(trackingFilePath, JSON.stringify(data, null, 2));
};

// remindplate Command
export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("remindplate")
        .setDescription("Toggle the reminder for your favourited license plate."),

    run: async ({ client, interaction }) => {
        const trackingData = loadTrackingData();
        const userId = interaction.user.id;

        try {

            if (!trackingData[userId]) {
                trackingData[userId] = {
                    togglestatus: false, // Default value
                    plates: {}           // Ensure plates array exists
                };
            }

            // Check if user has any favourited plates yet, if not, send a message and return
            if (trackingData[userId].togglestatus) {
                // Disable tracking
                trackingData[userId].togglestatus = false;
                saveTrackingData(trackingData);

                await interaction.editReply({ content: "Reminder has been disabled for your favourited license plate. I won't be able to remind you if a plate you like is approaching :^(", ephemeral: true });
            } else {
                // Enable tracking for this channel
                trackingData[userId].togglestatus = true;
                saveTrackingData(trackingData);

                await interaction.editReply({ content: "Reminder has been enabled for your favourited license plate. I'll let you know when its coming, soon hehe", ephemeral: true });
            }
        } catch (error) {
            console.error("Error executing command:", error);
            await interaction.editReply({
                content: "An error occurred while executing the command.",
                ephemeral: true,
            });
        }
    },
};
