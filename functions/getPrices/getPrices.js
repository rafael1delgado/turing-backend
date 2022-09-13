const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");
const { binanceClient } = require("../../utils/binance");

const handler = async (event) => {
  try {
    await client.connect();
    const collectionSymbols = client.db().collection("symbols");
    const info = await collectionSymbols.find({}).toArray();
    const symbols = info[0].symbols;
    const r = await binanceClient.tickerPrice("", [...symbols]);
    let prices = r.data.sort((a, b) => a.price - b.price);

    return output({ prices }, 200);
  } catch (error) {
    console.log(error);
    return output(error, 500);
  }
};
module.exports = { handler };
