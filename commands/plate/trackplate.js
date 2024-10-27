import { SlashCommandBuilder } from "@discordjs/builders";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const trackingFilePath = path.join(__dirname, '../../resources/trackingData.json');

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

// Trackplate Command
export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("trackplate")
        .setDescription("Toggle license plate tracking for this channel."),

    run: async ({ client, interaction }) => {
        const trackingData = loadTrackingData();
        const channelId = interaction.channelId;
        const guildId = interaction.guildId;
        const trackingKey = `${guildId}_${channelId}`;

        try {
            // Check if tracking is already enabled for this channel
            if (trackingData.channelTracking[trackingKey]) {
                // Disable tracking
                delete trackingData.channelTracking[trackingKey];
                saveTrackingData(trackingData);

                await interaction.editReply({ content: "Tracking has been disabled for this channel.", ephemeral: true });
            } else {
                // Enable tracking for this channel
                trackingData.channelTracking[trackingKey] = {
                    toggle: true // Set toggle to true when enabling tracking
                };
                saveTrackingData(trackingData);

                await interaction.editReply({ content: "Tracking has been enabled for this channel.", ephemeral: true });
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
