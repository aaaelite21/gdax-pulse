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
    it("runs the events the proper number of time", () => {
      //one test to same time as this test takes 250ms on my machiene
      let totalMinutes = 60 * 48; //60 mins per hr * 48hr per two days
      let minCounter = totalMinutes,
        fiveMinCounter = totalMinutes / 5,
        fifteenMinCounter = totalMinutes / 15,
        hourCounter = totalMinutes / 60,
        dayCounter = 1, //could get messed up based on local time
        utcDayCounter = 2;
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
    it("runs the events the proper number of time", () => {
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

    it("runs the events the proper number of time", () => {
      let openCalled = 0,
        clsoeCalled = 0,
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
        let t = new Date(time.toISOString());
        assert.strictEqual(t.getHours(), 9);
        assert.strictEqual(t.getMinutes(), 30);
      });
      pulse.on("d-utc", (price, time) => {
        daysCalled++;
        let t = new Date(time.toISOString());
        assert.strictEqual(t.getHours(), 9);
        assert.strictEqual(t.getMinutes(), 30);
      });
      pulse.on("close", (price, time) => {
        clsoeCalled++;
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
            ev: "T",
            price: message.price,
            timestamp: new Date(message.time).getTime() * 1000000,
          };
          pulse.analyze(msg);
        }
      });
      sim.backtest(TwoDays);

      assert.strictEqual(openCalled, 2, "opens failed");
      assert.strictEqual(clsoeCalled, 2, "closes failed");
      assert.strictEqual(hourCalled, 14, "hours failed");
      assert.strictEqual(daysCalled, 2, "days failed");
      assert.strictEqual(_15sCalled, 52 /*6.5 * 2 * 4*/, "days failed");
    });
  });
});
