const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { client } = require("../../utils/conect-mongodb");
let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { output } = require("../../utils/utils");
require("dotenv").config();

const handler = async (event) => {
  try {
    let { httpMethod: method } = event;
    const data = event.body
    const { email, psw } = data;

    await client.connect();
    const collectionUsers = client.db().collection("users");
    const users = await collectionUsers.find({ email: email }).toArray();

    if (method == "POST") {
        if (users.length > 0) {
        const validPassword = await bcrypt.compare(psw, users[0].psw);

        if (validPassword) {
          const token = await jwt.sign({ email: email }, process.env.SECRET_TOKEN, {
            expiresIn: "12h",
          });
          const iat = Math.round(Date.now()/1000);
          collectionUsers.updateOne(
            { email },
            { $set: { iat } },
            { $upsert: true }
          );

          return output({ msg: "Bienvenido a la Wallet Turing.", token }, 200);
        } else {
          return output(
            { error: "Disculpe, el usuario y/o la contraseña es errada" },
            400
          );
        }
      } else {
        return output(
          { error: "El usuario no coincide con nuestros registros." },
          400
        );
      }
    }
  } catch (error) {
    return output({ error: 'La contraseña es invalida.'}, 400);
  }
};

exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
