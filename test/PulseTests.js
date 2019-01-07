const GdaxPulse = require('../gdax-pulse');
const assert = require('assert');
const GdaxSim = require('gdax-sim');
const TwoDays = require('./TwoDays.json');
describe("#Gdax-Pulse", () => {
    let sim = new GdaxSim();
    describe("#Time Events", () => {
        let pulse = new GdaxPulse();
        it('runs the events the proper number of time', () => {
            //one test to same time as this test takes 250ms on my machiene
            let totalMinutes = 60 * 48; //60 mins per hr * 48hr per two days
            let minCounter = totalMinutes,
                fiveMinCounter = totalMinutes / 5,
                fifteenMinCounter = totalMinutes / 15,
                hourCounter = totalMinutes / 60,
                dayCounter = 2; //could get messed up based on local time
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
            sim.websocketClient.on('message', (message) => {
                pulse.analyze(message);
            })
            sim.backtest(TwoDays);
            assert.equal(minCounter, 0)
            assert.equal(fiveMinCounter, 0)
            assert.equal(fifteenMinCounter, 0)
            assert.equal(hourCounter, 0)
            assert.equal(dayCounter, 0); //could get messed up based on local time
        });
    })

});