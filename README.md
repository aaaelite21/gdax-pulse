# gdax-pulse

Takes in messages from the gdax (coinbase-pro) web-socket and monitors for specific events.

## Disclaimer

This module is designed with the intent of doing research. You and only you are solely responsible for the actions you and the code that you write with this module make. Please be responsible.

## Install

```
npm i gdax-pulse
```

## Example

```
const Gdax = require('gdax');
const GdaxPulse = require('gdax-pulse');

let pulse = new GdaxPulse();

pulse.on('m1', (price, time) => {
    console.log('do this every minute');
});

pulse.on('new-price', (price, time) => {
    console.log('current price:', price);
});

const websocket = new Gdax.WebsocketClient('BTC-USD');
websocket.on("message", data => {
    pulse.analyze(data);
});
```
## Event List
 - minute: 'm1'
 - 5 minutes: 'm5'
 - 15 minutes: 'm15'
 - hour: 'h1'
 - 6 hours: 'h6'
 - local day: 'd'
 - utc day: 'd-utc'
 - new price traded: 'new-price'

## Delay
A delay was introduced to help better manage exchange api compliance. Coinbase Pro specifically axes out at 4 calls per second. If you call get historic rates on more then 4 assets every hour then you will max out and stop receiving information.
### Example Demonstrating Delay
```
const Gdax = require('gdax');
const GdaxPulse = require('gdax-pulse');

let pulse = new GdaxPulse();
let delayedPulse = new GdaxPulse(10);

pulse.on('m1', (price, time) => {
    console.log('now');
});

delayedPulse.on('m1', (price, time) => {
    console.log('10 seconds from now');
});

const websocket = new Gdax.WebsocketClient('BTC-USD');
websocket.on("message", data => {
    pulse.analyze(data);
    delayedPulse.analyze(data);
});
```
## Coming Soon
- Binance Support

## Visit Our The Dev Blog
 - [DownToCrypto.com](https://downtocrypto.com)
