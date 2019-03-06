const GdaxPulse = require('../gdax-pulse');
const assert = require('assert');
const GdaxSim = require('gdax-sim');
const TwoDays = require('./TwoDays.json');
describe("#Gdax-Pulse", () => {
    describe("#Updateing CurrentData", () => {
        let sim = new GdaxSim();
        it('updates the price on every match', () => {
            let pulse = new GdaxPulse();
            sim.websocketClient.on('message', (message) => {
                pulse.analyze(message);
                assert.equal(pulse.currentData.price, sim.currentPrice);
            });
            sim.backtest([TwoDays[0]]);
        });
        it('updates the time to within a minute', () => {
            let pulse = new GdaxPulse();
            sim.websocketClient.on('message', (message) => {
                pulse.analyze(message);
            });
            sim.backtest([TwoDays[0]]);

            let target = (new Date(TwoDays[0].time).getTime());
            let actual = (new Date(pulse.currentData.time).getTime())
            assert.equal(actual, target);
        });
    });

    describe("#Time Events", () => {
        let sim = new GdaxSim();
        let pulse = new GdaxPulse();
        it('runs the events the proper number of time', () => {
            //one test to same time as this test takes 250ms on my machiene
            let totalMinutes = 60 * 48; //60 mins per hr * 48hr per two days
            let minCounter = totalMinutes,
                fiveMinCounter = totalMinutes / 5,
                fifteenMinCounter = totalMinutes / 15,
                hourCounter = totalMinutes / 60,
                dayCounter = 2, //could get messed up based on local time
                utcDayCounter = 3;
            pulse.on('m1', () => {
                minCounter--;
            });
            pulse.on('m5', () => {
                fiveMinCounter--;
            });
            pulse.on('m15', () => {
                fifteenMinCounter--;
            });
            pulse.on('h1', () => {
                hourCounter--;
            });
            pulse.on('d', () => {
                dayCounter--;
            });
            pulse.on('d-utc', () => {
                utcDayCounter--;
            });
            sim.websocketClient.on('message', (message) => {
                pulse.analyze(message);
            });
            sim.backtest(TwoDays);
            assert.equal(minCounter, 0)
            assert.equal(fiveMinCounter, 0)
            assert.equal(fifteenMinCounter, 0)
            assert.equal(hourCounter, 0)
            assert.equal(dayCounter, 0); //could get messed up based on local time
            assert.equal(utcDayCounter, 0);
        });
    });
    describe("#All Events", () => {
        let sim = new GdaxSim();
        let pulse = new GdaxPulse();
        it('event functions are fed the current pulse data as parameters', () => {
            function test(price, time) {
                assert.equal(price, pulse.currentData.price);
                assert.equal(time.getTime(), pulse.currentData.time.getTime());
            }
            pulse.on('m1', (price, time) => {
                test(price, time);
            });
            pulse.on('m5', (price, time) => {
                test(price, time);
            });
            pulse.on('m15', (price, time) => {
                test(price, time);
            });
            pulse.on('h1', (price, time) => {
                test(price, time);
            });
            pulse.on('d', (price, time) => {
                test(price, time);
            });
            pulse.on('d-utc', (price, time) => {
                test(price, time);
            });
            sim.websocketClient.on('message', (message) => {
                pulse.analyze(message);
            });
            sim.backtest(TwoDays);
        });
    })

});