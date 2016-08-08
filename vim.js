var gState = "NORMAL";
var gKeyQueue = [];
var gLinkCodes = {};

document.addEventListener('keypress', function(evt){
  console.log("State before: " + gState);
  let keyStr = (evt.ctrlKey ? "C-" : "") + evt.key;
  console.log("Key: " + keyStr);
  // TODO: Handling state in a global var is not good enough,
  // consider some design pattern here
  switch (gState) {
    case "NORMAL":
      // TODO: extract the command <-> action mapping to a config file
      switch (keyStr) {
        case 'j':
          // TODO: make the scroll configurable
          window.scrollByLines(1);
          break;
        case 'k':
          window.scrollByLines(-1);
          break;
        case 'g':
          gState = "GOTO";
          break;
        case 'G':
          window.scrollTo(window.scrollX, document.body.scrollHeight);
          break;
        case 'J':
          // TODO: make the scroll configurable
          //chrome.tabs.update(1, {selected: true});
          chrome.runtime.sendMessage({type:'switch_tab_left'});
          console.log(chrome.tabs);
          break;
        case 'K':
          // TODO: make the scroll configurable
          chrome.runtime.sendMessage({type:'switch_tab_right'});
          console.log(chrome.tabs);
          break;
        case 'H':
          // TODO: any reason we want to this this in the background script?
          history.back();
          break;
        case 'L':
          // TODO: any reason we want to this this in the background script?
          history.forward();
          break;
        case 'f':
          var links = document.querySelectorAll('a');
          // TODO: asdfghjkl; codes
          var code = 0;
          Array.prototype.forEach.call(links, function(elem){
            console.log(elem);
            elem.style.backgroundColor = 'yellow';
            var codehint = document.createElement('span');
            codehint.textContent = code;
            codehint.style.border="solid 1px black";
            codehint.style.backgroundColor="white";
            codehint.style.font="12px/14px bold sans-serif";
            codehint.style.color="darkred";
            codehint.style.position="absolute";
            codehint.style.top="0";
            codehint.style.left="0";
            codehint.style.padding="0.1em";
            elem.style.position="relative";
            elem.appendChild(codehint);
            gLinkCodes[String(code)] = elem;
            code += 1;
          });
          gState = "FOLLOW";
          break;
        case 'r':
          chrome.runtime.sendMessage({ type: 'reload', bypassCache: false });
          break;
        case 'R':
          chrome.runtime.sendMessage({ type: 'reload', bypassCache: true });
          break;
        case 'C-b':
          window.scrollByPages(-1);
          break;
        case 'C-f':
          window.scrollByPages(1);
          break;
        case 'C-d':
          window.scrollBy(0, window.innerHeight / 2);
          break;
        case 'C-u':
          window.scrollBy(0, -window.innerHeight / 2);
          break;
      }
      break;
    case "GOTO":
      switch (keyStr) {
        case 'g':
          window.scrollTo(window.scrollX, 0);
          break;
      }
      gState = "NORMAL";
      break;
    case "FOLLOW":
      // Number pad always returns "NumLock"!
      // Handle number > 10
      if (typeof(gLinkCodes[keyStr]) !== "undefined") {
        gLinkCodes[keyStr].click();
      }
      // TODO: implement ESC here
      break;
    case "INSERT":
      switch (keyStr) {
        case "Escape":
          console.log("ESC => NORMAL mode");
          document.activeElement.blur();
          gState = "NORMAL";
          break;
      }
      break;
  }
  console.log("State after: " + gState);
});

var inputs = document.getElementsByTagName('input');
Array.prototype.forEach.call(inputs, function(elem){
  console.log("Adding auto insert mode listener");
  elem.addEventListener('focus', function(evt){
    console.log("Input box focused, goto INSERT mode");
    gState = "INSERT";
  });
  elem.addEventListener('blur', function(evt){
    console.log("Input box blurred, goto NORMAL mode");
    gState = "NORMAL";
  });
});
