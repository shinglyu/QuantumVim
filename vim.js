// TODO: Consider using Object.watch() or Proxy to monitor state change
var gState = {
  _state: "NORMAL",
  get: function() {
    return this._state;
  },
  set: function(newState) {
    this._state = newState;
    updateStatusBar();
  }
};
var gKeyQueue = [];
var gLinkCodes = {};

document.addEventListener('keypress', function(evt){
  console.log(evt.key)
  // TODO: Handling state in a global var is not good enough,
  // consider some design pattern here
  if ( gState.get() == "NORMAL" ) {

    // TODO: extract the command <-> action mapping to a config file
    if (evt.key == 'j') {
      // TODO: make the scroll configurable
      window.scrollByLines(1);
    }
    if (evt.key == 'k') {
      window.scrollByLines(-1);
    }
    if (evt.key == 'J') {
      // TODO: make the scroll configurable
      //chrome.tabs.update(1, {selected: true})
      chrome.runtime.sendMessage({type:'switch_tab_left'})
      console.log(chrome.tabs)
    }
    if (evt.key == 'K') {
      // TODO: make the scroll configurable
      //chrome.tabs.update(1, {selected: true})
      chrome.runtime.sendMessage({type:'switch_tab_right'})
      console.log(chrome.tabs)
    }
    if (evt.key == 'f') {
      var links = document.querySelectorAll('a');
      // TODO: asdfghjkl; codes
      var code = 0;
      Array.prototype.forEach.call(links, function(elem){
        // console.log(elem);
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
        elem.style.position="relative"
        elem.appendChild(codehint);
        gLinkCodes[String(code)] = elem;
        code += 1;
      })
      gState.set("FOLLOW");
    }
    if (evt.key == 'r') {
      chrome.runtime.sendMessage({ type: 'reload', bypassCache: false });
    }
    if (evt.key == 'R') {
      chrome.runtime.sendMessage({ type: 'reload', bypassCache: true });
    }
  }
  if (gState.get() == "FOLLOW") {
    // Number pad always returns "NumLock"!
    // Handle number > 10
    if (typeof(gLinkCodes[evt.key]) !== "undefined") {
      gLinkCodes[evt.key].click();
    }
    // TODO: implement ESC here
  }
})

// TODO: consider moving the status bar into a spearate file
function updateStatusBar(){
  console.log("State changed to " + gState.get());
  document.getElementById("statusbar").textContent = "-- " + gState.get() + " --";
}

function initStatusBar(){
  var statusbar = document.createElement('span');
  statusbar.style.position = "fixed";
  statusbar.style.bottom = "0";
  statusbar.style.left = "0";
  statusbar.style.backgroundColor = "white";
  statusbar.style.color = "black";
  statusbar.id = "statusbar";

  document.body.appendChild(statusbar);
};

initStatusBar();
