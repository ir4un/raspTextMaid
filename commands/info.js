const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Displays info about the song currently being played"),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        let bar = queue.createProgressBar({
            queue: false,
            length: 19,
        })

        const song = queue.current;

        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                .setThumbnail(song.thumbnail)
                .setDescription(`Currently playing [${song.title}](${song.url})\n\n` + bar)
            ]
        })
    },
};