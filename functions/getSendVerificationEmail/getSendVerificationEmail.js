const jwt = require("jsonwebtoken");
let middy = require("middy");
let { httpHeaderNormalizer } = require("middy/middlewares");
require("dotenv").config();
const { output } = require("../../utils/utils");
const { sendEmail } = require("../../utils/email");
const { mjmlApi } = require("../../utils/mjml");

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

      // const text = `Por favor verifica tu email haciendo click en el siguiente <a href="${url}">link</a>`;
      const mjml = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>

        <mj-image width="100px" src="https://i.ibb.co/JszvgN5/photo-2022-08-19-05-54-07.jpg"></mj-image>

        <mj-divider border-color="#512999"></mj-divider>

        <mj-text font-size="20px" color="#8C53F0" font-family="helvetica">Bienvenido a Turing Exchange. Por favor verifica tu email presionando el siguiente bot\u00f3n.</mj-text>
<mj-button background-color="#8C53F0" border-radius="15px"
                 href="${url}">
        Verificar
      </mj-button>

      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
      const { data } = await mjmlApi.post("/render", { mjml });
      sendEmail(email, "Verificación de email", data.html);
      return output({ msg: "Correo enviado exitosamente" }, 200);
    } catch (error) {
      return output({ error }, 500);
    }
  }
};
exports.handler = middy(handler).use(httpHeaderNormalizer());
