const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");
const { QueryType } = require("discord-player");
const firebaseIndex = require("../firebase/firebase-index")
var countdown = require("countdown");


module.exports.prefixRun = async (client, message, args) => {

    var cumData = await firebaseIndex.fbCumRead(message.author.id);

    if (cumData === 0) {
        console.log("First!")
    } else {

        // const getAuthorDisplayName = async (msg) => {
        //     const member = await message.guild.member(message.author);
        //     return member ? member.nickname : msg.author.username;
        // }
        let user = client.users.cache.get(message.author.id);

        // var latestCumDay;
        // var firstCumDay = countdown(new Date(2000, 0, 1)).toString();
        // console.log(countdown(new Date(2000, 0, 1)).toString());

        const cumEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${user.username}'s Cum History`)
            .setThumbnail('https://media.giphy.com/media/WoWm8YzFQJg5i/giphy.gif')
            .addFields(
                { name: 'First Cum Word Usage', value: `${cumData.firstCum}` },
                { name: 'Amount of Cum Word Used', value: `${cumData.cumCount}` },
                { name: 'Latest Cum Word Usage', value: `${cumData.latestCum}` },
            )
            .setFooter({ text: 'Provided to you by Text Maid Lexica!' });

        //message.channel.send(`<@${message.author.id}> said his very first cum on the ${cumData.firstCum}. \nSince that day, he said the word cum at least ${cumData.cumCount} times. \nThe latest cum he said was on the ${cumData.latestCum}.`)
        message.channel.send({ embeds: [cumEmbed] });

    }


}