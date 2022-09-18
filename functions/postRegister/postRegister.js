const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const { client } = require("../../utils/conect-mongodb");
let { userSchema, capitalize } = require("../../validation/user");
const { output } = require("../../utils/utils");
require("dotenv").config();

const fnHandler = async (event) => {
  try {
    let { httpMethod: method } = event;
    let data = event.body;
    let { name, email, psw } = data;

    if (method === "OPTIONS") {
      return output("success", 200);
    }

    if (method == "POST") {

      let fullname = name.split(" ");
      fullname = fullname.map( word => capitalize(word) );
      name = fullname.join(" ").trim();

      email = email.toLowerCase();

      let salt = await bcrypt.genSalt(10);
      let pass = await bcrypt.hash(psw, salt);

      await client.connect();
      const collectionUsers = client.db().collection("users");

      try {
        await userSchema.validate(data);
        const token = await jwt.sign({ email: email }, process.env.SECRET_TOKEN, {
          expiresIn: "12h",
        });
        const assets = { ustd: 0, ltc: 0, xrp: 0, xmr: 0, dash: 0, zcash: 0 };
        const iat = Math.round(Date.now() / 1000);
        await collectionUsers.insertOne({
          name: name,
          email: email,
          psw: pass,
          uuid: uuid.v4(),
          iat,
          balance: { assets },
        });
        return output(
          { msg: "El usuario fue registrado exitosamente.", token },
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
      }
    }
  } catch (error) {
    return output({ error: error.toString() }, 500);
  }
};

exports.handler = middy(fnHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
