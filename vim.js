var gState = "NORMAL";
var gKeyQueue = [];
var gLinkCodes = {};

document.addEventListener('keypress', function(evt){
  console.log("State before: " + gState);
  console.log("Key: " + (evt.ctrlKey ? "Ctrl-" : "") + evt.key);
  // TODO: Handling state in a global var is not good enough,
  // consider some design pattern here
  if ( gState == "NORMAL" ) {

    // TODO: extract the command <-> action mapping to a config file
    if (evt.key == 'j' && !evt.ctrlKey) {
      // TODO: make the scroll configurable
      window.scrollByLines(1);
    }
    if (evt.key == 'k' && !evt.ctrlKey) {
      window.scrollByLines(-1);
    }
    if (evt.key == 'g' && !evt.ctrlKey) {
      gState = "GOTO";
    }
    if (evt.key == 'G' && !evt.ctrlKey) {
      window.scrollTo(window.scrollX, document.body.scrollHeight);
    }
    if (evt.key == 'J' && !evt.ctrlKey) {
      // TODO: make the scroll configurable
      //chrome.tabs.update(1, {selected: true});
      chrome.runtime.sendMessage({type:'switch_tab_left'});
      console.log(chrome.tabs);
    }
    if (evt.key == 'K' && !evt.ctrlKey) {
      // TODO: make the scroll configurable
      chrome.runtime.sendMessage({type:'switch_tab_right'});
      console.log(chrome.tabs);
    }
    if (evt.key == 'H' && !evt.ctrlKey) {
      // TODO: any reason we want to this this in the background script?
      history.back();
    }
    if (evt.key == 'L' && !evt.ctrlKey) {
      // TODO: any reason we want to this this in the background script?
      history.forward();
    }
    if (evt.key == 'f' && !evt.ctrlKey) {
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
    if (evt.key == 'r' && !evt.ctrlKey) {
      chrome.runtime.sendMessage({ type: 'reload', bypassCache: false });
    }
    if (evt.key == 'R' && !evt.ctrlKey) {
      chrome.runtime.sendMessage({ type: 'reload', bypassCache: true });
    }
    if (evt.key == 'y' && !evt.ctrlKey) {
      copyCurrentLocation();
    }
    if (evt.key == 'Y' && !evt.ctrlKey) {
      document.execCommand('copy');
    }
    if (evt.key == 'b' && evt.ctrlKey) {
      // Ctrl-b
      window.scrollByPages(-1);
    }
    if (evt.key == 'f' && evt.ctrlKey) {
      // Ctrl-f
      window.scrollByPages(1);
    }
    if (evt.key == 'd' && evt.ctrlKey) {
      // Ctrl-d
      window.scrollBy(0, window.innerHeight / 2);
    }
    if (evt.key == 'u' && evt.ctrlKey) {
      // Ctrl-u
      window.scrollBy(0, -window.innerHeight / 2);
    }
  } else if (gState == "GOTO") {
    if (evt.key == 'g' && !evt.ctrlKey) {
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
      document.activeElement.blur();
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
