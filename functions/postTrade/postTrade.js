let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { output } = require("../../utils/utils");
const { verifyJwt } = require("../../utils/jwt");
const { makeTrade, getMinNotional, getPrice } = require("../../utils/binance");
const { client } = require("../../utils/conect-mongodb");

async function saveTradeInfo(email, tradeInfo, wallet) {
  await client.connect();
  const collectionUsers = client.db().collection("users");
  let r = await collectionUsers.updateOne(
    { email: email },
    {
      $push: { "balance.orders": tradeInfo },
      $set: { "balance.assets": wallet },
    }
  );
  await client.close()
  return r;
}

const handler = async (event) => {
  let { httpMethod: method } = event;

  if (method === "OPTIONS") {
    return output("success", 200);
  }

  if (method == "POST") {
    const { error: jwtError, user } = await verifyJwt(
      event.multiValueHeaders.Authorization
    );

    if (jwtError) {
      return output({ error: jwtError }, 500);
    }

    const { symbol, quantity, type } = event.body;

    try {
      const email = user.email;
      const minNotional = await getMinNotional(symbol);
      const price = await getPrice(symbol);
      const notional = quantity * price;

      if (!user.verified) {
        return output(
          {
            error: `The product of quantity * price has to be equal or greater than ${minNotional}`,
          },
          400
        );
      }

      if (notional < minNotional) {
        return output(
          {
            error: `The product of quantity * price has to be equal or greater than ${minNotional}`,
          },
          400
        );
      }

      let walletFunds = user.balance.assets;
      const coinTradeSymbol = symbol.slice(0, -4);

      if (type.toUpperCase() === "BUY" && notional > walletFunds.usdt) {
        return output({ error: "Not enought usdt to trade" }, 400);
      }

      if (
        type.toUpperCase() === "SELL" &&
        quantity > walletFunds[coinTradeSymbol]
      ) {
        return output(
          { error: `Not enought ${coinTradeSymbol} to trade` },
          400
        );
      }

      const {
        cummulativeQuoteQty,
        executedQty,
        symbol: tradeSymbol,
        side,
        transactTime,
      } = await makeTrade(symbol, quantity, type);
      const saveInfo = {
        tradeSymbol,
        executedQty,
        cummulativeQuoteQty,
        transactTime,
        side,
      };
      const usdtTradeQty = cummulativeQuoteQty;
      const coinTradeQty = executedQty;

      if (side === "BUY") {
        walletFunds[coinTradeSymbol] += parseFloat(coinTradeQty);
        walletFunds.usdt -= parseFloat(usdtTradeQty);
        await saveTradeInfo(email, saveInfo, walletFunds);
      } else {
        walletFunds[coinTradeSymbol] -= parseFloat(coinTradeQty);
        walletFunds.usdt += parseFloat(usdtTradeQty);
        await saveTradeInfo(email, saveInfo, walletFunds);
      }

      return output({ msg: "trade completed succesfully" }, 200);
    } catch (error) {
      return output({ error: error }, 500);
    }
  }
};

exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
