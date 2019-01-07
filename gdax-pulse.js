class Pulse {
    constructor() {
        let now = (new Date());
        this.lastMinute = now.getMinutes();
        this.lastHour = now.getHours();
        this.lastDay = now.getDate()
        this.currentData = {
            price: 0
        }
    }

    analyze(message) {
        //update Time
        if (message.type !== 'subscriptions') {
            let now = new Date(message.time);
            if (this.lastMinute !== now.getMinutes()) {
                this.lastMinute = now.getMinutes();
                this.onMin1();
                if (this.lastMinute % 5 === 0) {
                    this.onMin5()
                }
                if (this.lastMinute % 15 === 0) {
                    this.onMin15()
                }
            }

            if (this.lastHour !== now.getHours()) {
                this.lastHour = now.getHours();
                this.onHour1();
                if (this.lastHour % 6 === 0) {
                    this.onHour6()
                }
            }

            if (this.lastDay !== now.getDate()) {
                this.lastDay = now.getDate();
                this.onDay()
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
        }
    }

    onMin1() {}
    onMin5() {}
    onMin15() {}
    onHour1() {}
    onHour6() {}
    onDay() {}
}

module.exports = Pulse;