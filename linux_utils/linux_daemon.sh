#!/usr/bin/env bash

# sudo apt-get install xdotool first

# https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly

if !(hash xdotool); then
  echo "Please install xdotool first: sudo apt-get install xdotool"
  exit
fi

if !(hash xvkbd); then
  echo "Please install xvkbd first: sudo apt-get install xvkbd"
  exit
fi

xbindkeysrc='/tmp/xbindkeysrc'

checkIsFirefox() {
  echo
}

mainloop() {
  xbindkeys -n -f $xbindkeysrc | \
     while read line ; do
       if !($(xdotool getwindowfocus getwindowname | grep -q "Mozilla Firefox")); then
         continue
       fi

       if echo "$line" | grep -q "OPENOPEN"; then
         echo "Received Firefox OPEN"
         sleep 0.2s
         xdotool key alt+d
       fi

       if echo "$line" | grep -q "TABOPEN"; then
         echo "Received Firefox TABOPEN"
         sleep 0.2s
         xdotool key ctrl+t
         sleep 0.5s
         xdotool key alt+d
       fi
     done
}

createXbindkeysrc() {
  echo "" > $xbindkeysrc
  echo "\"echo OPENOPEN; xvkbd -xsendevent -text 'o'\"" >> $xbindkeysrc # OPEN is a sub string of TABOPEN
  echo "  shift+o"                                            >> $xbindkeysrc
  echo "\"echo TABOPEN; xvkbd -xsendevent -text 't'\""  >> $xbindkeysrc # OPEN is a sub string of TABOPEN
  echo "  shift+t"                                            >> $xbindkeysrc
}

createXbindkeysrc
mainloop
