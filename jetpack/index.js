//var data = require("sdk/self").data;
var wuntils = require('sdk/window/utils');
var {Hotkey} = require('sdk/hotkeys');
//var pageMod = require("sdk/page-mod");


var openHotKey = Hotkey({
  combo: "shift-o",
  onPress: function() {
    var document = wuntils.getMostRecentBrowserWindow().document;
    var urlbar = document.getElementById("urlbar");
    urlbar.focus();
    urlbar.select();
  }
});

/*
pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("vim-jetpack.js"),
  onAttach: function(worker) {
    worker.port.on('open', function() {
      console.log('open')
    });
    worker.port.on('tabopen', function() {
      console.log('tabopen')
    });
  }
});
*/
