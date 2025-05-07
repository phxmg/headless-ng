const path = require('path');
const { app } = require('electron');
const isDev = require('electron-is-dev');

// This file serves as the entry point for Electron in production builds
// It simply delegates to our actual main.js file

// Determine the path to the main.js file
const mainPath = isDev
  ? path.join(__dirname, '../dist/main/main.js')
  : path.join(__dirname, '../dist/main/main.js');

// Require the main module
require(mainPath);

// The main.js file will handle creating the window and setting up IPC 