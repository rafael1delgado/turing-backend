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
    const user = await collectionUsers.find({ email: decode.email }).toArray();
    return user;
  } catch (error) {
    return [];
  }
}

module.exports = { verifyJwt };
