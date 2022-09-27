const { output } = require("../../utils/utils");

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

const { client } = require("../../utils/conect-mongodb");
let { verifyCodeSchema } = require("../../validation/verify-code");

const handler = async (event) => {
  try {
    let { httpMethod: method } = event;

    if (method === "OPTIONS") {
      return output("success", 200);
    }

    if (method == "POST") {

        let data = event.body;
        let { email, code } = data;

        try {
            await verifyCodeSchema.validate(data);

            await client.connect();
            const collectionUsers = client.db().collection("users");
            const users = await collectionUsers.find({ 'email': email }).toArray();
            let user = (users.length > 0) ? users[0] : null;

            if(user)
            {
                var now = new Date();
                var exp = new Date(user.twoFactor.exp * 1000);

                if(code == user.twoFactor.code && now <= exp) {
                    return output({ msg: '2FA exitosa' }, 200);
                } else {
                    return output({ error: 'Token de 2FA invalido o expirado.' }, 400);
                }
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
        }

    }
  } catch (error) {
    return output({ error: error.toString() }, 500);
  }
}

exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
