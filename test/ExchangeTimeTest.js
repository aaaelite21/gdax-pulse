const { Nyc } = require("../Lib/ConvertToExchangeTimes");
const assert = require("assert");

describe("Timezone Conversions", () => {
    describe("Nyc", () => {
        it("get proper time and hours for new your time", () => {
            let time = new Date("1/15/2021 14:30 utc");
            let conversion = Nyc(time);
            assert.deepStrictEqual(conversion, {
                day: 15,
                hour: 9,
                minute: 30,
                month: 1,
                year: 2021
            });
        });
        it("respects 24 hour time", () => {
            let time = new Date("1/16/2021 02:30 utc");
            let conversion = Nyc(time);
            assert.deepStrictEqual(conversion, {
                day: 15,
                hour: 21,
                minute: 30,
                month: 1,
                year: 2021
            });
        });
    });
});