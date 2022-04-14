const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quit")
        .setDescription("Stops the bot and clears the queue"),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        queue.destroy()
        await interaction.editReply("Thank you master! I hope you are satisfied with my services nyaa~")
    },
};