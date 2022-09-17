const { output } = require("../../utils/utils");
const { getPrices } = require("../../utils/binance");

const handler = async (event) => {
  let { httpMethod: method } = event;
  if (method == "GET") {
    try {
      const prices = await getPrices();
      return output({ prices }, 200);
    } catch (error) {
      console.log(error);
      return output(error, 500);
    }
  }
};
module.exports = { handler };
