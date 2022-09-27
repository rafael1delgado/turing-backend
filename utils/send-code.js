const { client } = require("./conect-mongodb");
const { randomNumber } = require("./randomNumber");
const { sendSms } = require("./twilio");

async function sendCode(email, phone) {

    try {
        await client.connect();
        const collectionUsers = client.db().collection("users");

        const code = randomNumber(0, 999999);

        await collectionUsers.updateOne(
            { email: email },
            { $set: { "twoFactor" : { "code": code, "exp": Math.floor(Date.now() / 1000) + 120 }  } }
        );

        sendSms(`El código de 2FA es ${code}. Este codigo caduca en 2 minutos.`, phone);
    } catch (error) {
        console.log(error);
    } finally {
        client.close();
    }
}

module.exports = { sendCode };
