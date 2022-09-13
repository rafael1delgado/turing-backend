const { Spot } = require("@binance/connector");

const binanceClient = new Spot(
  process.env.BINANCE_KEY,
  process.env.BINANCE_SECRET,
  {
    baseURL: "https://testnet.binance.vision",
  }
);

// const binanceClient = new Spot("", "");

module.exports = { binanceClient };
