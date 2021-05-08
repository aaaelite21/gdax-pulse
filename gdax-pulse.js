const AnalyzeGdax = require("./AnalyzeFunctions/GdaxAnalyze");
const toTheMinute = require("./Lib/toTheMinute");
const AnalyzeBinance = require("./AnalyzeFunctions/BinanceAnalyze");
const AnalyzeCcxws = require("./AnalyzeFunctions/CcxwsAnalyze");
const AnalyzeAlpaca = require("./AnalyzeFunctions/Alpaca");

const _24HrAnalysis = require("./Lib/24HrMarketTime");
const StandardStockHours = require("./Lib/StandardStockMarket");

const { Nyc } = require("./Lib/ConvertToExchangeTimes");

class Pulse {
  constructor(delay, exchange) {
    this.exchange = exchange === undefined ? "gdax" : exchange.toLowerCase();
    let now = new Date();
    this.lastMinute = now.getMinutes();
    this.last15 = this.lastMinute % 15;
    this.lastHour = now.getHours();
    this.lastDay = now.getDate();
    this.lasUtcDay = now.getUTCDate();
    this.delay = delay !== undefined ? delay : 0;
    if (this.exchange == "gdax") {
      this.analyze = AnalyzeGdax.bind(this);
    } else if (this.exchange == "binance") {
      this.analyze = AnalyzeBinance.bind(this);
    } else if (this.exchange == "ccxws") {
      this.analyze = AnalyzeCcxws.bind(this);
    } else if (this.exchange == "alpaca") {
      //delay by half an hour to handle open at 9:30
      let shiftedTime = Nyc(now);
      this.lastHour = shiftedTime.hour;

      this.analyze = AnalyzeAlpaca.bind(this);
    } else {
      throw new error(
        "incorrect exchange, select 'gdax', 'binance', 'alpaca', or  anything on CCXWS",
      );
    }

    this.analyzeNewTime =
      this.exchange === "alpaca"
        ? StandardStockHours.bind(this)
        : _24HrAnalysis.bind(this);

    this.currentData = {
      time: toTheMinute(now),
      price: 0,
    };
  }

  analyze(message) {}

  on(type, func) {
    if (type === "m1") {
      this.onMin1 = func;
    } else if (type === "m5") {
      this.onMin5 = func;
    } else if (type === "m15") {
      this.onMin15 = func;
    } else if (type === "h1") {
      this.onHour1 = func;
    } else if (type === "h6") {
      this.onHour6 = func;
    } else if (type === "d") {
      this.onDay = func;
    } else if (type === "d-utc") {
      this.onUtcDay = func;
    } else if (type === "new-price") {
      this.onNewPrice = func;
    } else if (type === "match") {
      this.onMatch = func;
    } else if (type === "open") {
      this.onOpen = func;
    } else if (type === "close") {
      this.onClose = func; //goes 1 minutes before actual close
    }
  }

  onMin1() {}
  onMin5() {}
  onMin15() {}
  onHour1() {}
  onHour6() {}
  onDay() {}
  onUtcDay() {}
  onNewPrice() {}
  onMatch() {}

  //stock specific functions
  onOpen() {}
  onClose() {}

  analyzeNewTime() {}
}

module.exports = Pulse;
