import djs from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
const { EmbedBuilder } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Displays the current song queue")
        .addNumberOption((option) => option.setName("page").setDescription("Page number of the queue").setMinValue(1)),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);
        if (!queue || !queue.isPlaying()) {
            return await interaction.editReply("You haven't told me to play any songs yet, master nyaa~");
        }

        const totalPages = Math.ceil(queue.tracks.size / 10) || 1; // Assuming tracks is a Map or a similar structure
        const page = (interaction.options.getNumber("page") || 1) - 1;

        if (page >= totalPages) {
            return await interaction.editReply(`Invalid page, master! There are currently ${totalPages} pages.`);
        }

        // Create the queue string from queue.tracks.data
        const queueString = queue.tracks.data // Access the data array directly
            .slice(page * 10, page * 10 + 10)
            .map((song, i) => {
                const durationDisplay = song.source === 'local' ? '[Local]' : `\`[${song.duration}]\``;
                return `${page * 10 + i + 1}. ${durationDisplay} ${song.title} -- <@${song.requestedBy.id}>`;

            })
            .join('\n');

        const currentSong = queue.currentTrack;
        const currentDurationDisplay = currentSong.source === 'local' ? '[Local]' : `\`[${currentSong.duration}]\``;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Currently Playing**\n` +
                        (currentSong ? `${currentDurationDisplay} ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : "None") +
                        `\n\n**Queue**\n${queueString || "No songs in the queue."}`
                    )
                    .setFooter({
                        text: `Page: ${page + 1} of ${totalPages}`
                    })
                    .setThumbnail(currentSong ? currentSong.thumbnail : null) // Safely access thumbnail
            ]
        });
    }
};