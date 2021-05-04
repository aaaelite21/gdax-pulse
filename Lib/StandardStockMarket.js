const toTheMinute = require("./toTheMinute");
const { Nyc } = require("./ConvertToExchangeTimes");

module.exports = function (now) {
  //make only work between open hours
  let nyc_time = Nyc(now);
  let open = 9; //09:30 NYC
  let close = 16; //16:00 NYC

  if (
    (nyc_time.hour > open ||
      (nyc_time.hour === open && nyc_time.minute >= 30)) &&
    nyc_time.hour < close
  ) {
    if (this.lastMinute !== nyc_time.minute) {
      //mark current minute
      this.lastMinute = nyc_time.minute;
      //update current pulse data time
      this.currentData.time = toTheMinute(now);

      //handle minutly event calls
      this.onMin1(this.currentData.price, this.currentData.time);

      //handle 5 minute event calls
      if (this.lastMinute % 5 === 0) {
        this.onMin5(this.currentData.price, this.currentData.time);
      }

      //handle 15 minute event calls
      if (this.lastMinute % 15 === 0 || this.last15 > this.lastMinute % 15) {
        this.onMin15(this.currentData.price, this.currentData.time);
      }
      this.last15 = this.lastMinute % 15;

      //handle hourly updates
      if (this.lastHour !== nyc_time.hour && nyc_time.minute >= 30) {
        //handle open updates
        if (nyc_time.hour === open || this.lastHour > nyc_time.hour) {
          this.onOpen(this.currentData.price, this.currentData.time);
          this.onDay(this.currentData.price, this.currentData.time);
          this.onUtcDay(this.currentData.price, this.currentData.time);
        }

        //handle hourly updates
        if (nyc_time.hour >= open && nyc_time.hour < close) {
          this.onHour1(this.currentData.price, this.currentData.time);
        }

        //update to reflect change in hour
        this.lastHour = nyc_time.hour;
      }

      //handle market close
      if (nyc_time.minute === 59 && nyc_time.hour === close - 1) {
        this.onClose(this.currentData.price, this.currentData.time);
      }
    }
  }
};
