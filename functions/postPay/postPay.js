
const { output } = require('../../utils/utils');
let { paySchema } = require('../../validation/pay');
const { client } = require('../../utils/conect-mongodb');
const jwt = require("jsonwebtoken");

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { verifyJwt } = require('../../utils/jwt');

async function getBalance(email, money) {
    await client.connect();
    const collectionMovements = client.db().collection('movements');
    const movements = await collectionMovements.find({ 'user': email, 'money': money }).sort({ 'date': -1 }).toArray();

    if(movements.length > 0)
        return parseFloat(movements[0].balance);
    return 0;
}

const fnHandler = async (event) => {
    try {
        let { httpMethod: method } = event;
        const { error: jwtError, user } = await verifyJwt(
            event.multiValueHeaders.Authorization
        );

        if (jwtError) {
            return output({ error: jwtError }, 500);
        }

        let data = event.body;
        let { amount, type, destination, money} = data;
        amount = Number.parseFloat(amount);

        if (method === 'OPTIONS') {
            return output("success", 200)
        }

        if(method == 'POST') {
            try {
                await paySchema.validate(data)

                // Find destination
                let field = {};
                field[`${type}`] = destination;
                await client.connect();
                const collectionUsers = client.db().collection('users');
                let users = await collectionUsers.find(field).toArray();
                let userDestination = (users.length > 0) ? users[0] : null;

                // Find origin
                let userOrigin = user;
                let balanceOrigin = await getBalance(userOrigin.email, money);

                if(balanceOrigin >= amount)
                {
                    const collectionMovements = client.db().collection('movements');

                    // Credit to Destination
                    await collectionMovements.insertOne({
                        user: userDestination.email,
                        type: 'credit',
                        from_to: userOrigin.email, // credit to userOrigin.email
                        amount: Number.parseFloat(amount),
                        balance: await getBalance(userDestination.email, money) + Number.parseFloat(amount),
                        money: money,
                        date: Date.now()
                    });

                    // Debit to Origin
                    await collectionMovements.insertOne({
                        user: userOrigin.email,
                        type: 'debit',
                        from_to: userDestination.email, // debit to userDestination.email
                        amount: Number.parseFloat(amount),
                        balance: await getBalance(userOrigin.email, money) - Number.parseFloat(amount),
                        money: money,
                        date: Date.now()
                    });
                    return output( {msg: `Pago por ${amount}${money} a ${userDestination.email} fue exitoso`}, 200)
                }
                else
                {
                    return output({
                        msg: 'Disculpe, ud no posee balance suficiente en la cuenta.',
                        description: `El balance actual es ${balanceOrigin}`
                    }, 400)
                }
            } catch (error) {
                return output({ error: error.toString(), path: error.path, description: error.errors}, 400);
            }
        }
    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

exports.handler = middy(fnHandler).use(httpHeaderNormalizer()).use(jsonBodyParser());
