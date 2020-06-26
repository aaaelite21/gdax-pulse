const AnalyzeGdax = require("./AnalyzeFunctions/GdaxAnalyze");
const toTheMinute = require("./Lib/toTheMinute");
const AnalyzeBinance = require("./AnalyzeFunctions/BinanceAnalyze");
const AnalyzeCcxws = require("./AnalyzeFunctions/CcxwsAnalyze");
const AnalyzeAlpacha = require("./AnalyzeFunctions/Alpacha");
class Pulse {
  constructor(delay, exchange) {
    this.exchange = exchange === undefined ? "gdax" : exchange.toLowerCase();
    let now = new Date();
    this.lastMinute = now.getMinutes();
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
    } else if (this.exchange == "alpacha") {
      this.analyze = AnalyzeCcxws.bind(this);
    } else {
      throw new error(
        "incorrect exchange, select gdax, binance and anything on CCXWS",
      );
    }
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

  analyzeNewTime(now) {
    if (this.lastMinute !== now.getMinutes()) {
      // will not change after this
      this.lastMinute = now.getMinutes();
      //update time
      this.currentData.time = toTheMinute(now);
      this.onMin1(this.currentData.price, this.currentData.time);
      if (this.lastMinute % 5 === 0) {
        this.onMin5(this.currentData.price, this.currentData.time);
      }
      if (this.lastMinute % 15 === 0) {
        this.onMin15(this.currentData.price, this.currentData.time);
      }

      if (this.lastHour !== now.getHours()) {
        this.lastHour = now.getHours();
        this.onHour1(this.currentData.price, this.currentData.time);
        if (this.lastHour % 6 === 0) {
          this.onHour6(this.currentData.price, this.currentData.time);
        }

        if (this.lastDay !== now.getDate()) {
          this.lastDay = now.getDate();
          this.onDay(this.currentData.price, this.currentData.time);
        }

        if (this.lasUtcDay !== now.getUTCDate()) {
          this.lasUtcDay = now.getUTCDate();
          this.onUtcDay(this.currentData.price, this.currentData.time);
        }
      }
    }
  }
}

module.exports = Pulse;
