// async function dadDetectorFunc(senderID, message) {

//     i
//     if (!senderID.includes("839758708313030658") && message.content.toLowerCase().includes("i'm")) {


//     } else if (!senderID.includes("839758708313030658") && message.content.toLowerCase().includes("i am")) {


//     }

//     console.log("User said Hi I am");

//     // const dadName = message.content.substring(message.content.toLowerCase().indexOf(`i'm`) + 4)
//     var dadName = message.content.substring(message.content.toLowerCase().indexOf(`i'm`) + 4)
//     dadName = dadName.slice(`i'm`).trim().split(/ +/g);

//     // console.log("🚀 ~ file: dadDetector.js", message.content.substring(message.content.toLowerCase().indexOf(`i'm`) + 4))
//     var cumMessage = `Hi `;

//     // switch (cumCounter) {
//     //     case 1:
//     //         cumMessage = `Master <@${message.author.id}> has said cum ${cumCounter} for the first time! Hooray!!! \n Type ]cum for more details!`
//     //         break;
//     //     case 2:
//     //         cumMessage = `Master <@${message.author.id}> has said cum ${cumCounter} for the second time! Hopefully this doesn't get worst. \n Type ]cum for more details!`
//     //         break;
//     //     default:
//     //         cumMessage = `Cum detected! Master <@${message.author.id}> has said cum ${cumCounter} amount of times! My goodness! \n Type ]cum for more details!`
//     //         break;
//     // }

//     message.reply(cumMessage);


// }

module.exports = { dadDetectorFunc };

async function dadDetectorFunc(senderID, message) {
    if (senderID.includes("839758708313030658")) return
    var typeOfIAm;

    if (message.content.toLowerCase().includes("i'm")) {
        console.log("User said Hi I am");

        typeOfIAm = "i'm";
        var dadName = message.content.substring(message.content.toLowerCase().indexOf(typeOfIAm) + 0)
        console.log("🚀 ~ file: dadDetector.js ~ line 53 ~ dadDetectorFunc ~ dadName", dadName)
        message.reply(`Hi ${dadName}, I'm dad!`);
    } else if (message.content.toLowerCase().includes("i am")) {
        console.log("User said Hi I am");
        typeOfIAm = "i am";
        var dadName = message.content.substring(message.content.toLowerCase().indexOf(typeOfIAm) + 0)
        console.log("🚀 ~ file: dadDetector.js ~ line 53 ~ dadDetectorFunc ~ dadName", dadName)
        message.reply(`Hi ${dadName}, I'm dad!`);
    } else {
        typeOfIAm = "Nothing";
    }


}

module.exports = { dadDetectorFunc };

