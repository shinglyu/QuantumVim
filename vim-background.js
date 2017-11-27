chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {


    switch (request.type) {
      case "switch_tab_left":
        switchTab(-1);
        break;

      case "switch_tab_right":
        switchTab(1);
        break;

      case "reload":
        chrome.tabs.reload({ bypassCache: request.bypassCache });
        break;

      case "open_new_tab":
        chrome.tabs.create({});
        break;

      case "close_tab":
        closeTab(request.focusLeft);
        break;
      case "close_system_tabs":
        closeSystemTabs();
        break;

      case "zoom_in":
        chrome.tabs.getZoom(function(curr_zoom){
          var target_zoom = Math.min(curr_zoom * 1.08, 3.0);
          chrome.tabs.setZoom(target_zoom);
        });
        break;

      case "zoom_out":
        chrome.tabs.getZoom(function(curr_zoom){
          var target_zoom = Math.max(curr_zoom * 0.92, 0.3);
          chrome.tabs.setZoom(target_zoom);
        });
        break;
      case "undo_close_tab":
        chrome.sessions.getRecentlyClosed({ maxResults: 1 }, function(recentSessions){
          if (!recentSessions.length) {
            return;
          }
          let prevSession = recentSessions[0];
          if (prevSession.tab) {
            chrome.sessions.restore(prevSession.tab.sessionId);
          }
        });
        break;
    }
  }
);

function queryTabAll(options) {
  return new Promise(function(resolve) {
    chrome.tabs.query(options, resolve);
  });
}

function queryTab(options) {
  return queryTabAll(options).then(function (tabs) {
    return tabs[0];
  });
}

function getActiveTab() {
  return queryTab({ active: true, currentWindow: true });
}

function getTabByIndex(index) {
  return queryTab({ index });
}

function activateTab(tab) {
  return new Promise(function(resolve) {
    chrome.tabs.update(tab.id, {active: true}, resolve);
  });
}

function runPromiseGenerator(generator){
  var gen = generator();
  function go(result){
    if(result.done) return;
    result.value.then(function(r){
      go(gen.next(r));
    });
  }
  go(gen.next());
}

function switchTab(offset) {
  runPromiseGenerator(function *() {
    // first, get currently active tab
    let activeTab = yield getActiveTab(),
        currentIndex = activeTab.index;

    // next, get number of tabs in the window, in order to allow cyclic next
    let tabs = yield queryTabAll({ currentWindow: true }),
        numTabs = tabs.length;

    // finally, get the index of the tab to activate and activate it
    let tabToActivate = yield getTabByIndex((currentIndex+offset+numTabs) % numTabs);

    yield activateTab(tabToActivate);
  });
}

function closeTab(focusLeft) {
  runPromiseGenerator(function *() {
    let tab = yield getActiveTab();
    if (focusLeft && tab.index > 0) {
      let tabLeft = yield getTabByIndex(tab.index - 1);
      yield activateTab(tabLeft);
    }
    chrome.tabs.remove(tab.id);
  });
}

function closeSystemTabs() {
  // Pages that doesn't allow script inject, thus will block QuantumVim
  var urls = {
    'about:blank': null,
    'about:newtab': null,
    'about:debugging': null,
    'about:addons': null,
    'about:preferences': null,
    'about:preferences#general': null,
    'about:preferences#search': null,
    'about:preferences#privacy': null,
    'about:preferences#sync': null,
  }
  //chrome.tabs.query({"url": urls}, function(tabs){
  chrome.tabs.query({}, function(tabs){
    for (var tab of tabs){
      if (tab.url in urls) {
        chrome.tabs.remove(tab.id)
      }
    }
  });

}

chrome.commands.onCommand.addListener(function(command) {
  switch (command) {
    case "close_system_tabs":
      closeSystemTabs();
      break;
  }
});
