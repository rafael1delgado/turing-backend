const jwt = require("jsonwebtoken");
const {
  SECRET: { SECRET_TOKEN },
} = require("./utils");
const { client } = require("./conect-mongodb");

async function verifyJwt(auth) {
  try {
    const TOKEN = auth[0].split(" ")[1];
    const decode = jwt.verify(TOKEN, SECRET_TOKEN);
    await client.connect();
    const collectionUsers = client.db().collection("users");
    const user = await collectionUsers.findOne({ email: decode.email });
    if (user) {
      if (user.iat > decode.iat) {
        return { error: "Token expirado", user };
      }
      return { error: false, user };
    }
    return { error: "Error de autenticación", user };
  } catch (error) {
    console.log(error)
    return { error: "Token expirado" };
  }
}

module.exports = { verifyJwt };
