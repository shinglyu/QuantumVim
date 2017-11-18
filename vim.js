var gState = {
  _state: "NORMAL",
  _timerId: undefined,
  get: function() {
    return this._state;
  },
  set: function(newState) {
    this._state = newState;
    updateStatusBar();
    window.clearTimeout(this._timerId);
  },
  setTimer: function(endState, time){
    this._timerId = window.setTimeout(function(){
      this.set(endState);
    }.bind(this), time);
  }
};
var gKeyQueue = "";
var gLinkCodes = {};
var gAutoInsertModeElements = ['INPUT', 'TEXTAREA'];
var gLastKeyPressTime = Date.now();
var gLastKey = "";
var gDebounceInterval = 500;
var gDebounceReturnTimeout = 1000;

function confirmOrGoToInsert(msg, callback) {
  if (confirm(msg)){
    callback();
  }
  else {
    gState.set("INSERT");
  }
}

function goToMainInput() {
  for (var tagName of gAutoInsertModeElements) {
    var tags = document.getElementsByTagName(tagName);
    if (tags.length > 0) {
      tags[0].focus();
    }
  }
}

function debounce(keyStr) {
  if (gState.get() == "NORMAL") {
    if (Date.now() - gLastKeyPressTime < gDebounceInterval &&
         !(keyStr == "j" && gLastKey == "j") &&
         !(keyStr == "k" && gLastKey == "k")
       ){
      gState.set("INSERT");
      gState.setTimer("NORMAL", gDebounceReturnTimeout);
    }
  }
  gLastKeyPressTime = Date.now();
  gLastKey = keyStr;
}

document.addEventListener('keypress', function(evt){
  let keyStr = evt.key;
  if (evt.ctrlKey) keyStr = 'C-' + keyStr;
  if (evt.metaKey) keyStr = 'M-' + keyStr;

  debounce(keyStr);


  // TODO: Handling state in a global var is not good enough,
  // consider some design pattern here
  switch (gState.get()) {
    case "NORMAL":
      // TODO: extract the command <-> action mapping to a config file
      switch (keyStr) {
        case 'h':
          // TODO: make the scroll configurable
          window.scrollBy(-19, 0);
          break;
        case 'j':
          window.scrollByLines(1);
          break;
        case 'k':
          window.scrollByLines(-1);
          break;
        case 'l':
          window.scrollBy(19, 0);
          break;
        case 'g':
          gState.set("GOTO");
          break;
        case 'G':
          window.scrollTo(window.scrollX, document.body.scrollHeight);
          break;
        case 'J':
          //chrome.tabs.update(1, {selected: true});
          chrome.runtime.sendMessage({type:'switch_tab_left'});
          break;
        case 'K':
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
          highlight_links();
          gState.set("FOLLOW");
          break;
        case 'R':
          chrome.runtime.sendMessage({ type: 'reload', bypassCache: false });
          break;
        case 'y':
          copyCurrentLocation();
          break;
        case 'Y':
          document.execCommand('copy');
          break;
        case 'd':
          confirmOrGoToInsert("Close the tab?", function(){
            chrome.runtime.sendMessage({ type: 'close_tab', focusLeft: false });
          });
          break;
        case 'D':
          confirmOrGoToInsert("Close the tab?", function(){
            chrome.runtime.sendMessage({ type: 'close_tab', focusLeft: true});
          });
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
          gState.set("INSERT");
          break;
        case 'z':
          gState.set("ZOOM");
          break;
        case "Escape":
          document.activeElement.blur();
          break;
        case 't':
          console.log("Open new tab")
          chrome.runtime.sendMessage({type:'open_new_tab'});
          break;
      }
      break;
    case "GOTO":
      switch (keyStr) {
        case 'g':
          window.scrollTo(window.scrollX, 0);
          break;
        case 't':
          chrome.runtime.sendMessage({type:'switch_tab_right'});
          break;
        case 'T':
          chrome.runtime.sendMessage({type:'switch_tab_left'});
          break;

        case 'i':
          goToMainInput();
          break;
      }
      gState.set("NORMAL");
      break;
    case "FOLLOW":
      switch (keyStr) {
        case "Escape":

          follow_to_normal();
          break;
        case "Enter":
          follow_link(gKeyQueue);
          break;
        default:

          accumulate_link_codes(keyStr);
          break;
      }
      break;
    case "INSERT":
      switch (keyStr) {
        case "Escape":

          document.activeElement.blur();
          gState.set("NORMAL");
          break;
      }
      break;
    case "ZOOM":
      switch (keyStr) {
        case "i":
          chrome.runtime.sendMessage({ type: 'zoom_in'});
          break;
        case "o":
          chrome.runtime.sendMessage({ type: 'zoom_out'});
          break;
      }
      gState.set("NORMAL");
      break;
  }
});


