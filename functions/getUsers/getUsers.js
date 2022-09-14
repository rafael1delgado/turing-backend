const { client } = require('../../utils/conect-mongodb');
const { output } = require('../../utils/utils');

const handler = async (event) => {
    try {
        let { httpMethod: method } = event;

        if(method == 'GET') {
            await client.connect();
            const collectionUsers = client.db().collection('users');
            const users = await collectionUsers.find({}).toArray();

            return output({ users: users}, 200);
        }
    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

module.exports = { handler }
