const { verifyJwt } = require("../../utils/jwt");
const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");

const handler = async (event) => {
  let { httpMethod: method } = event;
  const user = await verifyJwt(event.multiValueHeaders.authorization);

  if (user.length == 0) {
    return output({ error: "authentication error" }, 500);
  }
  const email = user[0].email;

  if (method === "GET") {
    try {
      await client.connect();
      const collectionUsers = client.db().collection("users");
      const info = await collectionUsers.find({ email }).toArray();
      const tradeHistory = info[0].tradeHistory;

      if (!tradeHistory) {
        return output({ msg: "user has no trades" }, 200);
      }

      return output(tradeHistory, 200);
    } catch (error) {
      return output(error, 500);
    }
  }
};

module.exports = { handler };
