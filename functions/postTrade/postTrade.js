const { output } = require("../../utils/utils");
const { verifyJwt } = require("../../utils/jwt");
const { makeTrade, getMinNotional, getPrice } = require("../../utils/binance");
const { client } = require("../../utils/conect-mongodb");

async function saveTradeInfo(email, tradeInfo, wallet) {
  // await client.connect();
  const collectionUsers = client.db().collection("users");
  let r = await collectionUsers.updateOne(
    { email: email },
    {
      $push: { "balance.orders": tradeInfo },
      $set: { "balance.assets": wallet },
    }
  );
  return r;
}

const handler = async (event) => {
  let { httpMethod: method } = event;
  const { symbol, quantity, type } = JSON.parse(event.body);
  const user = await verifyJwt(event.multiValueHeaders.authorization);

  if (user.length == 0) {
    return output({ error: "authentication error" }, 500);
  }

  if (method == "POST") {
    try {
      const email = user.email;
      const minNotional = await getMinNotional(symbol);
      const price = await getPrice(symbol);
      const notional = quantity * price;

      if (notional < minNotional) {
        return output(
          {
            error: `The product of quantity * price has to be equal or greater than ${minNotional}`,
          },
          500
        );
      }

      let walletFunds = user.balance.assets;
      const coinTradeSymbol = symbol.slice(0, -4);

      if (type.toUpperCase() === "BUY" && notional > walletFunds.usdt) {
        return output({ error: "Not enought usdt to trade" }, 500);
      }

      if (
        type.toUpperCase() === "SELL" &&
        quantity > walletFunds[coinTradeSymbol]
      ) {
        return output(
          { error: `Not enought ${coinTradeSymbol} to trade` },
          500
        );
      }
      const tradeInfo = await makeTrade(symbol, quantity, type);
      const usdtTradeQty = tradeInfo.cummulativeQuoteQty;
      const coinTradeQty = tradeInfo.executedQty;
      if (tradeInfo.side === "BUY") {
        walletFunds[coinTradeSymbol] += parseFloat(coinTradeQty);
        walletFunds.usdt -= parseFloat(usdtTradeQty);
        await saveTradeInfo(email, tradeInfo, walletFunds);
      } else {
        walletFunds[coinTradeSymbol] -= parseFloat(coinTradeQty);
        walletFunds.usdt += parseFloat(usdtTradeQty);
        await saveTradeInfo(email, tradeInfo, walletFunds);
      }

      return output(
        { msg: "trade completed succesfully", binance: tradeInfo },
        200
      );
    } catch (error) {
      console.log(error);
      return output({ error: error }, 500);
    }
  }
};

module.exports = { handler };
