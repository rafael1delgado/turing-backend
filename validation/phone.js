let yup = require("yup");

let phoneSchema = yup.object({
    phone: yup
      .string()
      .required()
      .min(13)
      .max(13)
});

module.exports = {
    phoneSchema,
};
