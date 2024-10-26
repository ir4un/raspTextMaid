
import { SlashCommandBuilder } from "@discordjs/builders";
import djs from 'discord.js';
const { MessageEmbed, Message } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get a list of available commands for Text Maid Lexica"),

    run: async ({ client, interaction }) => {
        const user = client.users.cache.get(interaction.member.user.id);
        const commandsList = [
            'Misc\n',
            '/help - To request for a list of commands for me :3\n',
            '/hello - Say hello to me and i will say hi back :p \n',
            '/nice - I support you on what you nice on previously \n',
            '/check cuti - To see if tomorrow is holiday or nah \n',
            '/spank <@mention> - To spank someone with horny intent \n',
        ];
        let Embed = new MessageEmbed().setDescription(
            commandsList.join(' ')
        );
        interaction.editReply('I have personally sent you a list of commands you may use on me to satisfy your desires');
        await user.send({
            content: 'Good Day Master! Here are the commands you may use on me: \n',
            embeds: [Embed],
        });

    },
};