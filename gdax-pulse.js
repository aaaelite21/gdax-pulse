class Pulse {
    constructor() {
        let now = new Date();
        this.lastMinute = now.getMinutes();
        this.lastHour = now.getHours();
        this.lastDay = now.getDate();
        this.lasUtcDay = now.getUTCDate();
        this.currentData = {
            time: toTheMinute(now).getTime(),
            price: 0
        }
    }

    analyze(message) {
        //update Time
        if (message.type === 'match') {
            this.currentData.price = parseFloat(message.price);
        }

        if (message.time) {
            let now = new Date(message.time);
            if (this.lastMinute !== now.getMinutes()) {
                this.lastMinute = now.getMinutes();
                //update time
                this.currentData.time = toTheMinute(now);
                this.onMin1();
                if (this.lastMinute % 5 === 0) {
                    this.onMin5()
                }
                if (this.lastMinute % 15 === 0) {
                    this.onMin15()
                }

                if (this.lastHour !== now.getHours()) {
                    this.lastHour = now.getHours();
                    this.onHour1();
                    if (this.lastHour % 6 === 0) {
                        this.onHour6()
                    }

                    if (this.lastDay !== now.getDate()) {
                        this.lastDay = now.getDate();
                        this.onDay()
                    }

                    if (this.lasUtcDay !== now.getUTCDate()) {
                        this.lasUtcDay = now.getUTCDate();
                        this.onUtcDay();
                    }
                }
            }
        }
    }

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
        }
    }

    onMin1() {}
    onMin5() {}
    onMin15() {}
    onHour1() {}
    onHour6() {}
    onDay() {}
    onUtcDay() {}
}

module.exports = Pulse;

function toTheMinute(date) {
    let coeff = 1000 * 60;
    return new Date(Math.round(date.getTime() / coeff) * coeff)
}