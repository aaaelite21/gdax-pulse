module.exports = function (message) {
    //update Time
    if (message.last) { //looking for the most recent price match = when a maker and taker order are paired up
        let priceOfMatch = parseFloat(message.last);
        if (priceOfMatch !== this.currentData.price) {
            this.currentData.price = priceOfMatch;
            this.onNewPrice(this.currentData.price, this.currentData.time);
        }
    }

    if (message.timestamp || message.unix) {
        let current = new Date(message.timestamp || message.unix);
        let now = new Date(current.getTime() - 1000 * this.delay)
        this.analyzeNewTime(now);
    }
}