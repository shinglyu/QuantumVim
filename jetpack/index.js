var wuntils = require('sdk/window/utils');
var tabs = require('sdk/tabs');
var { Hotkey } = require('sdk/hotkeys');
var { setTimeout  } = require("sdk/timers");

var closeAboutTimeout = 180000;

var openHotKey = Hotkey({
  // o and shift-o will block your typing
  // fix this after we implement INSERT mode switching
  combo: "ctrl-shift-o",
  onPress: function() {
    var document = wuntils.getMostRecentBrowserWindow().document;
    var urlbar = document.getElementById("urlbar");
    urlbar.focus();
    urlbar.select();
  }
});

function openTab() {
  tabs.open('about:newtab');
  // Sleep for 0.5 sec so the tab focus is on the newly opened one
  // This is not optimal, use the onOpen and onReady event to trigger this
  setTimeout(function() {
    var document = wuntils.getMostRecentBrowserWindow().document;
    var urlbar = document.getElementById("urlbar");
    urlbar.focus();
  }, 500);
}
var openHotKey = Hotkey({
  combo: "ctrl-shift-t",
  onPress: openTab
});

//Use two hands to ease muscle stress, "n" is abbr for "newtab"
var openHotKey = Hotkey({
  combo: "ctrl-shift-n",
  onPress: openTab
});


function registerCloseTimer(tab) {
  console.log("Registering for " + tab.url);
  if (tab.url.startsWith('about:')){
    console.log("Found " + tab.url);
    //tab.on("deactivate", function(){
      console.log("Deactivated " + tab.url);
      setTimeout(function(){
        console.log("Closing " + tab.url);
        tab.close();
      }, closeAboutTimeout);
    //});
  }
}

tabs.on("deactivate", registerCloseTimer);
