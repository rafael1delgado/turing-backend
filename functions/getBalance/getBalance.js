const { verifyJwt } = require("../../utils/jwt");
const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

const fnHandler = async (event) => {
  try {
    let { httpMethod: method } = event;
        const { error: jwtError, user } = await verifyJwt(
            event.multiValueHeaders.Authorization
        );

        if (jwtError) {
            return output({ error: jwtError }, 500);
        }

        let money = event.queryStringParameters.money;

        if (method === 'OPTIONS') {
            return output("success", 200)
        }

        if(method == 'GET') {
            try {
                if(money) {
                    money = money.toLowerCase();
                    await client.connect();
                    const collectionUsers = client.db().collection('users');
                    let users = await collectionUsers.find({ 'email': user.email }).toArray();
                    let balance = 0;

                    if(users.length > 0 && users[0].balance.assets[money])
                        balance = users[0].balance.assets[money];

                    return output({ balance_amount: balance, balance_money: money }, 200);
                } else {
                    return output({ error: 'La moneda es obligatorio' }, 400);
                }

            } catch (error) {
                return output({ error: error.toString() }, 400);
            }
        }
  } catch (error) {
    return output({ error: error.toString() }, 500);
  }
}

exports.handler = middy(fnHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
