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
const GdaxPulse = require('gdax-pulse').Pulse;

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

## Using Other Exchanges

- For Binance use [node-binance-api](https://github.com/jaggedsoft/node-binance-api)

```
const binance = require('node-binance-api')().options({});
const GdaxPulse = require('gdax-pulse').Pulse;

let pulse = new GdaxPulse(0, 'binance');

pulse.on('m1', (price, time) => {
    console.log('now');
});

binance.websockets.trades(['BTCUSDC'], (message) => {
     pulse.analyze(data);
});
```

- For intergration with other exchanges use [ccxws](https://github.com/altangent/ccxws)

```
const ccxws = require("ccxws");
const hitbtcExchange = new ccxws.hitbtc();
const GdaxPulse = require('../gdax-pulse').Pulse;

let pulse = new GdaxPulse(0, 'ccxws');

pulse.on('m1', (price, time) => {
   console.log('now');
});

const market = {
   id: "ETHBTC",
   base: "ETH",
   quote: "BTC",
};

hitbtcExchange.on("ticker", (tick) => {
   pulse.analyze(tick);
});

hitbtcExchange.subscribeTicker(market);
```

- Please refer to [ccxws](https://github.com/altangent/ccxws) ReadMe for further instruction.
- Also note some exchanges (Kraken in praticular) use a different notation.

## Convert To Exchagne Time Endpoint
This is intended to help convert UTC time to the local time of the exchange.
```
    const {Nyc} = require('../gdax-pulse').ConvertToExchangeTimes;
    let time = new Date("4/16/2021 013:30 utc");
    let conversion = Nyc(time);
    //{
    //    day: 16,
    //   hour: 9,
    //    minute: 30,
    //    month: 4,
    //    year: 2021
    //};
```

## Visit Our The Dev Blog

- [DownToCrypto.com](https://downtocrypto.com)
