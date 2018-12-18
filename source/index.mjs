console.log('index.mjs starting');

let HOST = location.origin.replace(/^http/, 'ws');
let ws = new WebSocket(HOST);

let frame = -1;

const generateLocation = (msg) => {
  // TODO
};

ws.addEventListener('message', (event) => {
  try {
    let msg = JSON.parse(event.data);
    console.log('Server said: ', msg);
    if (frame >= msg.frame) {
      throw 'Invalid update from server';
      return;
    };
    frame = msg.frame;
    generateLocation(msg);
  } catch (error) {
    console.error('Client said wrongly: ', error);
  };
});

ws.addEventListener('open', (event) => {
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
      let tabName = tab.attributes['name'].value;
      tabs.forEach((iTab) => {
        if (iTab === tab) {
          iTab.classList.add('expanded');
        } else {
          iTab.classList.remove('expanded');
        };
      });
      pages.forEach((page) => {
        let pageName = page.attributes['name'].value;
        if (pageName === tabName) {
          page.classList.add('expanded');
        } else {
          page.classList.remove('expanded');
        }
      });
    });
  };
});

picks.forEach((pick) => {
  pick.addEventListener('click', () => {
    const data = {
      frame: frame,
      pick: pick.id,
    };
    const data2 = JSON.stringify(data);
    console.log(data2);
    ws.send(data2);
  });
});