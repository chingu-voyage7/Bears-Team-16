console.log('index.mjs starting');

let HOST = location.origin.replace(/^http/, 'ws');
let ws = new WebSocket(HOST);

ws.addEventListener('message', function (event) {
  console.log(`Server said: ${event.data}`);
});

ws.addEventListener('open', function (event) {
  ws.send('Hello Server!');
});
