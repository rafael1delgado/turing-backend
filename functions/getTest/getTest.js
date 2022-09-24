const { output } = require('../../utils/utils');
let middy = require("middy");
let { httpHeaderNormalizer, jsonBodyParser } = require("middy/middlewares");

const fnHandler = async (event) => {
    try {
        let { httpMethod: method } = event;

        if(method == 'GET') {
            return output({ msg: 'Esto es una prueba con middy sin mongodb'}, 200);
        }
    } catch (error) {
        return output({ error: error.toString() }, 500);
    }
}

exports.handler = middy(fnHandler)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser());
