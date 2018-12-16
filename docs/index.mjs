console.log('hello there world');

var HOST = location.origin.replace(/^https/, 'wss');
var ws = new WebSocket(HOST);

ws.onmessage = function (event) {
  console.log('received' + event);
};