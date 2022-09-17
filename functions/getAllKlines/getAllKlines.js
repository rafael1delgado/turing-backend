const { output } = require("../../utils/utils");
const { binanceClient } = require("../../utils/binance");
const { client } = require("../../utils/conect-mongodb");

const handler = async (event) => {
  // let {
  //   queryStringParameters: { symbols },
  // } = event;

  let { httpMethod: method } = event;

  if (method === "GET") {
    try {
      await client.connect();
      const collectionSymbols = client.db().collection("symbols");
      const info = await collectionSymbols.findOne({ id: 1 });
      const symbols = info.symbols;
      let response = {};
      for (const symbol of symbols) {
        let { data } = await binanceClient.klines(symbol, "15m");
        let formattedData = data.map((item) => {
          return {
            time: item[0] / 1000,
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
          };
        });
        response[symbol] = formattedData;
      }

      return output(response, 200);
    } catch (error) {
      console.log(error);
      return output({ error }, 500);
    }
  }
};

module.exports = { handler };
