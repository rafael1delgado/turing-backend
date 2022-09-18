const { output } = require('../../utils/utils');
const { client } = require('../../utils/conect-mongodb');

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { verifyJwt } = require('../../utils/jwt');

const fnHandler = async (event) => {
    try {
        let { httpMethod: method } = event;
        const { error: jwtError, user } = await verifyJwt(
            event.multiValueHeaders.Authorization
        );

        if (jwtError) {
            return output({ error: jwtError }, 500);
        }

        const money = event.queryStringParameters.money;

        if (method === 'OPTIONS') {
            return output("success", 200)
        }

        if(method == 'GET') {
            try {
                await client.connect();
                const collectionMovements = client.db().collection('movements');
                const movements = await collectionMovements.find({ 'user': user.email, 'money': money }).sort({ 'date': -1 }).toArray();
                let movement = (movements.length > 0) ? movements[0] : 0;
                return output({ movements: movements, balance_amount: movement.balance, balance_money: movement.money }, 200);
            } catch (error) {
                return output({ error: error.toString(), path: error.path, description: error.errors}, 400);
            }
        }
    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

exports.handler = middy(fnHandler)
    .use(httpHeaderNormalizer())
    .use(jsonBodyParser());
