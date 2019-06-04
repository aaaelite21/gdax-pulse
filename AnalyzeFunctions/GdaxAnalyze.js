const toTheMinute = require('../Lib/toTheMinute')
module.exports=function(message){
    //update Time
    if (message.type === 'match') { //looking for the most recent price match = when a maker and taker order are paired up
        let priceOfMatch = parseFloat(message.price);
        if (priceOfMatch !== this.currentData.price) {
            this.currentData.price = priceOfMatch;
            this.onNewPrice(this.currentData.price, this.currentData.time);
        }
    }

    if (message.time) {
        let current = new Date(message.time);
        let now = new Date(current.getTime() - 1000 * this.delay)
        if (this.lastMinute !== now.getMinutes()) { // will not change after this
            this.lastMinute = now.getMinutes();
            //update time
            this.currentData.time = toTheMinute(now);
            this.onMin1(this.currentData.price, this.currentData.time);
            if (this.lastMinute % 5 === 0) {
                this.onMin5(this.currentData.price, this.currentData.time)
            }
            if (this.lastMinute % 15 === 0) {
                this.onMin15(this.currentData.price, this.currentData.time)
            }

            if (this.lastHour !== now.getHours()) {
                this.lastHour = now.getHours();
                this.onHour1(this.currentData.price, this.currentData.time);
                if (this.lastHour % 6 === 0) {
                    this.onHour6(this.currentData.price, this.currentData.time)
                }

                if (this.lastDay !== now.getDate()) {
                    this.lastDay = now.getDate();
                    this.onDay(this.currentData.price, this.currentData.time)
                }

                if (this.lasUtcDay !== now.getUTCDate()) {
                    this.lasUtcDay = now.getUTCDate();
                    this.onUtcDay(this.currentData.price, this.currentData.time);
                }
            }
        }
    }
}