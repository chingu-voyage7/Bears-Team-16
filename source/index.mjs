console.log('index.mjs starting');

let HOST = location.origin.replace(/^http/, 'ws');
let ws = new WebSocket(HOST);

let frame = undefined;

ws.addEventListener('message', (event) => {
  console.log('Server said: ', event.data);
  frame = event.data.frame;
});

ws.addEventListener('open', (event) => {
  ws.send('Hello Server!');
});

let menu = document.getElementById('menu');
let tabs = [...document.getElementsByClassName('tab')];
// let tabs2 = tabs.filter(item => item !== menu);
let pages = [...document.getElementsByClassName('pages')];
let picks = [...document.getElementsByClassName('pick')];

menu.addEventListener('click', () => {
  tabs.forEach((tab) => {
    tab.classList.remove('hide');
  });
  menu.classList.add('hide');
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    let tabName = tab.attributes['name'].value;
    pages.forEach((page) => {
      let pageName = page.attributes['name'].value;
      if (pageName === tabName) {
        pages.classList.remove('hide');
      } else {
        pages.classList.add('hide');
      }
    });
    console.log('clicked', tabName, tab);
  });
});

picks.forEach((pick) => {
  pick.addEventListener('click', () => {
    const data = {
      frame: frame,
      pick: pick.id,
    };
    ws.send(JSON.stringify(data));
  });
});