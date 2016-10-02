#!/usr/bin/env bash
mkdir output
rm output/*

zip output/quantumvim.zip vim.js vim-background.js icons/icon-48.png manifest.json

cd jetpack
jpm xpi 
mv @quantumvim-extra-*.xpi ../output
