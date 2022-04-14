const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles the queue"),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        queue.shuffle()
        await interaction.editReply(`Ehe, I will now suprise master by shuffling the ${queue.tracks.length} songs I will be playing`)
    },
};