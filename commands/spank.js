import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { retrieveResponse, retrieveGif } from "../resources/responses.js";

export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName("spank")
        .setDescription("Choose a target for Text Maid Lexica to spank")
        .addUserOption(option =>
            option.setName("spanktarget")
                .setDescription("Mention the target")
                .setRequired(true)
        ),

    run: async ({ client, interaction }) => {
        try {
            // Get the target user to spank from the command options
            const spankTarget = interaction.options.getUser("spanktarget");

            // Retrieve the response message and gif
            const responseMessage = retrieveResponse(spankTarget);
            const gifMessage = retrieveGif();

            // Reply with the spank response
            await interaction.editReply(responseMessage);

            // Send the gif message in the same channel
            await interaction.followUp(gifMessage);

        } catch (error) {
            console.error("Error executing the /spank command:", error);
            await interaction.reply({
                content: "Sorry, something went wrong while executing this command!",
                ephemeral: true
            });
        }
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