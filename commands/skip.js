const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the song currently being played"),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        const currentSong = queue.current;

        queue.skip()
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                .setDescription(`I shall skip ${currentSong.title} and play the next song nyaa~`)
                .setThumbnail(currentSong.thumbnail)

            ]
        })
    },
};