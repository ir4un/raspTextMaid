import { SlashCommandBuilder } from "@discordjs/builders";


export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Say hello to the bot!"),

    run: async ({ client, interaction }) => {
        // Make sure this command is not trying to reply again if already deferred
        await interaction.followUp({
            content: 'Hello there! I am your humble text slave, at your service.'
        });
    },

    prefixRun: (client, message, args) => {
        message.channel.send("Testicles");
    },
};
