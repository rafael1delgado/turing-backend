let yup = require('yup');
const { client } = require('../utils/conect-mongodb');

function destinationType(message) {
    return this.test({
        name: 'destinationType',
        message: message,
        test: async (type) => {
            if (type == 'email') {
                return true;
            }
            return false;
        }
    });
}

function userExists(message) {
    return this.test({
        name: 'userExists',
        message: message,
        test: async (value) => {
            await client.connect();
            let collections = client.db().collection('users');
            let results = await collections.find({ 'email': value}).toArray();
            if(results.length > 0)
                return true;
            return false;
        }
    });
}

yup.addMethod(yup.mixed, 'destinationType', destinationType);
yup.addMethod(yup.mixed, 'userExists', userExists);

let paySchema = yup.object({
    type: yup.string().required().destinationType('El tipo es inválido'),
    destination: yup.string().min(2).max(255).required().userExists('El usuario destino no existe.'),
    amount: yup.number('El monto debe ser numérico').moreThan(0, 'El monto debe ser mayor a cero').required(),
    money: yup.string().required(),
});

module.exports = {
    paySchema
}