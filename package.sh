#!/usr/bin/env bash
mkdir output

zip output/quantumvim.zip vim.js vim-background.js icons/icon-48.png manifest.json focusin.min.js

cd jetpack
jpm xpi 
mv @quantumvim-extra-*.xpi ../output
