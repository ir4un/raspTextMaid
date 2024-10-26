import { SlashCommandBuilder } from "@discordjs/builders";

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resumes the song currently being played"),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        queue.node.resume();
        await interaction.editReply("I shall continue from where I have left off last time")
    },
};