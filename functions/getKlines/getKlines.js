const { output } = require("../../utils/utils");
const { binanceClient } = require("../../utils/binance");

const handler = async (event) => {
  let {
    queryStringParameters: { coin },
  } = event;
  try {
    let { data } = await binanceClient.klines(coin, "15m");
    const formattedData = data.map((item) => {
      return {
        time: item[0] / 1000,
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      };
    });

    return output(formattedData, 200);
  } catch (error) {
    console.log(error);
    return output({ error }, 500);
  }
};

module.exports = { handler };
