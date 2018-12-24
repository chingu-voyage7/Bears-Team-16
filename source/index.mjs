console.log('index.mjs starting');

let HOST = location.origin.replace(/^http/, 'ws');
let ws = new WebSocket(HOST);

let frame = -1;
let pages = {};
let tabs = [];

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
    console.error('Ignoring invalid pages from server:', data, error);
    // requestUpdate();
    return;
  };
  frame = msg.frame;
  for (let pageName in msg.pages) {
    renderPage(pageName, msg.pages[pageName]);
  };
  if (msg.tabs) { renderTabs(msg.tabs); };
});

ws.addEventListener('open', (event) => {
  // TODO login
  // ws.send('Hello Server!');
});

let app = document.getElementById('app');
let header = document.getElementById('header');
let expander = document.getElementById('expander');
let collapse = document.getElementById('collapse');

collapse.addEventListener('click', () => {
  header.classList.remove('expanded');
});

window.addEventListener('resize', () => {
  header.classList.remove('expanded');
});

const toHtml = (dom, string) => {
  string = string || '';
  string.split('\n').forEach((line) => {
    const iDom = document.createElement('div');
    iDom.textContent = line;
    dom.appendChild(iDom);
  });
};

const renderData = (parentNode, data) => {
  if (typeof data.name !== 'string' && typeof data.info === 'undefined' && typeof data.tab === 'undefined') {
    console.error('Ignoring invalid ui from server:', parentNode.getAttribute('name'), ':', data);
    return;
  };
  let dom = undefined;
  if (typeof data.link === 'string') {
    dom = document.createElement('a');
    dom.setAttribute('href', data.link);
  } else {
    dom = document.createElement('div');
  };
  dom.setAttribute('name', data.name || '');
  dom.className = Object.keys(data).join(' ');
  toHtml(dom, data.pick || data.item || data.char || data.info || data.tab || '*') + ' ';
  parentNode.appendChild(dom);
  if (typeof data.link === 'string') {
    const link1 = document.createElement('a');
    link1.textContent = data.link;
    link1.setAttribute('href', data.link);
    dom.appendChild(link1);
  };
  if (typeof data.icon !== 'undefined') {
    const icon = document.createElement('i');
    icon.className = data.icon;
    dom.appendChild(icon);
  };
  if (typeof data.expander !== 'undefined') {
    dom.addEventListener('click', () => {
      parentNode.classList.add('expanded');
    });
  } else if (typeof data.pick !== 'undefined') {
    dom.addEventListener('click', () => {
      const page = parentNode.getAttribute('name');
      const temp = {
        frame: frame,
        page: page,
        pick: data.name,
      };
      // console.log('Sending to server: ', temp);
      ws.send(JSON.stringify(temp));
    });
  } else {
    dom.addEventListener('click', () => {
      [...parentNode.children].forEach((iDom) => { // with sibling dom elements
        if (iDom === dom) {
          iDom.classList.add('expanded');
        } else {
          iDom.classList.remove('expanded');
        };
      });
      if (typeof data.tab !== 'undefined') {
        parentNode.classList.remove('expanded');
        [...document.getElementsByClassName('page')].forEach((iDom) => {
          if (iDom.getAttribute('name') === dom.getAttribute('name')) {
            iDom.classList.add('expanded');
          } else {
            iDom.classList.remove('expanded');
          };
        });
      };
    });
  };
};

const requestUpdate = () => { // server ignores all other msg data if update is true
  ws.send(JSON.stringify({ update: frame }));
};

// const exactlyOneOfProperties = (object, properties) => {
  // let count = 0;
  // for (let property of properties) {
    // if (object[property]) { count++; };
  // };
  // return count === 1;
// };

const renderPage = (pageName, pageData) => {
  if (!Array.isArray(pageData.picks) || !Array.isArray(pageData.infos) || !Array.isArray(pageData.chars) || !Array.isArray(pageData.items)) {
    console.error('Ignoring invalid page from server:', pageName, ':', pageData);
    return;
  };
  // get page dom if exists
  let page = undefined;
  [...document.getElementsByClassName('page')].forEach((iDom) => {
    if (iDom.getAttribute('name') === pageName) { page = iDom; };
  });
  // create page dom if missing
  if (typeof page !== 'object') {
    page = document.createElement('div');
    page.setAttribute('name', pageName);
    page.className = 'page';
    app.appendChild(page);
  };
  // save expanded and focused elements into pageData.
  // page.children.forEach((iDom) => { // with sibling dom elements
    // if (typeof iDom.expanded !== 'undefined') {
      
    // };
  // });
  // delete old page data.
  pages[pageName] = pageData;
  // delete old ui elements.
  while (page.firstChild) {
    page.removeChild(page.firstChild);
  };
  
  // generate new elements.
  if (pageName === 'account') {
    pageData.picks.forEach((data) => { renderData(page, data); });
    pageData.infos.forEach((data) => { renderData(page, data); });
    pageData.items.forEach((data) => { renderData(page, data); });
    pageData.chars.forEach((data) => { renderData(page, data); });
  } else {
    pageData.infos.forEach((data) => { renderData(page, data); });
    pageData.picks.forEach((data) => { renderData(page, data); });
    pageData.items.forEach((data) => { renderData(page, data); });
    pageData.chars.forEach((data) => { renderData(page, data); });    
  };
  
  // automated security settings.
  let links = [...page.getElementsByTagName('a')];
  for (let iLink in links) {
    links[iLink].target = '_blank';
    links[iLink].rel = 'external noopener noreferrer nofollow';
  };
};

const renderTabs = (tabDataArray) => {
  // save expanded and focused elements into pageData.
  let expanded = undefined;
  [...header.children].forEach((iDom) => { // with sibling dom elements
    if (iDom.classList.contains('expanded')) {
      expanded = iDom.getAttribute('name');
    };
  });
  // delete old tab data.
  tabs = tabDataArray;
  // delete old ui elements.
  while (header.firstChild) {
    header.removeChild(header.firstChild);
  };
  for (let tabData of tabDataArray) {
    if (typeof tabData.tab !== 'string' || (typeof tabData.name !== 'string' && typeof tabData.expander === 'undefined')) {
      console.error('Ignoring invalid tab from server:', tabData);
      return;
    };
    renderData(header, tabData);
  };
  if (!expanded) {
    [...header.children].forEach((iDom) => { // with sibling dom elements
      if (iDom.classList.contains('expanded')) {
        expanded = iDom.getAttribute('name');
      };
    });
  };
  if (!expanded) {
    [...header.children].forEach((iDom) => { // with sibling dom elements
      if (iDom.getAttribute('display') !== 'none') {
        expanded = iDom.getAttribute('name');
      };
    });
  };
  if (expanded) {
    [...header.children].forEach((iDom) => { // with sibling dom elements
      if (iDom.getAttribute('name') === expanded) {
        iDom.classList.add('expanded');
      } else {
        iDom.classList.remove('expanded');
      };
    });
    [...document.getElementsByClassName('page')].forEach((iDom) => {
      if (iDom.getAttribute('name') === expanded) {
        iDom.classList.add('expanded');
      } else {
        iDom.classList.remove('expanded');
      };
    });
  };
};