const jwt = require("jsonwebtoken");
const { output } = require("../../utils/utils");
require("dotenv").config();

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

const { verifyJwt } = require("../../utils/jwt");
const { client } = require("../../utils/conect-mongodb");
const { phoneSchema } = require("../../validation/phone");

const handler = async (event) => {
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
      let { phone } = data;

      try {
        await phoneSchema.validate(data);

        await client.connect();
        const collectionUsers = client.db().collection("users");

        await collectionUsers.updateOne(
            { email: user.email },
            { $set: { 'phone': phone, 'enabledTwoFactor': true } }
        );

        return output({ msg: 'La Autenticación de Dos Factores fue activada exitosamente.', phone }, 200);

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
}

exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
