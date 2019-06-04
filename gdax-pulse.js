const AnalyzeGdax = require('./AnalyzeFunctions/GdaxAnalyze')
const toTheMinute = require('./Lib/toTheMinute')
const AnalyzeBinance = require('./AnalyzeFunctions/BinanceAnalyze')
class Pulse {
    constructor(delay,exchange) {
        this.exchange = exchange === undefined ? "gdax" : exchange.toLowerCase();
        let now = new Date();
        this.lastMinute = now.getMinutes();
        this.lastHour = now.getHours();
        this.lastDay = now.getDate();
        this.lasUtcDay = now.getUTCDate();
        this.delay = delay !== undefined ? delay : 0;
        if (this.exchange == "gdax"){
            this.analyze = AnalyzeGdax.bind(this);
        }
        else if(this.exchange == "binance"){
            this.analyze = AnalyzeBinance.bind(this);
        }
        else
            throw new error("incorrect exchange, select gdax or binance")
        this.currentData = {
            time: toTheMinute(now),
            price: 0
        }
    }

    analyze(message){}

    on(type, func) {
        if (type === 'm1') {
            this.onMin1 = func;
        } else if (type === 'm5') {
            this.onMin5 = func;
        } else if (type === 'm15') {
            this.onMin15 = func;
        } else if (type === 'h1') {
            this.onHour1 = func;
        } else if (type === 'h6') {
            this.onHour6 = func;
        } else if (type === 'd') {
            this.onDay = func;
        } else if (type === 'd-utc') {
            this.onUtcDay = func;
        } else if (type === 'new-price') {
            this.onNewPrice = func;
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
}

module.exports = Pulse;
