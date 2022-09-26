const jwt = require("jsonwebtoken");
let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
require("dotenv").config();
const { output } = require("../../utils/utils");
const { sendEmail } = require("../../utils/email");

const handler = async (event) => {
  let { httpMethod: method } = event;
  if (method == "GET") {
    let {
      queryStringParameters: { email },
    } = event;
    try {
      const emailToken = jwt.sign({ email: email }, process.env.SECRET_TOKEN, {
        expiresIn: "1d",
      });
      // url en el frontend
      const url = `${process.env.FRONTEND_HOST}/verification?emailToken=${emailToken}`;

      // url para prueba en el backend
      // const url = `http://localhost:8888/getEmailVerification?emailToken=${emailToken}`;

      const text = `Por favor verifica tu email haciendo click en el siguiente <a href="${url}">link</a>`;
      sendEmail(email, "Verificación de email", text);
      return output({ msg: "Correo enviado exitosamente" }, 200);
    } catch (error) {
      return output({ error }, 500);
    }
  }
};
exports.handler = middy(handler).use(httpHeaderNormalizer());
