require('dotenv').config();

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'ESTO ES UN SMS ENVIADO DESDE TWILIO!',
        from: process.env.TWILIO_PHONE,
        to: '+584244607461'
    })
    .then(message => console.log(message.sid));
