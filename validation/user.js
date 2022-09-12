const yup = require('yup');

let userSchema = yup.object({
    name: yup.string().min(2).max(255).required(),
    last_name: yup.string().min(2).max(255).required(),
    email: yup.string().email().min(3).max(255).required(),
    password: yup.string().min(8).max(20).required()
});

module.exports = {
    userSchema
}
