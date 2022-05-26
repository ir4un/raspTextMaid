const fbAdmin = require('firebase-admin');

fbAdmin.initializeApp({
    credential: fbAdmin.credential.cert(require('../fb-admin-cred.json'))
});

const db = fbAdmin.firestore();

async function fbCumUpdate(senderID) {

    try {
        var data = db.collection("text-history").doc("CUM_HISTORY")
        var cumCountReturned;
        const doc = await data.get();
        const retrievedData = doc.data();
        let ts = Date.now();
        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let hour = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        //let mood = (hour >= 12) ? "PM" : " AM";

        if (!doc.exists) {
            console.log('No such document!');
        } else {

            if (retrievedData[senderID]) {
                var cumCounted = retrievedData[senderID]["cumCount"];
                cumCounted++;
                await data.update({
                    [senderID]: {
                        cumCount: cumCounted,
                        firstCum: retrievedData[senderID]["firstCum"],
                        latestCum: `${[date]}/${[month]}/${[year]} ${[hour]}:${[minutes]}`
                    }
                })
                cumCountReturned = cumCounted;

            } else {
                await data.update({
                    [senderID]: {
                        cumCount: 1,
                        firstCum: `${[date]}/${[month]}/${[year]} ${[hour]}:${[minutes]}`,
                        latestCum: `${[date]}/${[month]}/${[year]} ${[hour]}:${[minutes]}`
                    }
                })

                cumCountReturned = 1;
            }

            return cumCountReturned;
        }

    } catch (e) {
        // loadError(req, res, e)
        console.log(e);

    }
}

module.exports = { fbCumUpdate };

