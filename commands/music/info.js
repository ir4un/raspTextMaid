import { SlashCommandBuilder } from "@discordjs/builders";
import djs from 'discord.js';
const { EmbedBuilder } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Displays info about the song currently being played"),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);

        if (!queue || !queue.currentTrack)
            return await interaction.editReply("There are currently no songs playing!");

        const song = queue.currentTrack;

        // Manually get the current timestamp in milliseconds
        const currentTime = queue.node.streamTime;
        const totalDuration = song.durationMS; // Song duration in milliseconds

        // If either value is invalid, set default values
        if (isNaN(currentTime)) {
            currentTime = 0;
        }

        // Create a progress bar
        const progressBar = createProgressBar(currentTime, totalDuration, 19); // A 19-length bar

        const embed = new EmbedBuilder()
            .setThumbnail(song.thumbnail)
            .setDescription(`🎵 Now Playing: [${song.title}](${song.url})\n\n` +
                `${progressBar} \n\n` +
                `\`${formatTime(currentTime)} / ${formatTime(totalDuration)}\``);

        await interaction.editReply({
            embeds: [embed],
        });
    },
};

// Helper function to format the time
function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Helper function to create a custom progress bar
function createProgressBar(current, total, length) {
    const progress = Math.floor((current / total) * length);
    const bar = "▬".repeat(progress) + "🔘" + "▬".repeat(length - progress);
    return bar;
}
