const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Returns ping value retrieved by the bot"),

    run: async({ client, interaction }) => {

        const user = client.users.cache.get(interaction.member.user.id);
        let pingEmbed = new MessageEmbed()

        await interaction.editReply({
            content: `I have retrieved your requested ping value, master ${user}.`,
            embeds: [
                pingEmbed
                .setColor('#d10e00')
                .setThumbnail('https://media.giphy.com/media/VBc6l3CqQonqo/giphy.gif')
                .setDescription(`${client.ws.ping}ms`)
            ],
        })
    },
};