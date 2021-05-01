function Nyc(_date){
    let now = new Date((typeof _date === "string" ? new Date(_date) : _date));
    let tzString = now.toLocaleString("en-US", {timeZone: "America/New_York"});
    let date = tzString.split(",")[0];
    let time = tzString.split(",")[1].trim();

    let temp_date = date.split("/");
    let temp_time = time.split(":");
    return {
        year: parseInt(temp_date[2]),
        month: parseInt(temp_date[0]),
        day: parseInt(temp_date[1]),
        hour: parseInt(temp_time[0]) + (temp_time[2].indexOf("PM") !==-1 ? 12 : 0),
        minute:parseInt(temp_time[1])
    };
}
module.exports = {
    Nyc
};