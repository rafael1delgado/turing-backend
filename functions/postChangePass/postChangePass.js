const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { client } = require("../../utils/conect-mongodb");
const { output } = require("../../utils/utils");
let { passSchema } = require("../../validation/user");

const handler = async (event) => {
  let { httpMethod: method } = event;
  if (method == "POST") {
    let { emailToken, psw } = event.body;
    try {
      const decode = jwt.verify(emailToken, process.env.SECRET_TOKEN);
      try {
        await passSchema.validate({ psw });
      } catch (error) {
        return output({ error: error.errors }, 500);
      }
      let salt = await bcrypt.genSalt(10);
      let pass = await bcrypt.hash(psw, salt);
      await client.connect();
      const collectionUsers = client.db().collection("users");
      collectionUsers.updateOne(
        { email: decode.email },
        { $set: { psw: pass } }
      );
      return output({ msg: "Contraseña cambiada exitosamente" }, 200);
    } catch (error) {
      return output({ error: "Token expirado o inválido" }, 500);
    }
  }
};
exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
