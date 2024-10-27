import { SlashCommandBuilder } from "@discordjs/builders";
import { getData, getDate } from "../../support/plate-code.js";
import { EmbedBuilder } from "discord.js"; // Import EmbedBuilder correctly

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("getplate")
        .setDescription("Retrieve license plate information by region."),

    run: async ({ client, interaction }) => {
        try {
            // Fetch the data from getData function
            const regions = await getData();
            const date = await getDate();

            // Create a new embed message
            const embed = new EmbedBuilder()
                .setTitle("License Plate Information")
                .setColor("#0099ff") // Set embed color
                .setDescription(`**Updated since:** ${date}\n\n`);

            // Iterate through each region and add fields to the embed
            for (const [region, plates] of Object.entries(regions)) {
                // Format plates to keep state and plate on the same line
                const platesList = plates
                    .map(item => `${item.plate.trim()} - ${item.state.trim()}`) // Trim whitespace
                    .join('\n'); // Each state and plate on the same line

                // Add a field for each region
                embed.addFields({
                    name: region,
                    value: platesList || "No plates available",
                    inline: false, // Set to false to ensure fields take the full width
                }); // Add region field
            }

            // Send the embed message
            await interaction.followUp({
                embeds: [embed],
            });
        } catch (error) {
            console.error("Error retrieving data:", error);
            await interaction.followUp({
                content: "There was an error retrieving the license plate information.",
                ephemeral: true,
            });
        }
    },

    prefixRun: (client, message, args) => {
        message.channel.send("Testicles");
    },
};
