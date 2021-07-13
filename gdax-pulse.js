const AnalyzeGdax = require("./AnalyzeFunctions/GdaxAnalyze");
const toTheMinute = require("./Lib/toTheMinute");
const AnalyzeBinance = require("./AnalyzeFunctions/BinanceAnalyze");
const AnalyzeCcxws = require("./AnalyzeFunctions/CcxwsAnalyze");
const AnalyzeAlpaca = require("./AnalyzeFunctions/Alpaca");

const _24HrAnalysis = require("./Lib/24HrMarketTime");
const StandardStockHours = require("./Lib/StandardStockMarket");

const { Nyc } = require("./Lib/ConvertToExchangeTimes");

class Pulse {
  constructor(delay, exchange, options) {
    //code for backwards compatabality
    if (typeof delay === "object") {
      options = delay;
    } else if (typeof exchange === "object") {
      options = exchange;
      options.delay = delay;
      options.exchange = options?.exchange ?? "gdax";
    } else if (typeof options === "object") {
      options.delay = delay ?? 0;
      options.exchange = exchange;
      options.exchange = exchange?.toLowerCase() ?? "gdax";
    }

    this.exchange = options?.exchange ?? exchange?.toLowerCase() ?? "gdax";
    this.delay = options?.delay ?? delay ?? 0;

    //end backwards compabality code
    this.open = {
      hour: options?.open?.hour ?? (this.exchange === "alpaca" ? 9 : 0),
      minutes: options?.open?.minutes ?? (this.exchange === "alpaca" ? 30 : 0),
    };
    this.close = {
      hour: options?.close?.hour ?? (this.exchange === "alpaca" ? 15 : 23),
      minutes: options?.close?.minutes ?? 59,
    };

    this.validateOpenAndClose();

    let now = new Date();
    this.lastMinute = now.getMinutes();
    this.last15 = this.lastMinute % 15;
    this.lastHour = now.getHours();
    this.lastDay = now.getDate();
    this.lasUtcDay = now.getUTCDate();
    this.locked = false;
    if (this.exchange === "gdax") {
      this._analyze = AnalyzeGdax.bind(this);
    } else if (this.exchange === "binance") {
      this._analyze = AnalyzeBinance.bind(this);
    } else if (this.exchange === "ccxws") {
      this._analyze = AnalyzeCcxws.bind(this);
    } else if (this.exchange === "alpaca") {
      let shiftedTime = Nyc(now);
      this.lastHour = shiftedTime.hour;
      this.lastMinute = shiftedTime.minute;

      this._analyze = AnalyzeAlpaca.bind(this);
    } else {
      throw new Error(
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

  validateOpenAndClose() {
    //check min minutes
    if (this.close.minutes < 0) this.close.minutes = 0;
    if (this.open.minutes < 0) this.open.minutes = 0;
    //check max minutes
    if (this.close.minutes > 59) this.close.minutes = 59;
    if (this.open.minutes > 59) this.open.minutes = 59;
    //check min hours
    if (this.close.hour < 0) this.close.hour = 0;
    if (this.open.hour < 0) this.open.hour = 0;
    //check max hours
    if (this.close.hour > 23) this.close.hour = 23;
    if (this.open.hour > 23) this.open.hour = 23;

    //check is stocks specific time
    if (this.exchange === "alpaca") {
      //check max hours
      if (this.close.hour > 15) this.close.hour = 15;
      if (this.open.hour > 15) this.close.hour = 15;
      //check min hours
      if (this.close.hour < 9) this.close.hour = 9;
      if (this.open.hour < 9) this.open.hour = 9;
    }
  }

  analyze(message) {
    if (!this.loccked) {
      this.locked = true;
      this._analyze(message);
      this.locked = false;
    }
  }
  _analyze(message) {}

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
