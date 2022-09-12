const bcrypt = require('bcrypt');
const uuid = require('uuid');
const { client } = require('../../utils/conect-mongodb');
const { output } = require('../../utils/utils');
let { userSchema } = require('../../validation/user');

const handler = async (event) => {
    try {
        let { httpMethod: method } = event;
        const data = JSON.parse(event.body);
        const { name, last_name, email, password } = data;
        const salt = await bcrypt.genSalt(10);
        let pass = await bcrypt.hash(password, salt);

        if(method == 'POST') {
            await client.connect();
            const collectionUsers = client.db().collection('users');
            try {
                await userSchema.validate(data)
                await collectionUsers.insertOne({
                    name: name,
                    last_name: last_name,
                    email: email,
                    password: pass,
                    uuid: uuid.v4(),
                });
                return output({ msg: 'El usuario fue registrado exitosamente.'}, 200)
            } catch (error) {
                return output({ error: error.toString(), path: error.path, description: error.errors}, 400);
            }
        }
    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

module.exports = { handler }
