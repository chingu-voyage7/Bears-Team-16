import path from 'path';
import express from 'express';
import handleWS from 'express-ws';

console.log('server.mjs starting');

const PORT = process.env.PORT || 8080;
const noop = ()=>{};
noop.toJSON = noop; // Required to prevent sending to client

const app = express();
const ewss = handleWS(app);
app.use('/', express.static(path.join(path.resolve(), 'source'), {'index': ['index.html', 'index.htm']}));

const Page = function () {
  return { infos: [], picks: [], items: [], chars: [] };
};

app.ws('/', function(ws, req) {
  const user = ws.user = ws; // will not be same object once login is working
  user.ws = ws;
  ws.on('message', function(data) {
    // console.log('Received from client: ', data);
    let msg = {};
    try {
      msg = JSON.parse(data);
    } catch (error) {
      console.error('Ignoring invalid JSON from client: ', data, error);
      return;
    };

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
    
    // find pick
    let pick = undefined;
    user.pages[msg.page].picks.forEach((iPick) => {
      if (iPick.name === msg.pick) { pick = iPick; };
    });
    if (typeof msg.pick !== 'string' || typeof pick !== 'object') {
      console.error('Ignoring invalid pick from client: ', data);
      sendUpdate(user);
      return;
    };
    if (typeof pick.callback === 'function') {
      pick.callback(user, msg.page, msg.pick);
    };
    generateMockPageInteract(user);
  });
  ws.on('close', () => console.log('Client disconnected'));
  // mock login
  user.frame = 0;
  user.pages = {};
  generateMockPageCharacter(user);
  generateMockPageInteract(user);
  generateMockPageTravel(user);
  generateMockPageVideos(user);
  generateMockPageAccount(user);
  generateTabs(user);
});
const wss = ewss.getWss('/');

app.use(function (req, res, next) {
  res.status(404).send('Sorry can\'t find that!');
});
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log('Webpage on http://localhost or https://bears-team-16.herokuapp.com'));

const sendUpdate = (user) => {
  user.ws.send(JSON.stringify({ frame: user.frame, pages: user.pages, tabs: user.tabs }));
};

const sendUpdateAll = function sendUpdateAll() {
  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      sendUpdate(ws.user);
    };
  });
};

const exactlyOneOfProperties = (object, properties) => {
  let count = 0;
  for (let property of properties) {
    if (object[property]) { count++; };
  };
  return count === 1;
};

//////////
// MOCK //
//////////
const createUi = (user, page, data) => {
  if (!data || !exactlyOneOfProperties(data, ['pick', 'item', 'char', 'info', 'tab']) || (typeof data.info === 'undefined' && typeof data.link !== 'undefined')) {
    console.error('Ignore creating invalid ui: ', page, data);
    return;
  };
  if (data.callback) {
    data.callback.toJSON = noop; // Required to prevent sending to client
  };
  if (data.pick) {
    user.pages[page].picks.push(data);
  } else if (data.item) {
    user.pages[page].items.push(data);
  } else if (data.char) {
    user.pages[page].chars.push(data);
  } else if (data.info) {
    user.pages[page].infos.push(data);
  } else if (data.tab) {
    user.tabs.push(data);
  };
};
const generateTabs = (user) => {
  user.frame += 1;
  user.tabs = []; // overwrite previous tabs
  createUi(user, undefined, {
    // name: '',
    tab: 'Menu',
    icon: 'fas fa-bars fa-lg',
    expander: true,
  });
  createUi(user, undefined, {
    name: 'character',
    tab: 'Character',
    icon: 'far fa-address-card fa-lg',
    expanded: true,
  });
  createUi(user, undefined, {
    name: 'stuff',
    tab: 'Stuff',
    icon: 'fas fa-briefcase fa-lg',
  });
  createUi(user, undefined, {
    name: 'interact',
    tab: 'Interact',
    icon: 'fas fa-street-view fa-lg',
  });
  createUi(user, undefined, {
    name: 'travel',
    tab: 'Travel',
    icon: 'fas fa-map-marked-alt fa-lg',
  });
  // createUi(user, undefined, {
    // name: 'travel',
    // tab: 'Travel',
    // icon: 'fas fa-qrcode fa-lg',
  // });
  createUi(user, undefined, {
    name: 'videos',
    tab: 'Videos',
    icon: 'fas fa-film fa-lg',
  });
  createUi(user, undefined, {
    name: 'account',
    tab: 'Account',
    icon: 'fas fa-sliders-h fa-lg',
  });
  // createUi(user, undefined, {
    // name: 'account',
    // tab: 'Account',
    // icon: 'fas fa-cog fa-lg',
  // });
  // createUi(user, undefined, {
    // name: 'account',
    // tab: 'Account',
    // icon: 'far fa-sun fa-lg',
  // });
  sendUpdate(user);
};

