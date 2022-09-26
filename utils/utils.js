function output(content, statusCode) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(content)
  };
}

module.exports = {
  output
};
