const yup = require('yup');

let userSchema = yup.object({
    name: yup.string().required().matches(/^\s+[a-zA-Z]+\s[a-zA-Z]+\s+$/),
    email: yup.string().email().required(),
    psw: yup.string().required().min(8).max(18)
    .matches(/^((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/),
});

let capitalize = (str) => {

    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

module.exports = {
    userSchema, capitalize
}