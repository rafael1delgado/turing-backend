const jwt = require("jsonwebtoken");
let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
const { client } = require("../../utils/conect-mongodb");
const { output } = require("../../utils/utils");

const handler = async (event) => {
  let { httpMethod: method } = event;
  if (method == "GET") {
    let {
      queryStringParameters: { emailToken },
    } = event;
    try {
      const decode = jwt.verify(emailToken, process.env.SECRET_TOKEN);
      await client.connect();
      const collectionUsers = client.db().collection("users");
      await collectionUsers.updateOne({ email: decode.email }, { $set: { verified: true } });
      return output({msg: "Correo verificado exitosamente"}, 200)
    } catch (error) {
      return output({ error: "Token expirado o inválido" }, 500);
    } finally {
        await client.close();
    }
  }
};
exports.handler = middy(handler)
    .use(httpHeaderNormalizer());
