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
  ws.on('message', function(raw) {
    try {
      console.log('Client said: ', raw);
      let msg = JSON.parse(raw);
      console.log('Client said: ', msg);
      if (ws.frame !== msg.frame) {
        throw 'Invalid frame from server', raw;
        return;
      };
      if (ws.picks.includes(msg.pick)) {
        throw 'Invalid pick from server', raw;
        return;
      };
      console.log('Client picked: ', msg.pick);
    } catch (error) {
      console.error('Client error: ', error);
    }
  });
  ws.on('close', () => console.log('Client disconnected'));
  ws.send('Welcome client');
  ws.frame = 0;
  ws.picks = [];
});
const wss = ewss.getWss('/');

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(PORT, () => console.log('Webpage on http://localhost or https://bears-team-16.herokuapp.com'));

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    };
  });
};

//////////
// MOCK //
//////////

const generateLocation = (user) => {
  user.frame += 1;
  const data = {};
  data.frame = user.frame;
  user.picks = [
    '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
    Math.random(16).toString(36),
    Math.random(16).toString(36),
    Math.random(16).toString(36),
    Math.random(16).toString(36),
    Math.random(16).toString(36),
  ];
  data.picks = user.picks;
  return JSON.stringify(data);
};

setInterval(() => {
  wss.clients.forEach((user) => {
    user.send(generateLocation(user));
  });
}, 2000);

setInterval(noop, 60000); // heartbeat: This keeps the fork from closing.