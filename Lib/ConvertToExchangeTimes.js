const winter_offset = 5;
const summer_offset = 4;
const march = 2;
const november = 10;
const hour_in_ms = 3600000;
const day_in_ms = 86400000;

/**
 *
 * @param {Number} day_of_the_first
 */
function GetDateOfSecondSunday(day_of_the_first) {
  if (day_of_the_first === 0) return 8; //sunday
  if (day_of_the_first === 1) return 14; //monday
  if (day_of_the_first === 2) return 13; //tuesday
  if (day_of_the_first === 3) return 12; //wednesday
  if (day_of_the_first === 4) return 11; //thursday
  if (day_of_the_first === 5) return 10; //friday
  if (day_of_the_first === 6) return 9; //saturday
}

function getDateOfFirstSunday(day_of_the_first){
  if (day_of_the_first === 0) return 0; //sunday
  if (day_of_the_first === 1) return 7; //monday
  if (day_of_the_first === 2) return 6; //tuesday
  if (day_of_the_first === 3) return 5; //wednesday
  if (day_of_the_first === 4) return 4; //thursday
  if (day_of_the_first === 5) return 3; //friday
  if (day_of_the_first === 6) return 2; //saturday
}

/**
 *
 * @param {Date} _date
 */
function Nyc(_date) {
  let tz_offset = winter_offset;

  let now = new Date(typeof _date === "string" ? new Date(_date) : _date);
  let current_month = now.getUTCMonth();
  if (current_month > march && current_month <= november) {
    tz_offset = summer_offset;
  }

  let temp_nyc_time = new Date(now.getTime() - tz_offset * hour_in_ms);

  if (current_month === march || current_month === november) {
    let day_of_the_month = temp_nyc_time.getUTCDate();
    let first_of_the_month = new Date(
      temp_nyc_time.getTime() - (day_of_the_month - 1) * day_in_ms,
    );
    let day_of_first = first_of_the_month.getUTCDay();
    let date_of_second_sunday = GetDateOfSecondSunday(day_of_first);

    if (
      (current_month === march && date_of_second_sunday < day_of_the_month) 
    ) {
      tz_offset = summer_offset;
    }

    if (current_month === november 
      && getDateOfFirstSunday(day_of_first) < day_of_the_month 
      && now.getUTCHours() >= 6){
      tz_offset = winter_offset;
    }

    if (current_month === march && date_of_second_sunday === day_of_the_month) {
      let utc_hour = temp_nyc_time.getUTCHours();
      if (utc_hour >= 2) tz_offset = summer_offset;
    }

    if (
      current_month === november &&
      getDateOfFirstSunday(day_of_first) === day_of_the_month
    ) {
      temp_nyc_time = new Date(now.getTime() - summer_offset * hour_in_ms);
      let utc_hour = temp_nyc_time.getUTCHours();
      if (utc_hour >= 2) tz_offset = winter_offset;
    }
  }

  let offset_time = new Date(now.getTime() - tz_offset * hour_in_ms);

  return {
    year: offset_time.getUTCFullYear(),
    month: offset_time.getUTCMonth() + 1,
    day: offset_time.getUTCDate(),
    hour: offset_time.getUTCHours(),
    minute: offset_time.getUTCMinutes(),
    day_of_week: offset_time.getUTCDay(),
  };
}

module.exports = {
  Nyc,
};