window.addEventListener('load', function(){

  document.addEventListener('focusin', function(evt){
    if (gAutoInsertModeElements.includes(evt.target.tagName)){
      console.log("Input box focused, goto INSERT mode");
      // TODO: use gState.get() when status bar patch landed
      gState.set("INSERT");
    }
  });
  document.addEventListener('focusout', function(evt){
    if (gAutoInsertModeElements.includes(evt.target.tagName)){
      console.log("Input box blurred, goto NORMAL mode");
      gState.set("NORMAL");
    }
  });

  if (gAutoInsertModeElements.includes(document.activeElement.tagName)){
    console.log("Input box focused on page load, goto INSERT mode");
    gState.set("INSERT");
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


/* Link Following */
function highlight_links() {
  // TODO: buttons, inputs
  var links = document.querySelectorAll('a');
  function hint_code_to_letters(code) {
    var map = "qewrtasdfgzxcvb";
    var out = '';
    do {
      out = '' + map[code % map.length] + out;
      code = code / map.length | 0;
    } while (code > 0);
    return out;
  }

  var code = 0;
  Array.prototype.forEach.call(links, function(elem) {

    elem._originalBackgroundColor = elem.style.backgroundColor;
    elem._originalPosition = elem.style.position;
    elem.style.backgroundColor = 'yellow';

    var codehint = document.createElement('span');
    codehint.textContent = hint_code_to_letters(code);
    codehint.style.border="solid 0.2px black";
    codehint.style.backgroundColor="white";
    codehint.style.font="12px/14px bold sans-serif";
    codehint.style.color="darkred";
    codehint.style.position="absolute";
    codehint.style.top="0";
    codehint.style.left="0";
    codehint.style.padding="0.1em";

    elem.style.position="relative";
    elem.appendChild(codehint);

    gLinkCodes[hint_code_to_letters(code)] = {
      'element':elem,
      'codehint': codehint
    };
    code += 1;
  });
}

function reduce_highlights(remain_pattern) {
  for (var code in gLinkCodes) {
    if (!code.startsWith(remain_pattern)) {
      gLinkCodes[code].element.style.backgroundColor = gLinkCodes[code].element._originalBackgroundColor;
      gLinkCodes[code].element.style.position= gLinkCodes[code].element._originalPosition;
      gLinkCodes[code].codehint.remove();
    }
  }
}

function accumulate_link_codes(keyStr){
  gKeyQueue += keyStr;
  newGLinkCodes = {};
  for (var code in gLinkCodes){
    if (code.startsWith(gKeyQueue)){
      // TODO: many return a new list instead?
      newGLinkCodes[code] = gLinkCodes[code];
    }
  }

  var matchesCount = Object.keys(newGLinkCodes).length;


  if (matchesCount === 0) {
    // Cleanup and go back to normal mode
    follow_to_normal();
  }
  else if (matchesCount === 1) {
    // Go to the link!
    follow_link(gKeyQueue);
  }
  else {
    reduce_highlights(gKeyQueue);
    gLinkCodes = newGLinkCodes;
  }
}

function follow_link(key){

  if (typeof(gLinkCodes[key]) !== "undefined") {
    gLinkCodes[key].element.click();
  }
  follow_to_normal();
}

function follow_to_normal() {
  reduce_highlights("NEVER_MATCH");
  gLinkCodes = {};
  gKeyQueue = "";
  gState.set("NORMAL");
}

function updateStatusBar(){

  if (gState.get() == "NORMAL") {
    document.getElementById("statusbar").textContent = "";
  }
  else {
    document.getElementById("statusbar").textContent = "-- " + gState.get() + " --";
  }
}

function initStatusBar(){
  var statusbar = document.createElement('span');
  statusbar.style.position = "fixed";
  statusbar.style.bottom = "0";
  statusbar.style.left = "0";
  statusbar.style.backgroundColor = "rgba(219,219, 182, 0.5)";
  statusbar.style.color = "black";
  statusbar.id = "statusbar";

  document.body.appendChild(statusbar);
}

window.addEventListener('load', function(){
  initStatusBar();


  document.addEventListener('focusin', function(evt){
    if (gAutoInsertModeElements.includes(evt.target.tagName)){
      console.log("Input box focused, goto INSERT mode");
      // TODO: use gState.get() when status bar patch landed
      gState.set("INSERT");
    }
  });
  document.addEventListener('focusout', function(evt){
    if (gAutoInsertModeElements.includes(evt.target.tagName)){
      console.log("Input box blurred, goto NORMAL mode");
      gState.set("NORMAL");
    }
  });

  if (gAutoInsertModeElements.includes(document.activeElement.tagName)){
    console.log("Input box focused on page load, goto INSERT mode");
    gState.set("INSERT");
  }

});
