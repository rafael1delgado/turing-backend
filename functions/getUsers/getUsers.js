const { client } = require('../../utils/conect-mongodb');
const { output } = require('../../utils/utils');
let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

const fnHandler = async (event) => {
    try {
        let { httpMethod: method } = event;

        if(method == 'GET') {
            await client.connect();
            const collectionUsers = client.db().collection('users');
            const users = await collectionUsers.find({}).toArray();

            return output({ users: users}, 200);
        }
    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

exports.handler = middy(fnHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
