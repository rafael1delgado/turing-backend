const twofactor = require("node-2fa");

function verifyTwoFactor(token, otp) {
    const delta = twofactor.verifyToken(token, otp);
    console.log(delta);
}
