const GdaxPulse = require('../gdax-pulse');
const assert = require('assert');
const GdaxSim = require('gdax-sim');
const TwoDays = require('./TwoDays.json');
describe("#Gdax-Pulse", () => {
    let sim = new GdaxSim();
    describe("#Time Events", () => {
        let pulse = new GdaxPulse();
        it('runs the minutly event on every new minute', () => {
            let counter = TwoDays.length;
            pulse.on('m1', () => {
                counter--;
            });
            sim.websocketClient.on('message', (message) => {
                pulse.analyze(message);
            })
            sim.backtest(TwoDays);
            assert.equal(counter, 0)
        });
        it('runs the 5 minute event on every new 5 minute bucket', () => {
            let counter = 12 * 24 * 2;
            pulse.on('m5', () => {
                counter--;
            });
            sim.websocketClient.on('message', (message) => {
                pulse.analyze(message);
            })
            sim.backtest(TwoDays);
            console.log(TwoDays.length)
            assert.equal(counter, 0)
        });

    })

});