import path from 'path';
import express from 'express';
import handleWS from 'express-ws';

console.log('server.mjs starting');

const PORT = process.env.PORT || 80;
const noop = ()=>{};
noop.toJSON = noop; // Required to prevent sending to client

const app = express();
const ewss = handleWS(app);
app.use('/', express.static(path.join(path.resolve(), 'source'), {'index': ['index.html', 'index.htm']}));

app.ws('/', function(ws, req) {
  const user = ws.user = ws; // will not be same object once login is working
  user.ws = ws;
  ws.on('message', function(data) {
    let msg = {};
    try {
      msg = JSON.parse(data);
    } catch (error) {
      console.error('Ignoring invalid JSON from client: ', data, error);
      return;
    };
    // console.log('Client said: ', msg);
    if (typeof msg.update === 'boolean' && msg.update === true) { // server ignores all other msg data if update is true
      sendUpdate(user);
      return;
    };
    if (typeof msg.frame !== 'number' || isNaN(msg.frame) || user.frame !== msg.frame) {
      console.error('Ignoring invalid frame from client: ', data);
      sendUpdate(user);
      return;
    };
    if (typeof msg.page !== 'string' || typeof user.pages[msg.page] !== 'object') {
      console.error('Ignoring invalid page from client: ', data);
      sendUpdate(user);
      return;
    };
    if (typeof msg.pick !== 'string' || typeof user.pages[msg.page].picks[msg.pick] !== 'object') {
      console.error('Ignoring invalid pick from client: ', data);
      sendUpdate(user);
      return;
    };
    if (typeof user.pages[msg.page].picks[msg.pick].callback === 'function') {
      user.pages[msg.page].picks[msg.pick].callback(user, msg.page, msg.pick);
    };
    generateMockLocation(user);
  });
  ws.on('close', () => console.log('Client disconnected'));
  // mock login
  user.frame = 0;
  user.pages = {};
  user.pages.location = { picks: {} };
  generateMockLocation(user);
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

const sendUpdate = (user) => {
  user.ws.send(JSON.stringify({ frame: user.frame, pages: user.pages }));
};

const sendUpdateAll = function sendUpdateAll() {
  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      sendUpdate(ws.user);
    };
  });
};

//////////
// MOCK //
//////////
const generateMockPick = (user) => {
  const callback = (user, page, pick) => {
    console.log('Callback: Client picked ' + page + '/' + pick);
  };
  callback.toJSON = noop; // Required to prevent sending to client
  let text = Math.random(36).toString(36);
  let lines = Math.floor(Math.random() * 3) + 1;
  for (let i = 1; i < lines; i++) {
    text += '<br>' + Math.random(36).toString(36);
  };
  return {
    text: text,
    callback: callback,
  };
};
const generateMockLocation = (user) => {
  user.frame += 1;
  delete user.pages.location.picks;
  user.pages.location.picks = {};
  user.pages.location.picks[0] = generateMockPick();
  user.pages.location.picks[1] = generateMockPick();
  let boxes = Math.floor(Math.random() * 6) + 1;
  for (let i = 2; i < boxes; i++) {
    user.pages.location.picks[i] = generateMockPick();
  };
  sendUpdate(user);
};

setInterval(() => {
  wss.clients.forEach((user) => {
    // user.send(generateMockLocation(user));
  });
}, 2000);

setInterval(noop, 60000); // heartbeat: This keeps the fork from closing.