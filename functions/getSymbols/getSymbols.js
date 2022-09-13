const { output } = require("../../utils/utils");
const { client } = require("../../utils/conect-mongodb");

const handler = async (event) => {
  try {
    await client.connect();
    const collectionSymbols = client.db().collection("symbols");
    const info = await collectionSymbols.find({}).toArray();
    const symbols = info[0].symbols;
    return output({ symbols }, 200);
  } catch (error) {
    console.log(error);
    return output(error, 500);
  }
};
module.exports = { handler };
