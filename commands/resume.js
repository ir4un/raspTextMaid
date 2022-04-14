const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resumes the song currently being played"),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        queue.setPaused(false)
        await interaction.editReply("I shall continue from where I have left off last time")
    },
};