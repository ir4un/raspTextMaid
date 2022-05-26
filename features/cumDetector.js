const firebaseIndex = require("../firebase/firebase-index")

async function cumDetectorFunc(senderID, message) {

    if (!senderID.includes("839758708313030658") && !message.content.toLowerCase().startsWith("]cum") && message.content.toLowerCase().includes("cum")) {
        var cumCounter = await firebaseIndex.fbCumUpdate(senderID);
        console.log("User said cum!");

        var cumMessage = "";

        switch (cumCounter) {
            case 1:
                cumMessage = `Master <@${message.author.id}> has said cum ${cumCounter} for the first time! Hooray!!! \n Type ]cum for more details!`
                break;
            case 2:
                cumMessage = `Master <@${message.author.id}> has said cum ${cumCounter} for the second time! Hopefully this doesn't get worst. \n Type ]cum for more details!`
                break;
            default:
                cumMessage = `Cum detected! Master <@${message.author.id}> has said cum ${cumCounter} amount of times! My goodness! \n Type ]cum for more details!`
                break;
        }

        message.reply(cumMessage);


    }

}

module.exports = { cumDetectorFunc };

