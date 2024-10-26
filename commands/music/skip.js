import djs from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
const { EmbedBuilder } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the song currently being played"),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!");

        // Get the song being skipped
        const preskipsong = queue.currentTrack;

        // Skip to the next track
        queue.node.skip();

        // Polling to check for currentTrack change
        const checkInterval = setInterval(async () => {
            const currentSong = queue.currentTrack;

            // If currentSong has changed, send the reply
            if (currentSong && currentSong.id !== preskipsong.id) {
                clearInterval(checkInterval); // Stop the polling

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`❌ Skipping [${preskipsong.title}](${preskipsong.url})\n⏭️ Playing **[${currentSong.title}](${currentSong.url})**`)
                            .setThumbnail(currentSong.thumbnail)
                            .setFooter({ text: `Duration: ${currentSong.duration}` })
                    ]
                });
            }
        }, 100); // Check every 100 milliseconds
    },
};
