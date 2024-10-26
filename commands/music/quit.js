import { SlashCommandBuilder } from "@discordjs/builders";

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("quit")
        .setDescription("Stops the bot and clears the queue"),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);

        if (!queue)
            return await interaction.editReply("There are currently no songs for me to play!")

        queue.node.stop(); // Stops the playback
        queue.tracks.clear(); // Clears the queue
        queue.connection.disconnect();

        await interaction.editReply("Thank you master! I hope you are satisfied with my services nyaa~")
    },
};