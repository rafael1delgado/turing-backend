const axios = require("axios");

const mjmlApi = axios.create({
  baseURL: "https://api.mjml.io/v1",
  auth: {
    username: "6fbe23f2-2e9c-4dc8-9af1-2c7dca86c5e5",
    password: "d8d8b2e2-f8ec-4f07-ab93-276384bfbc07",
  },
});
const mjml = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>

        <mj-image width="100px" src="https://i.ibb.co/JszvgN5/photo-2022-08-19-05-54-07.jpg"></mj-image>

        <mj-divider border-color="#512999"></mj-divider>

        <mj-text font-size="20px" color="#8C53F0" font-family="helvetica">Bienvenido a Turing Exchange. Por favor verifica tu email presionando el siguiente bot\u00f3n.</mj-text>
<mj-button background-color="#8C53F0" border-radius="15px"
                 href="#">
        Verificar
      </mj-button>

      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
async function getHtml() {
  const { data } = await mjmlApi.post("/render", { mjml });
}
 getHtml()

module.exports = { mjmlApi };
