require('dotenv').config();

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

function sendSms(content, phone) {
    client.messages
        .create({
            body: `TURING WALLET: ${content}`,
            from: process.env.TWILIO_PHONE,
            to: phone
        })
        .then(message => console.log(message.sid));
}

module.exports = { sendSms };
