const jwt = require("jsonwebtoken");
let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
require("dotenv").config();
const { output } = require("../../utils/utils");
const { sendEmail } = require("../../utils/email");
const { getHtmlWithButton } = require("../../utils/mjml");

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
      const url = `${process.env.FRONTEND_HOST}/recovery/${emailToken}`;
      const text = "Para crear una nueva contraseña haz click en el siguiente bot\u00f3n."
      const buttonLabel = "Crear contraseña";
      const html = await getHtmlWithButton(text, buttonLabel, url);
      sendEmail(email, "Nueva contraseña", html);
      return output(
        {
          msg: "Se ha enviado un correo a su dirección para crear una nueva constraseña",
        },
        200
      );
    } catch (error) {
      return output({ error }, 500);
    }
  }
};
exports.handler = middy(handler).use(httpHeaderNormalizer());
