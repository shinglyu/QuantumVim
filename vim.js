var gState = "NORMAL";
var gKeyQueue = [];
var gLinkCodes = {};
let gCodeHints = [];

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
          break;
        case 'K':
          // TODO: make the scroll configurable
          chrome.runtime.sendMessage({type:'switch_tab_right'});
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
            let originalColor = elem.style.backgroundColor;
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
            gCodeHints.push({ codehint, originalColor });
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
        case 'y':
          copyCurrentLocation();
          break;
        case 'Y':
          document.execCommand('copy');
          break;
        case 'd':
          chrome.runtime.sendMessage({ type: 'close_tab', focusLeft: false });
          break;
        case 'D':
          chrome.runtime.sendMessage({ type: 'close_tab', focusLeft: true });
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
        case 'I':
          gState = "INSERT";
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
      function clear() {
        for (let { codehint, originalColor } of gCodeHints) {
          codehint.parentNode.style.backgroundColor = originalColor;
          codehint.parentNode.removeChild(codehint);
        }
        gCodeHints = [];
        gState = "NORMAL";
      }
      // Number pad always returns "NumLock"!
      // Handle number > 10
      if (typeof(gLinkCodes[evt.key]) !== "undefined") {
        clear();
        gLinkCodes[evt.key].click();
      } else if (evt.key == "Escape") {
        clear();
      }
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


window.addEventListener('load', function(){
  autoInsertModeElements = ['INPUT', 'TEXTAREA'];

  function registerAndEnterAutoInsertMode(elem){
      console.log("Adding auto insert mode listener");
      elem.addEventListener('focus', function(evt){
        console.log("Input box focused, goto INSERT mode");
        gState = "INSERT";
      });
      elem.addEventListener('blur', function(evt){
        console.log("Input box blurred, goto NORMAL mode");
        gState = "NORMAL";
      });
      if (document.activeElement.tagName == tagName){
          console.log("Input box focused on page load, goto INSERT mode");
          gState = "INSERT";
      }
  }

  for (let tagName of autoInsertModeElements){
    var inputs = document.getElementsByTagName(tagName);
    Array.prototype.forEach.call(inputs, registerAndEnterAutoInsertMode);
  }
});


function copyToClipboard(str) {
  // Once bug 1197451 is done, we can use Services.clipboardRead/Write
  var textArea = document.createElement("textarea");
  textArea.value = str;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

function copyCurrentLocation() {
  // Copy the canonical link if possible.
  // This will copy short urls such as https://bugzil.la/<id>.
  let links = document.getElementsByTagName('link');
  for (let link of links) {
    if (link.rev == "canonical") {
      copyToClipboard(link.href);
      return;
    }
  }

  copyToClipboard(window.location.href);
}
