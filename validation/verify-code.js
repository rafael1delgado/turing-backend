let yup = require("yup");

let verifyCodeSchema = yup.object({
    email: yup
    .string()
    .min(2)
    .max(255)
    .email(),
    code: yup
        .string()
        .required()
        .min(6)
        .max(6),
});

module.exports = {
    verifyCodeSchema,
};
