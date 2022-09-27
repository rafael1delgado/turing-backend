let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
const { output } = require("../../utils/utils");
const { verifyJwt } = require("../../utils/jwt");

const handler = async (event) => {
  let { httpMethod: method } = event;

  if (method === "OPTIONS") {
    return output("success", 200);
  }

  if (method == "GET") {
    const { error: jwtError, user } = await verifyJwt(
      event.multiValueHeaders.Authorization
    );

    if (jwtError) {
      return output({ error: jwtError }, 500);
    }
    const userObject= {name: user.name, email: user.email, uuid: user.uuid, verified: user.verified, tlf: user.tlf}
    return output({ msg: userObject }, 200);
  }
};

exports.handler = middy(handler).use(httpHeaderNormalizer());
