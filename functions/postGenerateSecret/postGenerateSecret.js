const { verifyJwt } = require("../../utils/jwt");
const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");
let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");
const twofactor = require("node-2fa");

const fnHandler = async (event) => {
  try {
    let { httpMethod: method } = event;
        const { error: jwtError, user } = await verifyJwt(
            event.multiValueHeaders.Authorization
        );

        if (jwtError) {
            return output({ error: jwtError }, 500);
        }

        if (method === 'OPTIONS') {
            return output("success", 200)
        }

        if(method == 'POST') {
            const twoFactor = twofactor.generateSecret({ name: user.name, account: user.email });

            await client.connect();
            const collectionUsers = await client.db().collection('users');
            const users = await collectionUsers.findOne({ email: user.email});
            let userLogin = (users) ? users : null;
            if(userLogin && userLogin.enabledTwoFactor == false)
            {
                await collectionUsers.updateOne({ email: user.email }, { $set: { twoFactor: twoFactor, enabledTwoFactor: true } });
                return output({ msg: 'La autenticación 2FA fue activada exitosamente.', twoFactor: twoFactor }, 200);
            }

            return output({ error: 'La autenticación 2FA ya esta activa.' }, 400);
        }

    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

exports.handler = middy(fnHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
