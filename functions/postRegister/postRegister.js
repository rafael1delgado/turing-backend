const bcrypt = require('bcrypt');
const uuid = require('uuid');
const { client } = require('../../utils/conect-mongodb');
const { output } = require('../../utils/utils');
let { userSchema } = require('../../validation/user');

let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

const fnHandler = async (event) => {
    try {
        let { httpMethod: method } = event;
        let data = event.body;
        let { fname, lname, alias, email, psw } = data;

        if (method === 'OPTIONS') {
            // To enable CORS
            return output("success", 200)
        }

        if(method == 'POST') {
            let salt = await bcrypt.genSalt(10);
            let pass = await bcrypt.hash(psw, salt);

            await client.connect();
            const collectionUsers = client.db().collection('users');

            try {
                await userSchema.validate(data)
                await collectionUsers.insertOne({
                    fname: fname,
                    lname: lname,
                    alias: alias,
                    email: email,
                    psw: pass,
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

// module.exports = { fnHandler }
exports.handler = middy(fnHandler).use(httpHeaderNormalizer()).use(jsonBodyParser());