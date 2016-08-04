document.addEventListener('keyup', function(evt){
  console.log(evt.key)
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

})
