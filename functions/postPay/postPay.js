let { paySchema } = require("../../validation/pay");
const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");
const { verifyJwt } = require("../../utils/jwt");

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { sendEmail } = require("../../utils/email");

async function getBalance(email, money) {
  await client.connect();
  const collectionUsers = client.db().collection("users");
  let users = await collectionUsers.find({ email: email }).toArray();

  if (users.length > 0 && users[0].balance.assets[money.toLowerCase()])
    return users[0].balance.assets[money.toLowerCase()];
  return 0;
}

const fnHandler = async (event) => {
  try {
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
      let data = event.body;
      let { type, destination, amount, money, note } = data;
      try {
        await paySchema.validate(data);
        amount = Number.parseFloat(amount);
        money = money.toLowerCase();

        // Find destination
        let field = {};
        field[`${type}`] = destination;
        await client.connect();
        const userDestinations = client.db().collection("users");
        let usersDest = await userDestinations.find(field).toArray();
        let userDestination = usersDest.length > 0 ? usersDest[0] : null;

        // Find Balance Origin
        let userOrigin = user;
        let balanceOrigin = await getBalance(userOrigin.email, money);

        if (balanceOrigin >= amount) {
          const collectionUsers = client.db().collection("users");

          // credit to userDestination.email
          let newBalanceDestination =
            (await getBalance(userDestination.email, money)) +
            Number.parseFloat(amount);
          const movementCredit = {
            type: "credit",
            from_to: userOrigin.email,
            amount: Number.parseFloat(amount),
            balance: newBalanceDestination,
            money: money,
            date: Math.floor(Date.now() / 1000),
          };
          let moneyBalanceDestination = {};
          moneyBalanceDestination["balance.assets." + money] =
            newBalanceDestination;

          await collectionUsers.updateOne(
            { email: userDestination.email },
            { $set: moneyBalanceDestination }
          );

          sendEmail(
            userDestination.email,
            "Has recibido un pago",
            `${
              userDestination.name
            } has recibido un pago por ${amount} ${money.toUpperCase()} de ${
              userOrigin.name
            }`
          );

          await collectionUsers.updateOne(
            { email: userDestination.email },
            {
              $push: {
                "balance.movements": { $each: [movementCredit], $position: 0 },
              },
            }
          );

          // debit to userOrigin.email
          let newBalanceOrigin =
            (await getBalance(userOrigin.email, money)) -
            Number.parseFloat(amount);
          const movementDebit = {
            type: "debit",
            from_to: userDestination.email,
            amount: Number.parseFloat(amount),
            balance: newBalanceOrigin,
            money: money,
            date: Math.floor(Date.now() / 1000),
            note: note,
          };

          let moneyBalanceOrigin = {};
          moneyBalanceOrigin["balance.assets." + money] = newBalanceOrigin;

          await collectionUsers.updateOne(
            { email: userOrigin.email },
            { $set: moneyBalanceOrigin }
          );

          await collectionUsers.updateOne(
            { email: userOrigin.email },
            {
              $push: {
                "balance.movements": { $each: [movementDebit], $position: 0 },
              },
            }
          );

          return output(
            {
              msg: `Pago por ${amount} ${money} a ${userDestination.email} fue enviado exitosamente.`,
            },
            200
          );
        } else {
          return output(
            {
              error: "Disculpe, ud no posee balance suficiente en la cuenta.",
              description: `El balance actual es ${balanceOrigin} ${money.toUpperCase()}`,
            },
            400
          );
        }
      } catch (error) {
        return output(
          {
            error: error.toString(),
            path: error.path,
            description: error.errors,
          },
          400
        );
      } finally {
        await client.close();
      }
    }
  } catch (error) {
    return output({ error: error.toString() }, 500);
  }
};

exports.handler = middy(fnHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
