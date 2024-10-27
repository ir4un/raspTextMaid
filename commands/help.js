
import { SlashCommandBuilder } from "@discordjs/builders";
import djs from 'discord.js';
const { EmbedBuilder } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get a list of available commands for BangBoobs"),

    run: async ({ client, interaction }) => {
        const user = client.users.cache.get(interaction.member.user.id);
        const commandsList = [
            'Misc\n',
            'WIP'
        ];
        let Embed = new EmbedBuilder().setDescription(
            commandsList.join(' ')
        );
        interaction.editReply('I have personally sent you a list of commands you may use on me to satisfy your desires');
        await user.send({
            content: 'Good Day Master! Here are the commands you may use on me: \n',
            embeds: [Embed],
        });

    },
};