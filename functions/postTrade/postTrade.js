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

    if (!user.verified) {
      return output(
        {
          error:
            "Por favor, verifica tu email para poder realizar esta operación",
        },
        400
      );
    }
    const { symbol, quantity, type } = event.body;

    try {
      const email = user.email;
      const minNotional = await getMinNotional(symbol);
      const price = await getPrice(symbol);
      const notional = quantity * price;

      if (notional < minNotional) {
        return output(
          {
            error: `El producto del precio pro la cantidad debe sera mayor o igual a ${minNotional}`,
          },
          400
        );
      }

      let walletFunds = user.balance.assets;
      const coinTradeSymbol = symbol.slice(0, -4);

      if (type.toUpperCase() === "BUY" && notional > walletFunds.usdt) {
        return output(
          { error: "No tiene suficiente USDT para realizar la transacción" },
          400
        );
      }

      if (
        type.toUpperCase() === "SELL" &&
        quantity > walletFunds[coinTradeSymbol]
      ) {
        return output(
          {
            error: `No tiene suficiente ${coinTradeSymbol} para realizar la transacción`,
          },
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

      return output({ msg: "transacción realizada exitosamente" }, 200);
    } catch (error) {
      return output({ error: error }, 500);
    } finally {
      await client.close();
    }
  }
};

exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
