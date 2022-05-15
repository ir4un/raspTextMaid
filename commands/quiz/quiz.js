const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const http = require('https');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("quiz")
        .setDescription("Retrieve a quiz!"),

    run: async ({ client, interaction }) => {

        const aButton = new MessageButton().setCustomId('a-button').setLabel('a.').setStyle('PRIMARY');
        const bButton = new MessageButton().setCustomId('b-button').setLabel('b.').setStyle('PRIMARY');
        const cButton = new MessageButton().setCustomId('c-button').setLabel('c.').setStyle('PRIMARY');
        const dButton = new MessageButton().setCustomId('d-button').setLabel('d.').setStyle('PRIMARY');

        const row = new MessageActionRow()
            .addComponents(aButton)
            .addComponents(bButton)
            .addComponents(cButton)
            .addComponents(dButton)
            ;

        const embed = new MessageEmbed()
        const embed2 = new MessageEmbed()
        var url = "https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple";
        var quizObject = '';
        var botMessage = ';'
        http.get(url, async res => {
            let data = '';
            res.on('data', async chunk => {
                data += chunk;
            });
            res.on('end', async () => {
                data = JSON.parse(data);
                quizObject = Object.values(data.results);

                var i = 0;

                // while (i <= quizObject.length) {

                const answerOptions = [
                    quizObject[i].correct_answer,
                    quizObject[i].incorrect_answers[0],
                    quizObject[i].incorrect_answers[1],
                    quizObject[i].incorrect_answers[2]
                ];

                const randomizedAnswer = answerOptions
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)

                function convert(string) {
                    return string.replace(/&#(?:x([\da-f]+)|(\d+));/ig, function (_, hex, dec) {
                        return String.fromCharCode(dec || +('0x' + hex))
                    })
                }

                // console.log(answerOptions)
                // console.log(randomizedAnswer)

                embed.setColor('#0099ff')
                    .setTitle(convert(quizObject[i].question))
                    .setDescription(convert(`
                        **[a.]** ${randomizedAnswer[0]}\n
                        **[b.]** ${randomizedAnswer[1]}\n
                        **[c.]** ${randomizedAnswer[2]}\n
                        **[d.]** ${randomizedAnswer[3]}
                        `));
                await interaction.editReply({ content: `Question ${quizObject.length}`, ephemeral: true, embeds: [embed], components: [row] });

                await client.on("interactionCreate", async (interaction2) => {
                    const aDisButton = new MessageButton().setCustomId('a-button').setLabel('a.').setStyle('PRIMARY');
                    const bDisButton = new MessageButton().setCustomId('b-button').setLabel('b.').setStyle('PRIMARY');
                    const cDisButton = new MessageButton().setCustomId('c-button').setLabel('c.').setStyle('PRIMARY');
                    const dDisButton = new MessageButton().setCustomId('d-button').setLabel('d.').setStyle('PRIMARY');

                    const disabledRow = new MessageActionRow()
                        .addComponents(aDisButton.setDisabled(true))
                        .addComponents(bDisButton.setDisabled(true))
                        .addComponents(cDisButton.setDisabled(true))
                        .addComponents(dDisButton.setDisabled(true))
                        ;

                    console.log("Hello")
                    console.log(interaction2.customId);

                    if (interaction2.isButton()) {
                        console.log(answerOptions[0]);
                        switch (interaction2.customId) {
                            case "a-button":
                                embed2.setColor('#0099ff')
                                    .setTitle(convert(quizObject[i].question))
                                    .setDescription(convert(`
                                    ✅ **[a.]** ${randomizedAnswer[0]}\n 
                                    ❌ **[b.]** ${randomizedAnswer[1]}\n
                                    ❌ **[c.]** ${randomizedAnswer[2]}\n
                                    ❌ **[d.]** ${randomizedAnswer[3]}
                                    `));
                                if (randomizedAnswer[0] === answerOptions[0]) {
                                    await interaction.channel.send({ content: `Congratulations! You got it right!`, ephemeral: true, embeds: [embed2], components: [disabledRow] });
                                } else {
                                    await interaction.channel.send({ content: `Oops, wrong answer! Try again next time`, ephemeral: true, embeds: [embed2], components: [disabledRow] }); await interaction.deleteReply()
                                }
                                break;
                            case "b-button":
                                embed2.setColor('#0099ff')
                                    .setTitle(convert(quizObject[i].question))
                                    .setDescription(convert(`
                                        ❌ **[a.]** ${randomizedAnswer[0]}\n 
                                        ✅ **[b.]** ${randomizedAnswer[1]}\n
                                        ❌ **[c.]** ${randomizedAnswer[2]}\n
                                        ❌ **[d.]** ${randomizedAnswer[3]}
                                        `));
                                if (randomizedAnswer[1] === answerOptions[0]) {
                                    await interaction.channel.send({ content: `Congratulations! You got it right!`, ephemeral: true, embeds: [embed2], components: [disabledRow] }); await interaction.deleteReply()
                                } else {
                                    await interaction.channel.send({ content: `Oops, wrong answer! Try again next time`, ephemeral: true, embeds: [embed2], components: [disabledRow] }); await interaction.deleteReply()
                                }
                                break;
                            case "c-button":
                                embed2.setColor('#0099ff')
                                    .setTitle(convert(quizObject[i].question))
                                    .setDescription(convert(`
                                        ❌ **[a.]** ${randomizedAnswer[0]}\n 
                                        ❌ **[b.]** ${randomizedAnswer[1]}\n
                                        ✅ **[c.]** ${randomizedAnswer[2]}\n
                                        ❌ **[d.]** ${randomizedAnswer[3]}
                                        `));
                                if (randomizedAnswer[2] === answerOptions[0]) {
                                    await interaction.channel.send({ content: `Congratulations! You got it right!`, ephemeral: true, embeds: [embed2], components: [disabledRow] }); await interaction.deleteReply()
                                } else {
                                    await interaction.channel.send({ content: `Oops, wrong answer! Try again next time`, ephemeral: true, embeds: [embed2], components: [disabledRow] }); await interaction.deleteReply()
                                }
                                break;
                            case "d-button":
                                embed2.setColor('#0099ff')
                                    .setTitle(convert(quizObject[i].question))
                                    .setDescription(convert(`
                                    ❌ **[a.]** ${randomizedAnswer[0]}\n 
                                    ❌ **[b.]** ${randomizedAnswer[1]}\n
                                    ❌ **[c.]** ${randomizedAnswer[2]}\n
                                    ✅ **[d.]** ${randomizedAnswer[3]}
                                    `));
                                if (randomizedAnswer[3] === answerOptions[0]) {
                                    await interaction.channel.send({ content: `Congratulations! You got it right!`, ephemeral: true, embeds: [embed2], components: [disabledRow] }); await interaction.deleteReply()
                                } else {
                                    await interaction.channel.send({ content: `Oops, wrong answer! Try again next time`, ephemeral: true, embeds: [embed2], components: [disabledRow] }); await interaction.deleteReply()
                                }
                                break;
                            default:
                                break;
                        }
                        // await interaction.deleteReply()

                    }
                })
                // await interaction.channel.send({ content: `Question ${quizObject.length}`, ephemeral: true, embeds: [embed], components: [row] });

            });
        }).on('error', err => {
            console.log(err.message);
        });




    },
};



