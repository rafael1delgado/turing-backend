const { client } = require("../../utils/conect-mongodb");
const { output } = require("../../utils/utils");
const { binanceClient } = require("../../utils/binance");

const coins = [
  "XRP",
  "LTC",
  "USDT",
  "XMR",
  "DASH",
  "ZEC",
].sort();

const handler = async (event) => {
  try {
    let { httpMethod: method } = event;

    if (method == "GET") {
      const info = await binanceClient.exchangeInfo();
      const coinBaseSymbols = info.data.symbols.filter((symbol) => {
        if (
          ["UP", "DOWN", "BULL", "BEAR"].some((i) => symbol.symbol.includes(i))
        ) {
          return;
        }
        return (
          coins.some((coin) => {
            return symbol.baseAsset.includes(coin);
          }) &&
          coins.some((coin) => {
            return symbol.quoteAsset.includes(coin);
          })
        );
      });

      const allSymbols = coinBaseSymbols.map((symbol) => {
        return symbol.symbol;
      });

      await client.connect();
      const collectionSymbols = client.db().collection("symbols");
      const r = await collectionSymbols.updateOne(
        { id: 1 },
        { $set: { symbols: allSymbols } },
        { upsert: true }
      );

      return output(r, 200);
    }
  } catch (error) {
    return output({ error: error.toString() }, 500);
  } finally {
    await client.close();
  }
};

module.exports = { handler };
