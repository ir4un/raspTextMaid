const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Say hello to the bot!"),

    run: async ({ client, interaction }) => {

        await interaction.editReply({
            content: 'Hello there! I am you Humble Text Slave, at your service.\r\nI will gladly accept any of your request no matter how lewd it is.',
        })
    },

    prefixRun: ({ client, message, args }) => {
        console.log("Hey!!")
    },
};

module.exports.prefixRun = (client, message, args) => {
    message.channel.send("Testicals")
}