const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skipto")
        .setDescription("Skip to a  certain song number#")
        .addNumberOption((option) =>
            option.setName("tracknumber").setDescription("The song to skip to").setMinValue(1).setRequired(true)),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        const trackNum = interaction.options.getNumber("tracknumber");

        if (trackNum > queue.tracks.length)
            return await interaction.editReply("Invalid track number!")
        queue.SkipTo(trackNum - 1)

        await interaction.editReply(`Skipping to song number #${trackNum}`)
    },
};