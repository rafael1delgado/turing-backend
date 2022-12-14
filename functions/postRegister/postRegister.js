const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
require("dotenv").config();

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

let { userSchema, userData } = require("../../validation/user");
const { client } = require("../../utils/conect-mongodb");
const { output } = require("../../utils/utils");
const { sendEmail } = require("../../utils/email");
const { getHtmlWithButton } = require("../../utils/mjml");

async function verificationEmail(email) {
  const emailToken = jwt.sign({ email: email }, process.env.SECRET_TOKEN, {
    expiresIn: "1d",
  });
  const url = `${process.env.FRONTEND_HOST}/verification?emailToken=${emailToken}`;
  const text =
    "Bienvenido a Turing Exchange. Por favor verifica tu email presionando el siguiente bot\u00f3n.";
  const buttonLabel = "Verificar email";
  const html = await getHtmlWithButton(text, buttonLabel, url);
  sendEmail(email, "Verificación de email", html);
}

const fnHandler = async (event) => {
  try {
    let { httpMethod: method } = event;

    if (method === "OPTIONS") {
      return output("success", 200);
    }

    if (method == "POST") {
      let data = event.body;
      let { name, email, psw, tlf } = data;
      userData(data);

      let salt = await bcrypt.genSalt(10);
      let pass = await bcrypt.hash(psw, salt);

      await client.connect();
      const collectionUsers = client.db().collection("users");

      try {
        await userSchema.validate(data);
        const token = jwt.sign({ email: email }, process.env.SECRET_TOKEN, {
          expiresIn: "12h",
        });
        const assets = { usdt: 5, ltc: 0, xrp: 0, xmr: 0, dash: 0, zcash: 0 };
        const movementCredit = [
          {
            type: "credit",
            from_to: "turingwallet@gmail.com",
            amount: 5,
            balance: 5,
            money: "usdt",
            note: "bonus",
            date: Math.floor(Date.now() / 1000),
          },
        ];

        const { iat } = jwt.verify(token, process.env.SECRET_TOKEN);
        await collectionUsers.insertOne({
          name: name,
          email: email,
          tlf: tlf,
          psw: pass,
          uuid: uuid.v4(),
          verified: false,
          enabledTwoFactor: false,
          iat,
          balance: { assets, movements: movementCredit },
        });
        verificationEmail(email);
        return output(
          { msg: "El usuario fue registrado exitosamente.", token: token },
          200
        );
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
