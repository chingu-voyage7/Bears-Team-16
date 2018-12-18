console.log('index.mjs starting');

let HOST = location.origin.replace(/^http/, 'ws');
let ws = new WebSocket(HOST);

let frame = -1;

ws.addEventListener('message', (event) => {
  let data = event.data;
  let msg = {};
  try {
    msg = JSON.parse(event.data);
  } catch (error) {
    console.error('Ignoring invalid JSON from server: ', data, error);
    return;
  };
  // console.log('Server said: ', msg);
  if (typeof msg.frame !== 'number' || isNaN(msg.frame) || msg.frame < frame) {
    console.error('Client has invalid frame, rebooting: ', data);
    window.location.reload(false);
    return;
  };
  if (typeof msg.pages !== 'object') {
    console.error('Ignoring invalid pages from server: ', data, error);
    // requestUpdate();
    return;
  };
  frame = msg.frame;
  for (let pageLabel in msg.pages) {
    renderPageData(pageLabel, msg.pages[pageLabel]);
  };
});

ws.addEventListener('open', (event) => {
  // TODO login
  // ws.send('Hello Server!');
});

let menu = document.getElementById('menu');
let collapse = document.getElementById('collapse');
let tabs = [...document.getElementsByClassName('tab')];
// let tabs2 = tabs.filter(item => item !== menu);
let pages = [...document.getElementsByClassName('page')];
let picks = [...document.getElementsByClassName('pick')];

window.addEventListener('resize', () => {
  menu.classList.remove('expanded');
});

menu.addEventListener('click', () => {
  menu.classList.add('expanded');
});

collapse.addEventListener('click', () => {
  menu.classList.remove('expanded');
});

tabs.forEach((tab) => {
  if (tab !== menu) {
    tab.addEventListener('click', () => {
      let tabLabel = tab.attributes['name'].value;
      tabs.forEach((iTab) => {
        if (iTab === tab) {
          iTab.classList.add('expanded');
        } else {
          iTab.classList.remove('expanded');
        };
      });
      pages.forEach((page) => {
        let pageLabel = page.attributes['name'].value;
        if (pageLabel === tabLabel) {
          page.classList.add('expanded');
        } else {
          page.classList.remove('expanded');
        }
      });
    });
  };
});

const setupPick = (pick) => {
  pick.addEventListener('click', () => {
    const data = {
      frame: frame,
      page: pick.parentNode.attributes['name'].value,
      pick: pick.id,
    };
    console.log('Sending to server: ', data);
    ws.send(JSON.stringify(data));
  });
};

picks.forEach((pick) => {
  setupPick(pick);
});

const requestUpdate = () => { // server ignores all other msg data if update is true
  ws.send(JSON.stringify({ update: frame }));
};

const renderPageData = (pageLabel, pageData) => {
  if (typeof pageData.picks !== 'object') {
    console.error('Ignoring invalid page from server: ', { pageLabel: pageData });
    return;
  };
  // getting page DOM object
  let page = undefined;
  for (let iPage in pages) {
    let iPageLabel = pages[iPage].attributes['name'].value;
    if (iPageLabel === pageLabel) {
      page = pages[iPage];
      break; // short circuit and exit entire for loop without looping over any more pages;
    };
  };
  if (typeof page !== 'object') {
    console.error('Ignoring pageLabel from server with no found page DOM object: ', { pageLabel: pageData });
    return;
  };
  // done getting page DOM object
  
  let i = picks.length; // while loop decreases this by 1;
  while (i--) { // required for loop to not break when deleting or appending items to array
    const pick = picks[i];
    // skip picks from other pages;
    if (pageLabel !== pick.parentNode.attributes['name'].value) { continue; } // short circuit but continue while loop with next i
    const pickLabel = pick.id;
    // removing missing picks from page DOM object
    if (typeof pageData.picks[pickLabel] !== 'object') {
      picks.splice(i, 1); // modifies picks array in place
      page.removeChild(pick);
      continue; // short circuit but continue while loop with next i
    };
    // updating changed picks from page DOM object
    const pickData = pageData.picks[pickLabel];
    if (typeof pickData.text === 'undefined') { pickData.text = '*'; };
    pick.innerHTML = pickData.text;
  };
  // adding new picks to page DOM object
  for (let pickLabel in pageData.picks) {
    // skip picks with an existing pick DOM object;
    let found = false;
    for (let iPick in picks) {
      let iPickLabel = picks[iPick].id;
      if (iPickLabel === pickLabel) {
        found = true;
        break; // short circuit and exit entire inner for loop without looping over any more iPicks;
      };
    };
    if (found) {
      continue; // short circuit but continue outer while loop with next pickLabel
    };
    
    const pickData = pageData.picks[pickLabel];
    if (typeof pickData.text === 'undefined') { pickData.text = '*'; };
    const pick = document.createElement('div');
    pick.id = pickLabel;
    pick.className = 'pick';
    pick.innerHTML = pickData.text;
    setupPick(pick);
    page.appendChild(pick);
    picks.push(pick);
  };
};