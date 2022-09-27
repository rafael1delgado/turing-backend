const { output } = require('../../utils/utils');
const { client } = require('../../utils/conect-mongodb');

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { verifyJwt } = require('../../utils/jwt');

const fnHandler = async (event) => {
    try {
        let { httpMethod: method } = event;

        if (method === 'OPTIONS') {
            return output("success", 200)
        }

        if(method == 'GET') {
            try {
                const { error: jwtError, user } = await verifyJwt(
                    event.multiValueHeaders.Authorization
                );

                if (jwtError) {
                    return output({ error: jwtError }, 500);
                }

                await client.connect();
                const collectionUsers = client.db().collection('users');
                const users = await collectionUsers.find({ 'email': user.email }).toArray();
                let movements = [];
                if(users.length > 0) {
                    movements = users[0].balance.movements;
                }

                return output({ movements: movements, balance: users[0].balance.assets }, 200);
            } catch (error) {
                return output({ error: error.toString(), path: error.path, description: error.errors}, 400);
            } finally {
                await client.close();
            }
        }
    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

exports.handler = middy(fnHandler)
    .use(httpHeaderNormalizer())
    .use(jsonBodyParser());
