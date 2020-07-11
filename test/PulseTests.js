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
        assert.equal(pulse.currentData.price, sim.currentPrice);
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
      assert.equal(actual, target);
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
        dayCounter = 2, //could get messed up based on local time
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
      assert.equal(minCounter, 0);
      assert.equal(fiveMinCounter, 0);
      assert.equal(fifteenMinCounter, 0);
      assert.equal(hourCounter, 0);
      assert.equal(dayCounter, 0); //could get messed up based on local time
      assert.equal(utcDayCounter, 0);
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
      assert.equal(match_counter, 0);
    });
  });

  describe("#All Events", () => {
    let sim = new GdaxSim();
    let pulse = new GdaxPulse();
    it("event functions are fed the current pulse data as parameters", () => {
      function test(price, time) {
        assert.equal(price, pulse.currentData.price);
        assert.equal(time.getTime(), pulse.currentData.time.getTime());
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
    let pulse = new GdaxPulse(0, "alpacha");

    it("runs the events the proper number of time", () => {
      let openCalled = 0,
        clsoeCalled = 0,
        hourCalled = 0,
        daysCalled = 0,
        _15sCalled = 0;
      //one test to same time as this test takes 250ms on my machiene
      pulse.on("h1", (price, time) => {
        hourCalled++;
        assert.notEqual(time.getMinutes(), 0, time.toISOString());
      });
      pulse.on("open", (price, time) => {
        openCalled++;
        let t = new Date(time.toISOString());
        assert.equal(t.getHours(), 9);
        assert.equal(t.getMinutes(), 30);
      });
      pulse.on("d-utc", (price, time) => {
        daysCalled++;
        let t = new Date(time.toISOString());
        assert.equal(t.getHours(), 9);
        assert.equal(t.getMinutes(), 30);
      });
      pulse.on("close", (price, time) => {
        clsoeCalled++;
        let t = new Date(time);
        assert.equal(t.getMinutes(), 59);
        assert.equal(t.getHours(), 15);
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

      assert.equal(openCalled, 2, "opens failed");
      assert.equal(clsoeCalled, 2, "closes failed");
      assert.equal(hourCalled, 14, "hours failed");
      assert.equal(daysCalled, 2, "days failed");
      assert.equal(_15sCalled, 14 * 4 - 2, "days failed");
    });
  });
});
