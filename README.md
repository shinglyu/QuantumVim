QuantumVim
================
QuantumVim is a vim key-binding add-on for Firefox. It is targeting future Firefox releases with e10s and WebExtension.

![screenshot](https://github.com/shinglyu/QuantumVim/raw/master/doc/screenshot.png)

# Normal Install
* [Install From AMO](https://addons.mozilla.org/zh-TW/firefox/addon/quantumvim/)
* We recommend you use this with [QuantumVim Extra](https://addons.mozilla.org/zh-TW/firefox/addon/quantumvim-extra/)

# Debug Installation
* Open `about:debugging`, click "Load temporary add-on"
* Select the `manifest.json`

# Supported commands
* `j`, `k`: scroll down/up by one line
* `h`, `l`: scroll left/right
* `J`/`gt`, `K`/`gT`: switch to previous/next tab
* `r`, `R`: reload page (`R` bypass the local web cache)
* `gg`, `G`: go to the top/bottom of the page
* `H`, `L`: back/forward in history
* `<C-f>`, `<C-b>`: scroll down/up by one page
* `<C-d>`, `<C-u>`: scroll down/up by half a page
* `y`: Copy current location
* `Y`: Copy selected text
* `d`, `D`: close the current tab and focus the left/right one.
* `f`: follow links, press <Esc> to abort.
* When focusing on an `<input>` element. It will automatically enters the INSERT MODE.
* `I`: enter INSERT MODE manually
* `t`: Open a new tab

# TODO:
* `:open`: open an URL or search
* `:tabopen`: open an URL or search in a new tab
* `F`: follow links in a new tab
* Insert Mode: pass all keys to `<input>` when focused
* Passthrough Mode: pass all keys to the page

# Contribute
Please feel free to submit PR or issues.
You are suggested to run `jshint *.js` before you submit a pull request. To install jshint you can `npm install -g jshint`.
