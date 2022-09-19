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
      collectionUsers.updateOne({ email: decode.email }, { $set: { verified: true } });
      return output({msg: "Correo verificado exitosamente"}, 200)
    } catch (error) {
      console.log(error);
      return output({ error: "Token expirado o inválido" }, 500);
    }
  }
};
exports.handler = middy(handler).use(httpHeaderNormalizer());
