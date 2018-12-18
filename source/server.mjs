import path from 'path';
import express from 'express';
import handleWS from 'express-ws';

console.log('server.mjs starting');

const PORT = process.env.PORT || 80;
const noop = ()=>{};

const app = express();
const ewss = handleWS(app);
app.use('/', express.static(path.join(path.resolve(), 'source'), {'index': ['index.html', 'index.htm']}));

app.ws('/', function(ws, req) {
  console.log('Client connected');
  ws.on('message', function(raw) {
    try {
      let msg = JSON.parse(raw);
      console.log('Client said: ', msg);
    } catch (error) {
      console.error(`Client said wrongly: ${raw}`);
    }
  });
  ws.on('close', () => console.log('Client disconnected'));
  ws.send('Welcome client');
});
const wss = ewss.getWss('/');

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(PORT, () => console.log(`Webpage on http://localhost or https://bears-team-16.herokuapp.com`));

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    };
  });
};

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);

setInterval(noop, 60000); // heartbeat: This keeps the fork from closing.