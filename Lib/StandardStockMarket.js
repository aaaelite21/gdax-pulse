const toTheMinute = require("./toTheMinute");

Date.prototype.stdTimezoneOffset = function () {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.isDstObserved = function () {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

module.exports = function (now) {
  if (this.lastMinute !== now.getMinutes()) {
    //make only work between open hours
    let shiftedTime = new Date(now.getTime() - 3600000 / 2);
    //TODO get New york time
    let isDst = this.currentData.time.isDstObserved();
    let open = isDst ? 13 : 14;
    let close = isDst ? 19 : 20;

    // will not change after this
    this.lastMinute = now.getMinutes();
    //update time
    this.currentData.time = toTheMinute(now);

    //handle hourle function calls
    if (this.lastHour !== shiftedTime.getUTCHours()) {
      this.lastHour = shiftedTime.getUTCHours();

      if (this.lastHour === open) {
        this.onOpen(this.currentData.price, this.currentData.time);
        this.onDay(this.currentData.price, this.currentData.time);
        this.onUtcDay(this.currentData.price, this.currentData.time);
      }

      if (this.lastHour >= open && this.lastHour <= close) {
        this.onHour1(this.currentData.price, this.currentData.time);
      }
    }

    if (
      this.currentData.time.getUTCHours() >= open &&
      this.currentData.time.getUTCHours() <= close &&
      !(this.currentData.time.getUTCHours() === close && this.lastMinute >= 30)
    ) {
      //handle minutly tasks
      this.onMin1(this.currentData.price, this.currentData.time);

      //handle 5 minute function calls
      if (this.lastMinute % 5 === 0) {
        this.onMin5(this.currentData.price, this.currentData.time);
      }

      //handle 15 minute function calls
      if (this.lastMinute % 15 === 0 || this.last15 > this.lastMinute % 15) {
        this.onMin15(this.currentData.price, this.currentData.time);
      }
      this.last15 = this.lastMinute % 15;
    }

    if (this.lastMinute === 59 && this.lastHour === close) {
      this.onClose(this.currentData.price, this.currentData.time);
    }
  }
};
