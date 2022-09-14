const { output } = require("../../utils/utils");
const { verifyJwt } = require("../../utils/jwt");
const { makeTrade, saveTradeHistory } = require("../../utils/trade");

const handler = async (event) => {
  let { httpMethod: method } = event;
  const { symbol, quantity } = JSON.parse(event.body);
  const user = await verifyJwt(event.multiValueHeaders.authorization);

  if (user.length == 0) {
    return output({ error: "authentication error" }, 500);
  }

  const email = user[0].email;

  if (method == "POST") {
    try {
      const tradeInfo = await makeTrade(symbol, quantity);
      const r = await saveTradeHistory(email, tradeInfo);
      return output({ msg: "trade completed succesfully", mongodb: r }, 200);
    } catch (error) {
      console.log(error);
      return output({ error: error }, 500);
    }
  }
};

module.exports = { handler };
