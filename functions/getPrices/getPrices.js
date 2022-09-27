let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
const { output } = require("../../utils/utils");
const { getPrices } = require("../../utils/binance");

const handler = async (event) => {
  let { httpMethod: method } = event;
  if (method == "GET") {
    try {
      const prices = await getPrices();
      return output({ msg: prices }, 200);
    } catch (error) {
      return output(error, 500);
    }
  }
};
exports.handler = middy(handler).use(httpHeaderNormalizer());
