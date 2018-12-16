import path from 'path';
import express from 'express';
import uws from 'uws';

const PORT = process.env.PORT || 443;

let app = express();
app.use('/', express.static(path.join(path.resolve(), 'docs'), {'index': ['index.html', 'index.htm']}));
app.listen(PORT, () => console.log(`Webpage on https://localhost:${ PORT }`));

const wss = new uws.Server({ app });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    };
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  ws.send('something');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);

setInterval(noop, 60000); // heartbeat: This keeps the fork from closing.