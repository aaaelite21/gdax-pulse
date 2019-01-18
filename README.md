#gdax-pulse

Takes in messages from the gdax (coinbase-pro) web-socket and monitors for specific events.

##Install

```
npm i gdax-pulse
```

##Example

```
const Gdax = require('gdax');
const GdaxPulse = require('gdax-pulse');

 let pulse = new GdaxPulse();

pulse.on('d-utc', () => {
  console.log('do this every new utc day');
});

const websocket = new Gdax.WebsocketClient('BTC-USD');
websocket.on("message", data => {
  pulse.analyze(data);
});

```

##Disclaimer

This module is designed with the intent of doing research. You and only you are solely responsible for the actions you and the code that you write with this module make. Please be responsible.

##Coming Soon

- Price action events
  - onPrice('above', x, callback);
  - onPrice('below, y, callback);
