const jwt = require("jsonwebtoken");
const { client } = require("./conect-mongodb");
require("dotenv").config();

async function verifyJwt(auth) {
  try {
    const TOKEN = auth[0].split(" ")[1];
    const decode = jwt.verify(TOKEN, process.env.SECRET_TOKEN);
    await client.connect();
    const collectionUsers = client.db().collection("users");
    const user = await collectionUsers.findOne({ email: decode.email });
    if (user) {
      if (user.iat > decode.iat) {
        return { error: "Token expirado o inválido", user };
      }
      return { error: false, user };
    }
    return { error: "Error de autenticación", user };
  } catch (error) {
    return { error };
  } finally {
    await client.close();
  }
}

module.exports = { verifyJwt };
