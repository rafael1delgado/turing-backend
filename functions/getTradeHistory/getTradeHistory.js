let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
const { verifyJwt } = require("../../utils/jwt");
const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");

const handler = async (event) => {
  let { httpMethod: method } = event;

  if (method === "OPTIONS") {
    return output("success", 200);
  }

  if (method === "GET") {
    const { error: jwtError, user } = await verifyJwt(
      event.multiValueHeaders.Authorization
    );

    if (jwtError) {
      return output({ error: jwtError }, 500);
    }

    const email = user.email;

    try {
      await client.connect();
      const collectionUsers = client.db().collection("users");
      const response = await collectionUsers.findOne({ email });

      const tradeHistory = response.balance.orders;

      if (!tradeHistory) {
        return output({ msg: "No hay transacciones" }, 400);
      }

      return output({ msg: tradeHistory }, 200);
    } catch (error) {
      return output({ error }, 500);
    } finally {
      await client.close();
    }
  }
};

exports.handler = middy(handler).use(httpHeaderNormalizer());
