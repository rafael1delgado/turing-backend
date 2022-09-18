
let decoded = await jwt.verify(token, SECRET_TOKEN);

var iat = new Date(); // emitido el
var exp = new Date(); // expira el
var now = new Date(); // fecha actual

console.log(iat <= now <= exp);
console.log(iat);
console.log(exp);
console.log(iat.toLocaleString());
console.log(exp.toLocaleString());


const token = event.multiValueHeaders.Authorization[0].split(" ")[1]
let decoded = await jwt.verify(token, SECRET_TOKEN);
return output({msg: 'Bien', decoded: decoded}, 200);
