module.exports = function (message) {
    //update Time
    if (message.type === 'match') { //looking for the most recent price match = when a maker and taker order are paired up
        let priceOfMatch = parseFloat(message.price);
        if (priceOfMatch !== this.currentData.price) {
            this.currentData.price = priceOfMatch;
            this.onNewPrice(this.currentData.price, this.currentData.time);
        }

        this.onMatch(this.currentData.price, this.currentData.time, message);
    }

    if (message.time) {
        let current = new Date(message.time);
        let now = new Date(current.getTime() - 1000 * this.delay)
        this.analyzeNewTime(now);
    }
}