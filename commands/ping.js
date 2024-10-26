import djs from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
const { EmbedBuilder, Message } = djs;

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Returns ping value retrieved by the bot"),

    run: async ({ client, interaction }) => {

        const user = client.users.cache.get(interaction.member.user.id);
        let pingEmbed = new EmbedBuilder()

        await interaction.editReply({
            content: `I have retrieved your requested ping value, master ${user}.`,
            embeds: [
                pingEmbed
                    .setColor('#d10e00')
                    .setImage('https://media.giphy.com/media/VBc6l3CqQonqo/giphy.gif')
                    .setDescription(`${client.ws.ping}ms`)
            ],
        })
    },
};