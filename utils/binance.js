const { Spot } = require("@binance/connector");
const { client } = require("./conect-mongodb");

const binanceClient = new Spot(
  process.env.BINANCE_KEY,
  process.env.BINANCE_SECRET,
  {
    baseURL: "https://testnet.binance.vision",
  }
);

// const binanceClient = new Spot("", "");

async function makeTrade(symbol, quantity, type) {
  const response = await binanceClient.newOrder(symbol, type, "MARKET", {
    quantity,
  });
  const tradeInfo = response.data;
  return tradeInfo;
}

async function getPrices() {
  await client.connect();
  const collectionSymbols = client.db().collection("symbols");
  const info = await collectionSymbols.find({}).toArray();
  const symbols = info[0].symbols;
  const r = await binanceClient.tickerPrice("", [...symbols]);
  let prices = r.data.sort((a, b) => a.price - b.price);
  await client.close()
  return prices;
}

async function getPrice(symbol) {
  const r = await binanceClient.tickerPrice(symbol);
  const price = r.data.price;
  return price;
}

async function getMinNotional(symbol) {
  const response = await binanceClient.exchangeInfo({ symbols: [symbol] });
  const minNotional = response.data.symbols[0].filters[3].minNotional;
  return minNotional;
}

module.exports = {
  binanceClient,
  makeTrade,
  getPrices,
  getMinNotional,
  getPrice,
};
