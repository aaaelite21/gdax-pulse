const GdaxPulse = require("../gdax-pulse");
const assert = require("assert");
const GdaxSim = require("gdax-sim");
const TwoDays = require("./TwoDays.json");
describe("#Gdax-Pulse", () => {
  describe("#Updateing CurrentData", () => {
    let sim = new GdaxSim();
    it("updates the price on every match", () => {
      let pulse = new GdaxPulse();
      sim.websocketClient.on("message", (message) => {
        pulse.analyze(message);
        assert.strictEqual(pulse.currentData.price, sim.currentPrice);
      });
      sim.backtest([TwoDays[0]]);
    });
    it("updates the time to within a minute", () => {
      let pulse = new GdaxPulse();
      sim.websocketClient.on("message", (message) => {
        pulse.analyze(message);
      });
      sim.backtest([TwoDays[0]]);

      let target = new Date(TwoDays[0].time).getTime();
      let actual = new Date(pulse.currentData.time).getTime();
      assert.strictEqual(actual, target);
    });
  });

  describe("#Price Events", () => {
    let sim = new GdaxSim();
    let pulse = new GdaxPulse();
    sim.websocketClient.on("message", (message) => {
      pulse.analyze(message);
    });
    it("Fires every time a new price is traded", () => {
      let lastPrice = 0;
      let ran = false;
      pulse.on("new-price", (price) => {
        assert(lastPrice !== price, "event run on redundent price");
        lastPrice = price;
        ran = true;
      });
      sim.backtest(TwoDays);
      assert(ran, '"new-price" event not run');
    });
  });

  describe("#Time Events", () => {
    let sim = new GdaxSim();
    let pulse = new GdaxPulse();
    it("runs the time events the proper number of time", () => {
      //one test to same time as this test takes 250ms on my machiene
      let totalMinutes = 60 * 48; //60 mins per hr * 48hr per two days
      let minCounter = totalMinutes,
        fiveMinCounter = totalMinutes / 5,
        fifteenMinCounter = totalMinutes / 15,
        hourCounter = totalMinutes / 60,
        dayCounter = 2,
        utcDayCounter = 3;
      pulse.on("m1", () => {
        minCounter--;
      });
      pulse.on("m5", () => {
        fiveMinCounter--;
      });
      pulse.on("m15", () => {
        fifteenMinCounter--;
      });
      pulse.on("h1", () => {
        hourCounter--;
      });
      pulse.on("d", () => {
        dayCounter--;
      });
      pulse.on("d-utc", () => {
        utcDayCounter--;
      });
      sim.websocketClient.on("message", (message) => {
        pulse.analyze(message);
      });
      sim.backtest(TwoDays);
      assert.strictEqual(minCounter, 0, "minutes are failing");
      assert.strictEqual(fiveMinCounter, 0, "five minutes are failing");
      assert.strictEqual(fifteenMinCounter, 0, "fifteen minutes are failing");
      assert.strictEqual(hourCounter, 0, "hours are failing");
      assert.strictEqual(dayCounter, 0, "local days are failing"); //could get messed up based on local time
      assert.strictEqual(utcDayCounter, 0, "utc days are failing");
    });
  });

  describe("#Match Events", () => {
    let sim = new GdaxSim();
    let pulse = new GdaxPulse();
    it("runs the match events the proper number of time", () => {
      //one test to same time as this test takes 250ms on my machiene
      let match_counter = TwoDays.length * 4;

      pulse.on("match", () => {
        match_counter--;
      });

      sim.websocketClient.on("message", (message) => {
        pulse.analyze(message);
      });

      sim.backtest(TwoDays);
      assert.strictEqual(match_counter, 0);
    });
    it("properly handle daylight savings", () => {});
  });

  describe("#All Events", () => {
    let sim = new GdaxSim();
    let pulse = new GdaxPulse();
    pulse.lastHour = 0;

    it("event functions are fed the current pulse data as parameters", () => {
      function test(price, time) {
        assert.strictEqual(price, pulse.currentData.price);
        assert.strictEqual(time.getTime(), pulse.currentData.time.getTime());
      }
      pulse.on("m1", (price, time) => {
        test(price, time);
      });
      pulse.on("m5", (price, time) => {
        test(price, time);
      });
      pulse.on("m15", (price, time) => {
        test(price, time);
      });
      pulse.on("h1", (price, time) => {
        test(price, time);
      });
      pulse.on("d", (price, time) => {
        test(price, time);
      });
      pulse.on("d-utc", (price, time) => {
        test(price, time);
      });
      pulse.on("new-price", (price, time) => {
        test(price, time);
      });
      sim.websocketClient.on("message", (message) => {
        pulse.analyze(message);
      });
      sim.backtest(TwoDays);
    });
  });

  describe("#Time Events Stocks", () => {
    let sim = new GdaxSim();
    let pulse = new GdaxPulse(0, "alpaca");
    pulse.lastHour = 0;

    it("runs the time events the proper number of times for stocks", () => {
      let openCalled = 0,
        closeCalled = 0,
        hourCalled = 0,
        daysCalled = 0,
        _15sCalled = 0;
      //one test to same time as this test takes 250ms on my machiene
      pulse.on("h1", (price, time) => {
        hourCalled++;
        assert.notStrictEqual(time.getMinutes(), 0, time.toISOString());
      });
      pulse.on("open", (price, time) => {
        openCalled++;
        assert.strictEqual(time.getUTCHours(), 14);
        assert.strictEqual(time.getMinutes(), 30);
      });
      pulse.on("d-utc", (price, time) => {
        daysCalled++;
        let t = new Date(time.toISOString());
        assert.strictEqual(t.getHours(), 9);
        assert.strictEqual(t.getMinutes(), 30);
      });
      pulse.on("close", (price, time) => {
        closeCalled++;
        let t = new Date(time);
        assert.strictEqual(t.getMinutes(), 59);
        assert.strictEqual(t.getHours(), 15);
      });
      pulse.on("m15", (price, time) => {
        _15sCalled++;
        let t = new Date(time);
      });
      sim.websocketClient.on("message", (message) => {
        if (message.price) {
          let msg = {
            T: "t",
            Price: message.price,
            Timestamp: new Date(message.time),
          };
          pulse.analyze(msg);
        }
      });
      sim.backtest(TwoDays);

      assert.strictEqual(openCalled, 2, "opens failed");
      assert.strictEqual(closeCalled, 2, "closes failed");
      assert.strictEqual(hourCalled, 14, "hours failed");
      assert.strictEqual(daysCalled, 2, "days failed");
      assert.strictEqual(_15sCalled, 52 /*6.5 * 2 * 4*/, "15 minutes failed");
    });
    it("runs the time events the proper number of times for stocks w/ DST", () => {
      let openCalled = 0,
        closeCalled = 0,
        hourCalled = 0,
        daysCalled = 0,
        _15sCalled = 0;
      //one test to same time as this test takes 250ms on my machiene
      pulse.on("h1", (price, time) => {
        hourCalled++;
        assert.notStrictEqual(time.getMinutes(), 0, time.toISOString());
      });
      pulse.on("open", (price, time) => {
        openCalled++;
        assert.strictEqual(time.getUTCHours(), 13);
        assert.strictEqual(time.getMinutes(), 30);
      });
      pulse.on("d-utc", (price, time) => {
        daysCalled++;
        let t = new Date(time.toISOString());
        assert.strictEqual(t.getUTCHours(), 13);
        assert.strictEqual(t.getMinutes(), 30);
      });
      pulse.on("close", (price, time) => {
        closeCalled++;
        let t = new Date(time);
        assert.strictEqual(t.getUTCHours(), 19);
        assert.strictEqual(t.getMinutes(), 59);
      });
      pulse.on("m15", (price, time) => {
        _15sCalled++;
        let t = new Date(time);
      });
      sim.websocketClient.on("message", (message) => {
        if (message.price) {
          let msg = {
            T: "t",
            price: message.price,
            Timestamp: new Date(message.time).getTime(),
          };
          pulse.analyze(msg);
        }
      });
      sim.backtest(require("./TwoDaysWithDst.json"));

      assert.strictEqual(openCalled, 2, "opens failed");
      assert.strictEqual(closeCalled, 2, "closes failed");
      assert.strictEqual(hourCalled, 14, "hours failed");
      assert.strictEqual(daysCalled, 2, "days failed");
      assert.strictEqual(_15sCalled, 52 /*6.5 * 2 * 4*/, "15 minutes failed");
    });
  });

  describe("#Options and Settings", () => {
    it("allows the user to configure the open hour and minute", () => {
      let p = new GdaxPulse({
        open: {
          hour: 9,
          minutes: 30,
        },
      });
      assert.strictEqual(p.open.hour, 9);
      assert.strictEqual(p.open.minutes, 30);
    });
    it("allows the user to configure the close hour and minute", () => {
      let p = new GdaxPulse({
        close: {
          hour: 9,
          minutes: 30,
        },
      });
      assert.strictEqual(p.close.hour, 9);
      assert.strictEqual(p.close.minutes, 30);
    });
    it("allows the user to configure the exchange", () => {
      let p = new GdaxPulse({
        exchange: "ccxws",
      });
      assert.strictEqual(p.exchange, "ccxws");
    });
    it("allows the user to configure the delay", () => {
      let p = new GdaxPulse({
        delay: 15,
      });
      assert.strictEqual(p.delay, 15);
    });
    it("allows the user to configure the delay the old way but keep options", () => {
      let p = new GdaxPulse(10, {
        close: {
          hour: 9,
          minutes: 30,
        },
      });
      assert.strictEqual(p.delay, 10);
      assert.strictEqual(p.close.hour, 9);
      assert.strictEqual(p.close.minutes, 30);
      assert.strictEqual(p.exchange, "gdax");
    });
    it("allows the user to configure the delay and exchange the old way but keep options", () => {
      let p = new GdaxPulse(10, "ccxws", {
        close: {
          hour: 9,
          minutes: 30,
        },
      });
      assert.strictEqual(p.delay, 10);
      assert.strictEqual(p.close.hour, 9);
      assert.strictEqual(p.close.minutes, 30);
      assert.strictEqual(p.exchange, "ccxws");
    });
    it("default close for alpaca close time is 1559", () => {
      let p = new GdaxPulse(10, "alpaca");
      assert.strictEqual(p.close.hour, 15);
      assert.strictEqual(p.close.minutes, 59);
    });
    it("default open for alpaca close time is 0930", () => {
      let p = new GdaxPulse(10, "alpaca");
      assert.strictEqual(p.open.hour, 9);
      assert.strictEqual(p.open.minutes, 30);
    });
    it("minutes above 59 for open and close goto 59", () => {
      let p = new GdaxPulse(10, "alpaca", {
        open: { minutes: 60 },
        close: { minutes: 60 },
      });
      assert.strictEqual(p.close.minutes, 59);
      assert.strictEqual(p.open.minutes, 59);
    });
    it("minutes below 0 for open and close goto 0", () => {
      let p = new GdaxPulse(10, "gdax", {
        open: { minutes: -1 },
        close: { minutes: -1 },
      });
      assert.strictEqual(p.close.minutes, 0);
      assert.strictEqual(p.open.minutes, 0);
    });
    it("hour above 23 for open and close goto 23", () => {
      let p = new GdaxPulse(10, "gdax", {
        open: { hour: 24 },
        close: { hour: 24 },
      });
      assert.strictEqual(p.close.hour, 23);
      assert.strictEqual(p.open.hour, 23);
    });
    it("minutes below 0 for open and close goto 0", () => {
      let p = new GdaxPulse(10, "gdax", {
        open: { hour: -1 },
        close: { hour: -1 },
      });
      assert.strictEqual(p.close.hour, 0);
      assert.strictEqual(p.open.hour, 0);
    });
    it("hour below 9 for open and close goto 9", () => {
      let p = new GdaxPulse(10, "alpaca", {
        open: { hour: 8 },
        close: { hour: 8 },
      });
      assert.strictEqual(p.close.hour, 9);
      assert.strictEqual(p.open.hour, 9);
    });
  });
});
