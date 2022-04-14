const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the song currently being played"),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        queue.setPaused(true)
        await interaction.editReply("Thank you for giving me a break master nyaa~. Let me know when you want to continue listening with '/resume' ")
    },
};