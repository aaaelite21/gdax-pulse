const { Nyc } = require("../index").ConvertToExchangeTimes;
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
        year: 2021,
        day_of_week: 5,
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
        year: 2021,
        day_of_week: 5,
      });
    });
    it("handles date after DST", () => {
      let time = new Date("4/16/2021 013:30 utc");
      let conversion = Nyc(time);
      assert.deepStrictEqual(conversion, {
        day: 16,
        hour: 9,
        minute: 30,
        month: 4,
        year: 2021,
        day_of_week: 5,
      });
    });
    it("handles date before DST", () => {
      let time = new Date("1/16/2021 014:30 utc");
      let conversion = Nyc(time);
      assert.deepStrictEqual(conversion, {
        day: 16,
        hour: 9,
        minute: 30,
        month: 1,
        year: 2021,
        day_of_week: 6,
      });
    });
    it("handles DST before 2:00 am est on the second sunday of march (UTC-5)", () => {
      let time = new Date("3/14/2021 05:00 utc");
      let conversion = Nyc(time);
      assert.deepStrictEqual(
        conversion,
        {
          day: 14,
          hour: 0,
          minute: 0,
          month: 3,
          year: 2021,
          day_of_week: 0,
        },
        "should be UTC -5",
      );
    });
    it("handles DST after 2:00 am est on the second sunday of march (UTC-4)", () => {
      let time = new Date("3/14/2021 07:30 utc");
      let conversion = Nyc(time);
      assert.deepStrictEqual(
        conversion,
        {
          day: 14,
          hour: 3,
          minute: 30,
          month: 3,
          year: 2021,
          day_of_week: 0,
        },
        "should now be UTC -4",
      );
    });
    it("handles DST before 2:00 am est on the second sunday of november (UTC-4)", () => {
      let time = new Date("11/8/2020 05:30 utc");
      let conversion = Nyc(time);
      assert.deepStrictEqual(
        conversion,
        {
          day: 8,
          hour: 1,
          minute: 30,
          month: 11,
          year: 2020,
          day_of_week: 0,
        },
        "should be UTC -4 before fall behind",
      );
    });
    it("handles DST at 1:00 am est on the second sunday of november roll back (UTC-5)", () => {
      let time = new Date("11/8/2020 06:00 utc");
      let conversion = Nyc(time);
      assert.deepStrictEqual(
        conversion,
        {
          day: 8,
          hour: 1,
          minute: 0,
          month: 11,
          year: 2020,
          day_of_week: 0,
        },
        "should now be UTC -5 after fall behind",
      );
    });
    it("handles DST after 2:00 am est on the second sunday of november (UTC-5)", () => {
      let time = new Date("11/8/2020 07:00 utc");
      let conversion = Nyc(time);
      assert.deepStrictEqual(
        conversion,
        {
          day: 8,
          hour: 2,
          minute: 0,
          month: 11,
          year: 2020,
          day_of_week: 0,
        },
        "should now be UTC -5 after fall behind",
      );
    });
  });
});
