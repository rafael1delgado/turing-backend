const { client } = require('../utils/conect-mongodb');

function myFunction(collectionName, fieldName, message) {
    return this.test({
        name: 'unique',
        message: message,
        test: async (value) => {
            await client.connect();
            let collections = client.db().collection(collectionName);
            let field = {};
            field[fieldName] = value;
            let results = await collections.find(field).toArray();
            if(results.length > 0)
                return false;
            else
            return true;
        }
    });
}

module.exports = {
    myFunction
}
