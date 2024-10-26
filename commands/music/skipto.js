import djs from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
const { EmbedBuilder } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("skipto")
        .setDescription("Skip to a  certain song number#")
        .addNumberOption((option) =>
            option.setName("tracknumber").setDescription("The song to skip to").setMinValue(1).setRequired(true)),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        const trackNum = interaction.options.getNumber("tracknumber");

        if (trackNum > queue.tracks.length)
            return await interaction.editReply("Invalid track number!")
        queue.node.skipTo(trackNum - 1)

        // Get the current song after skipping
        const currentSong = queue.currentTrack;

        // Send an embed with the current song information
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Nyan~ ⏭️ Skipping to song number #${trackNum}**, **[${currentSong.title}](${currentSong.url})**`)
                    .setThumbnail(currentSong.thumbnail)
                    .setFooter({ text: `Duration: ${currentSong.duration}` })
            ]
        });
    },
};