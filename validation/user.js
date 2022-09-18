let yup = require('yup');
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

yup.addMethod(yup.mixed, 'unique', myFunction);

let userSchema = yup.object({
    fname: yup.string().min(2).max(255).required(),
    lname: yup.string().min(2).max(255).required(),
    alias: yup.string().min(2).max(255).required().unique('users', 'alias', 'Alias is already in use'),
    email: yup.string().email().min(3).max(255).required(),
    email: yup.string().email().min(3).max(255).required().unique('users', 'email', 'Email is already in use'),
    psw: yup.string().min(8).max(20).required()
});

module.exports = {
    userSchema
}
