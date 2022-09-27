const { verifyJwt } = require("../../utils/jwt");
const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

const fnHandler = async (event) => {
  try {
    let { httpMethod: method } = event;

    if (method === "OPTIONS") {
      return output("success", 200);
    }

    if (method == "GET") {
      const { error: jwtError, user } = await verifyJwt(
        event.multiValueHeaders.Authorization
      );

      if (jwtError) {
        return output({ error: jwtError }, 500);
      }
      try {
        await client.connect();
        const collectionUsers = client.db().collection("users");
        let user = await collectionUsers.findOne({ email: user.email });

        return output({ msg: user.balance.assets }, 200);
      } catch (error) {
        return output({ error: error.toString() }, 400);
      } finally {
        await client.close();
      }
    }
  } catch (error) {
    return output({ error: error.toString() }, 500);
  }
};

exports.handler = middy(fnHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
