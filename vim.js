var gState = "NORMAL";
var gKeyQueue = [];
var gLinkCodes = {};

document.addEventListener('keypress', function(evt){
  console.log(evt.key)
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
        elem.style.position="relative"
        elem.appendChild(codehint);
        gLinkCodes[String(code)] = elem;
        code += 1;
      })
      gState = "FOLLOW";
    }
  }
  if (gState == "FOLLOW") {
    // Number pad always returns "NumLock"!
    // Handle number > 10
    if (typeof(gLinkCodes[evt.key]) !== "undefined") {
      gLinkCodes[evt.key].click();
    }
    // TODO: implement ESC here
  }
})
