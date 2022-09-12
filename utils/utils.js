const SECRET = {
  SECRET_TOKEN: "secret",
};

function output(content, statusCode) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(content),
  };
}

module.exports = {
  output,
  SECRET,
};
