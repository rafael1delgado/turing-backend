let yup = require("yup");
const { client } = require("../utils/conect-mongodb");

function myFunction(collectionName, fieldName, message) {
  return this.test({
    name: "unique",
    message: message,
    test: async (value) => {
      await client.connect();
      let collections = client.db().collection(collectionName);
      let field = {};
      field[fieldName] = value;
      let results = await collections.find(field).toArray();
      if (results.length > 0) return false;
      else return true;
    },
  });
}

yup.addMethod(yup.mixed, "unique", myFunction);

let userSchema = yup.object({
  name: yup
    .string()
    .required()
    .matches(/^\s?[a-zA-Z]+\s[a-zA-Z]+\s?$/),
  email: yup
    .string()
    .email()
    .required()
    .unique("users", "email", "Dirección de correo electrónico en uso"),
  psw: yup
    .string()
    .required()
    .min(8)
    .max(18)
    .matches(
      /^((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/
    ),
});

let capitalize = (str) => {
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

let passSchema = yup.object({
  psw: yup
    .string()
    .required()
    .min(8)
    .max(18)
    .matches(
      /^((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/
    ),
});

module.exports = {
  userSchema,
  capitalize,
  passSchema,
};
