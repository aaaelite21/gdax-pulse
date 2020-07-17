const toTheMinute = require("./toTheMinute");

module.exports = function (now) {
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
};
