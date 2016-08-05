var gState = "NORMAL";
var gKeyQueue = [];
var gLinkCodes = {};

document.addEventListener('keypress', function(evt){
  console.log("State before: " + gState);
  console.log("Key: " + evt.key);
  // TODO: Handling state in a global var is not good enough,
  // consider some design pattern here
  if ( gState == "NORMAL" ) {

    // TODO: extract the command <-> action mapping to a config file
    if (evt.key == 'j') {
      // TODO: make the scroll configurable
      window.scrollByLines(1);
    }
    if (evt.key == 'k') {
      window.scrollByLines(-1);
    }
    if (evt.key == 'g') {
      gState = "GOTO";
    }
    if (evt.key == 'G') {
      window.scrollTo(window.scrollX, document.body.scrollHeight);
    }
    if (evt.key == 'J') {
      // TODO: make the scroll configurable
      //chrome.tabs.update(1, {selected: true});
      chrome.runtime.sendMessage({type:'switch_tab_left'});
      console.log(chrome.tabs);
    }
    if (evt.key == 'K') {
      // TODO: make the scroll configurable
      chrome.runtime.sendMessage({type:'switch_tab_right'});
      console.log(chrome.tabs);
    }
    if (evt.key == 'H') {
      // TODO: any reason we want to this this in the background script?
      history.back();
    }
    if (evt.key == 'L') {
      // TODO: any reason we want to this this in the background script?
      history.forward();
    }
    if (evt.key == 'f') {
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
    }
    if (evt.key == 'r') {
      chrome.runtime.sendMessage({ type: 'reload', bypassCache: false });
    }
    if (evt.key == 'R') {
      chrome.runtime.sendMessage({ type: 'reload', bypassCache: true });
    }
  } else if (gState == "GOTO") {
    if (evt.key == 'g') {
      window.scrollTo(window.scrollX, 0);
    }
    gState = "NORMAL";
  }
  else if (gState == "FOLLOW") {
    // Number pad always returns "NumLock"!
    // Handle number > 10
    if (typeof(gLinkCodes[evt.key]) !== "undefined") {
      gLinkCodes[evt.key].click();
    }
    // TODO: implement ESC here
  }
  else if (gState == "INSERT"){
    if (evt.key == "Escape") {
      console.log("ESC => NORMAL mode");
      gState = "NORMAL";
    }
    else {
      return;
    }
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
