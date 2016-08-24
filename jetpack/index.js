var wuntils = require('sdk/window/utils');
var tabs = require('sdk/tabs');
var { Hotkey } = require('sdk/hotkeys');
var { setTimeout  } = require("sdk/timers");

var openHotKey = Hotkey({
  combo: "shift-o",
  onPress: function() {
    var document = wuntils.getMostRecentBrowserWindow().document;
    var urlbar = document.getElementById("urlbar");
    urlbar.focus();
    urlbar.select();
  }
});

var openHotKey = Hotkey({
  combo: "shift-t",
  onPress: function() {
    tabs.open('about:newtab');
    // Sleep for 0.5 sec so the tab focus is on the newly opened one
    // This is not optimal, use the onOpen and onReady event to trigger this
    setTimeout(function() {
      var document = wuntils.getMostRecentBrowserWindow().document;
      var urlbar = document.getElementById("urlbar");
      urlbar.focus();
    }, 500);
  }
});