const generateMockPick = (user) => {
  let text = Math.random(36).toString(36);
  let lines = Math.floor(Math.random() * 3) + 1;
  for (let i = 1; i < lines; i++) {
    text += '\n' + Math.random(36).toString(36);
  };
  return {
    name: text,
    pick: text,
    callback: (user, page, pick) => {
      console.log('Callback: Client picked ' + page + '/' + pick);
    },
  };
};
const generateMockPageInteract = (user) => {
  user.frame += 1;
  const page = 'interact';
  user.pages[page] = new Page(); // overwrite previous page
  createUi(user, page, {
    info: 'You are in a dark room...',
  });
  createUi(user, page, generateMockPick());
  createUi(user, page, generateMockPick());
  let boxes = Math.floor(Math.random() * 6) + 1;
  for (let i = 2; i < boxes; i++) {
    createUi(user, page, generateMockPick());
  };
  sendUpdate(user);
};

const generateMockPageCharacter = (user) => {
  user.frame += 1;
  const page = 'character';
  user.pages[page] = new Page(); // overwrite previous page
  createUi(user, page, {
    info: 'Who are you?',
  });
  sendUpdate(user);
};

const generateMockPageTravel = (user) => {
  user.frame += 1;
  const page = 'travel';
  user.pages[page] = new Page(); // overwrite previous page
  createUi(user, page, {
    info: 'QR Code Reader',
  });
  sendUpdate(user);
};

const generateMockPageVideos = (user) => {
  user.frame += 1;
  const page = 'videos';
  user.pages[page] = new Page(); // overwrite previous page
  createUi(user, page, {
    info: 'Tutorial Video',
  });
  sendUpdate(user);
};

const generateMockPageAccount = (user) => {
  user.frame += 1;
  const page = 'account';
  user.pages[page] = new Page(); // overwrite previous page
  createUi(user, page, {
    info: `Mobile City Copyright © 2018 Michael Gibson
      
      This program is free software: you can redistribute it and/or modify
      it under the terms of the GNU Affero General Public License as
      published by the Free Software Foundation, either version 3 of the
      License, or (at your option) any later version.
      
      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU Affero General Public License for more details.
      
      You should have received a copy of the GNU Affero General Public License
      along with this program.  If not, see `,
      link: 'https://www.gnu.org/licenses',
  });
  createUi(user, page, {
    info: 'Map data © OpenStreetMap contributors ',
    link: 'https://www.openstreetmap.org/copyright',
  });
  createUi(user, page, {
    info: 'Some images from Toptal Subtle Patterns ',
    link: 'https://www.toptal.com/designers/subtlepatterns',
  });  
  
  createUi(user, page, {
    name: 'Login',
    pick: 'Login',
    callback: (user, page, pick) => {
      console.log('Callback: Client picked ' + page + '/Login');
    },
  });
  createUi(user, page, {
    name: 'Recover',
    pick: 'Forgot Password',
    callback: (user, page, pick) => {
      console.log('Callback: Client picked ' + page + '/Forgot-Password');
    },
  });
  createUi(user, page, {
    name: 'Create',
    pick: 'Create Account',
    callback: (user, page, pick) => {
      console.log('Callback: Client picked ' + page + '/Create-Account');
    },
  });
  sendUpdate(user);
};

setInterval(() => {
  wss.clients.forEach((user) => {
    // user.send(generateMockPageInteract(user));
  });
}, 2000);

setInterval(noop, 6000); // heartbeat: This keeps the fork from closing.
