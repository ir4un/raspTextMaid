import { SlashCommandBuilder } from "@discordjs/builders";

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles the queue"),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId);

        if (!queue || !queue.isPlaying()) {
            return await interaction.editReply("There are currently no songs for me to shuffle!");
        }
        // Toggle shuffle
        const isShuffle = queue.toggleShuffle();

        if (isShuffle) {
            // If shuffle is turned on
            await interaction.editReply(`Ehe, I will now surprise master by shuffling the ${queue.tracks.size} songs I will be playing!`);
        } else {
            // If shuffle is turned off
            await interaction.editReply("Fine master, shuffle is off :(");
        }
    },
};