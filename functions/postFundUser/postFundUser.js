let middy = require;
let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { output } = require("../../utils/utils");
const { verifyJwt } = require("../../utils/jwt");
const {
  checkReceivedPayment,
  transferToSpotWallet,
} = require("../../utils/binance");

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
    const { time, amount, currency } = event.body;

    try {
      const paymentChecked = await checkReceivedPayment(time, amount, currency);

      if (!paymentChecked) {
        return output(
          {
            error:
              "No se encontró ninguna transacción con los datos suministrados",
          },
          400
        );
      }
      // await transferToSpotWallet(currency, amount)

      return output({ msg: "Recarga exitosa" }, 200);
    } catch (error) {
      return output({ error: "Ocurrió un error" }, 500);
    }
  }
};

exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
