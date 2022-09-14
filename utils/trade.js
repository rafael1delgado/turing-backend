const { client } = require("./conect-mongodb");
const { binanceClient } = require("./binance");

async function makeTrade(symbol, quantity) {
  let response = await binanceClient.newOrder(symbol, "BUY", "MARKET", {
    quantity,
  });
  const tradeId = response.data.fills[0].tradeId;

  response = await binanceClient.myTrades(symbol, {
    fromId: tradeId,
  });

  const tradeInfo = response.data[0];

  return tradeInfo;
}

async function saveTradeHistory(email, tradeInfo) {
  await client.connect();
  const collectionUsers = client.db().collection("users");
  const r = await collectionUsers.updateOne(
    { email: email },
    { $push: { tradeHistory: tradeInfo } }
  );

  return r;
}

module.exports = { makeTrade, saveTradeHistory };
