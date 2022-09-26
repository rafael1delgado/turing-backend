let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");

const handler = async (event) => {
  try {
    await client.connect();
    const collectionSymbols = client.db().collection("symbols");
    const info = await collectionSymbols.findOne({ id: 1 });
    const symbols = info.symbols;
    return output({ msg: symbols }, 200);
  } catch (error) {
    return output({ error }, 500);
  } finally {
    await client.close();
  }
};

exports.handler = middy(handler).use(httpHeaderNormalizer());
