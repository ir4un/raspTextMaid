import djs from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
const { EmbedBuilder } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove a song in the current queue")
        .addNumberOption((option) =>
            option.setName("tracknumber").setDescription("The song to remove").setMinValue(1).setRequired(true)),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);

        if (!queue || !queue.isPlaying()) {
            return await interaction.editReply("There are currently no songs in the queue, master nyaa~");
        }

        const trackNum = interaction.options.getNumber("tracknumber");

        // Check if the track number is valid
        if (trackNum > queue.tracks.size || trackNum < 1) {
            return await interaction.editReply(`There is no song with that number in the queue, master! The queue has ${queue.tracks.size} songs.`);
        }

        // Get the song that will be removed (before actually removing it)
        const trackToRemove = await queue.tracks.data[trackNum - 1]; // Access the song in queue.tracks.data

        // Now remove the song
        queue.node.remove(trackNum - 1);

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Removed **[${trackToRemove.title}](${trackToRemove.url})** from the queue.`)
                    .setThumbnail(trackToRemove.thumbnail)
                    .setFooter({ text: `Duration: ${trackToRemove.duration}` })
            ]
        });
    },
};