chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    console.log(sender.tab);
    switch (request.type) {
      case "switch_tab_left":
        console.log("Switching to left tab");
        switchTab(-1);
        break;
      case "switch_tab_right":
        console.log("Switching to right tab");
        switchTab(1);
        break;
      case "reload":
        console.log("Reload, bypassCache = " + request.bypassCache);
        chrome.tabs.reload({ bypassCache: request.bypassCache });
        break;
      case "close_tab":
        closeTab(request.focusLeft);
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
    console.log("Move from tab #" + currentIndex + " to #" + tabToActivate.index);
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
