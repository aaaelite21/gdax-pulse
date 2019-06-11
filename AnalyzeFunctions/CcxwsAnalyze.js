module.exports = function (message) {
    //update Time
    if (message.side === 'buy' || message.side === 'sell') { //looking for the most recent price match = when a maker and taker order are paired up
        let priceOfMatch = parseFloat(message.price);
        if (priceOfMatch !== this.currentData.price) {
            this.currentData.price = priceOfMatch;
            this.onNewPrice(this.currentData.price, this.currentData.time);
        }
    }

    if (message.unix) {
        let current = new Date(message.unix);
        let now = new Date(current.getTime() - 1000 * this.delay)
        this.analyzeNewTime(now);
    }
}