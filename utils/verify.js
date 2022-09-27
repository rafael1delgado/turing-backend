require("dotenv").config();
let jwt = require("jsonwebtoken");

let tokenOld = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhZmFlbEBnbWFpbC5jb20iLCJpYXQiOjE2NjM2MzE1MTQsImV4cCI6MTY2MzY3NDcxNH0.qLr16nzlvx4KmqJ3ubGN-DcWJJYU_MNRBMcbcrVhN3g"
let decoded = jwt.verify(tokenOld, process.env.SECRET_TOKEN);
console.log(decoded);

var iat = new Date(decoded.iat * 1000); // emitido el
var exp = new Date(decoded.exp * 1000); // expira el
var now = new Date(); // fecha actual

console.log(iat <= now <= exp);
console.log(iat);
console.log(exp);
console.log(now);

console.log(iat.toLocaleString());
console.log(exp.toLocaleString());
console.log(now.toLocaleString());


const token = event.multiValueHeaders.Authorization[0].split(" ")[1]
decoded = await jwt.verify(token, TU_TOKEN);
return output({msg: 'Bien', decoded: decoded}, 200);
