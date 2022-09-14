const SECRET = {
  SECRET_TOKEN: "secret",
};

function output(content, statusCode) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(content)
  };
}

module.exports = {
  output,
  SECRET,
};
