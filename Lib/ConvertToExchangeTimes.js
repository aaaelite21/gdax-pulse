/**
 * 
 * @param {Number} day_of_the_first 
 */
 function GetDateOfSecondSunday(day_of_the_first) {
    if(0) return 8;     //sunday
    if(1) return 14;    //monday
    if(2) return 13;    //tuesday
    if(3) return 12;    //wednesday
    if(4) return 11;    //thursday
    if(5) return 10;    //friday
    if(6) return 9;     //saturday  
}

/**
 * 
 * @param {Date} _date 
 */
function Nyc(_date){
    let tz_offset = 5;

    let now = new Date((typeof _date === "string" ? new Date(_date) : _date));
    let current_month = now.getUTCMonth();

    if(current_month === 2 || current_month === 10){ //march or november
        let day_of_the_month = now.getUTCDate();
        let first_of_the_month = new Date(now.getTime() - (day_of_the_month-1) * 86400000);
        let day_of_first = first_of_the_month.getUTCDay();
        let date_of_second_sunday = GetDateOfSecondSunday(day_of_first);

        if((current_month === 2 && date_of_second_sunday < day_of_the_month) || 
        (current_month === 10 && date_of_second_sunday > day_of_the_month)){
            tz_offset = 4;
        }

        //todo we can skip the day of since stocks don't trade sunday

    } else if(current_month > 2 && current_month < 10){
        tz_offset = 4;
    }

    let offset_time = new Date(now.getTime() - tz_offset * 3600000);

    return {
        year: offset_time.getUTCFullYear(),
        month: offset_time.getUTCMonth() + 1,
        day: offset_time.getUTCDate(),
        hour: offset_time.getUTCHours(),
        minute: offset_time.getUTCMinutes()
    };
}


module.exports = {
    Nyc
};