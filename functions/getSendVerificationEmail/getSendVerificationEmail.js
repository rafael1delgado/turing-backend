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
        expiresIn: "1d",
      });
      const url = `${process.env.FRONTEND_HOST}/verification?emailToken=${emailToken}`;
      const text =
        "Bienvenido a Turing Exchange. Por favor verifica tu email presionando el siguiente bot\u00f3n.";
      const buttonLabel = "Verificar email";
      const html = await getHtmlWithButton(text, buttonLabel, url);
      sendEmail(email, "Verificación de email", html);
      return output({ msg: "Correo enviado exitosamente" }, 200);
    } catch (error) {
      return output({ error }, 500);
    }
  }
};
exports.handler = middy(handler).use(httpHeaderNormalizer());
