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
        expiresIn: "5m",
      });
      // url en el frontend
      const url = `${process.env.FRONTEND_HOST}/recovery?emailToken=${emailToken}`;

      // url para prueba en el backend
      // const url = `http://localhost:8888/postChangePass?emailToken=${emailToken}`;

      const text = `Para crear una nueva contraseña haz click en el siguiente <a href="${url}">link</a>`;
      sendEmail(email, "Nueva contraseña", text);
      return output(
        {
          msg: "Se ha enviado un correo a su dirección para crear una nueva constraseña",
        },
        200
      );
    } catch (error) {
      return output({ error: "Hubo un problema, vuelve a intentar" }, 500);
    }
  }
};
exports.handler = middy(handler).use(httpHeaderNormalizer());
