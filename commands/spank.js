const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("spank")
        .setDescription("Choose a target for Text Maid Lexica to spank")
        .addUserOption((option) => option.setName("spanktarget").setDescription("Mention the target").setRequired(true)),

    run: async({ client, interaction }) => {
        // const user = client.users.cache.get(interaction.member.user.id);
        let spankTarget = interaction.options.getUser("spanktarget");

        const { retrieveResponse, retrieveGif } = require('./extra-files/responses');

        await interaction.editReply(retrieveResponse(spankTarget))
        await interaction.channel.send(retrieveGif());
    }

};

// const fetch = require('node-fetch');

// message.content = '}spank anime spank';
// const spliter = message.content.split(' ');

// if(spliter[0] == '}spank') {
//	let keyword = 'anime+spank';
//	keyword = spliter.slice(1, spliter.length).join('-');
//	const url = `https://g.tenor.com/v1/search?q=${keyword}&key=${process.env.TENORKEY}&limit=10&contentfilter=off&media_filter=minimal`;
//	const response = await fetch(url);
//	const json = await response.json();
//	const index = Math.floor(Math.random() * json.results.length);
//	message.channel.send(json.results[index].url);
//	message.channel.send(index + url);
//	message.channel.send(keyword);
// message.channel.send(message.content);
// }