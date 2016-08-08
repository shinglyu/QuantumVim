function swtich_tab(offset) {
  // first, get currently active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs.length) {
      var activeTab = tabs[0],
      tabId = activeTab.id,
      currentIndex = activeTab.index;
      // next, get number of tabs in the window, in order to allow cyclic next
      chrome.tabs.query({currentWindow: true}, function (tabs) {
        var numTabs = tabs.length;
        // finally, get the index of the tab to activate and activate it
        chrome.tabs.query({index: (currentIndex+offset+numTabs) % numTabs}, function(tabs){
          if (tabs.length) {
            var tabToActivate = tabs[0],
            tabToActivate_Id = tabToActivate.id;
            chrome.tabs.update(tabToActivate_Id, {active: true});
          }
        });
      });
    }
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab);
    switch (request.type) {
      case "switch_tab_left":
        console.log("Switching to left tab");
        swtich_tab(-1);
        break;
      case "switch_tab_right":
        console.log("Switching to right tab");
        swtich_tab(1);
        break;
      case "reload":
        console.log("Reload, bypassCache = " + request.bypassCache);
        chrome.tabs.reload({ bypassCache: request.bypassCache });
        break;
    }
  }
);
