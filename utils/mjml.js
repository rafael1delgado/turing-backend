const axios = require("axios");
require('dotenv').config();

const mjmlApi = axios.create({
  baseURL: "https://api.mjml.io/v1",
  auth: {
    username: process.env.MJML_ID,
    password: process.env.MJML_SECRET,
  },
});
async function getHtmlWithButton(text, buttonLabel, link) {
  const mjml = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>

        <mj-image width="100px" src="https://i.ibb.co/JszvgN5/photo-2022-08-19-05-54-07.jpg"></mj-image>

        <mj-divider border-color="#512999"></mj-divider>

        <mj-text font-size="20px" color="#8C53F0" font-family="helvetica">${text}</mj-text>
<mj-button background-color="#8C53F0" border-radius="15px"
                 href="${link}">
      ${buttonLabel}
      </mj-button>

      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  const { data } = await mjmlApi.post("/render", { mjml });
  return data.html;
}
async function getHtml(text) {
  const mjml = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>

        <mj-image width="100px" src="https://i.ibb.co/JszvgN5/photo-2022-08-19-05-54-07.jpg"></mj-image>

        <mj-divider border-color="#512999"></mj-divider>

        <mj-text font-size="20px" color="#8C53F0" font-family="helvetica">${text}</mj-text>

      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  const { data } = await mjmlApi.post("/render", { mjml });
  return data.html;
}

module.exports = {  getHtmlWithButton, getHtml };
