const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");
const { QueryType } = require("discord-player");



module.exports.prefixRun = async (client, message, args) => {

    var textID;
    if (args.length > 1) return message.channel.send("Sorry master! You can only provide one word to react!")
    try {
        textID = message.reference.messageId; // Retrieve message ID of target message
    } catch (error) {
        message.channel.send("Master!!! You forgot to reply to message so I can react to it. Hmmph...")
        return
    }
    if (message.reference.messageId === null) return
    // message.channel.send("IT works!")

    const textInput = args[0]; // Retrieve provided input message
    const channelID = message.channel.id; // Retrieve channel ID where command is executed

    const textArray = Array.from(textInput); // Splits the String input into seperate array objects
    const emojiArray = [];
    var i = 0;
    while (i < textArray.length) { // Pushes into Emoji array which will be reacted by the bot based on the String
        switch (textArray[i]) {
            case "a":
                emojiArray.push("🇦")
                break;
            case "b":
                emojiArray.push("🇧")
                break;
            case "c":
                emojiArray.push("🇨")
                break;
            case "d":
                emojiArray.push("🇩")
                break;
            case "e":
                emojiArray.push("🇪")
                break;
            case "f":
                emojiArray.push("🇫")
                break;
            case "g":
                emojiArray.push("🇬")
                break;
            case "h":
                emojiArray.push("🇭")
                break;
            case "i":
                emojiArray.push("🇮")
                break;
            case "j":
                emojiArray.push("🇯")
                break;
            case "k":
                emojiArray.push("🇰")
                break;
            case "l":
                emojiArray.push("🇱")
                break;
            case "m":
                emojiArray.push("🇲")
                break;
            case "n":
                emojiArray.push("🇳")
                break;
            case "o":
                emojiArray.push("🇴")
                break;
            case "p":
                emojiArray.push("🇵")
                break;
            case "q":
                emojiArray.push("🇶")
                break;
            case "r":
                emojiArray.push("🇷")
                break;
            case "s":
                emojiArray.push("🇸")
                break;
            case "t":
                emojiArray.push("🇹")
                break;
            case "u":
                emojiArray.push("🇺")
                break;
            case "v":
                emojiArray.push("🇻")
                break;
            case "w":
                emojiArray.push("🇼")
                break;
            case "x":
                emojiArray.push("🇽")
                break;
            case "y":
                emojiArray.push("🇾")
                break;
            case "z":
                emojiArray.push("🇿")
                break;
            default:
                break;
        }
        i++;
    }

    await client.channels.fetch(channelID).then(async channel => {
        channel.messages.fetch(textID).then(async message => {
            var i = 0;
            while (i < emojiArray.length) { // Reacts the emoji declared from switch case
                message.react(emojiArray[i]);
                i++;
            }
        })
    })
}