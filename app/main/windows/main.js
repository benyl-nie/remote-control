const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let win;
function create() {
  win = new BrowserWindow({
    width: 600,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    }
  });
   win.webContents.openDevTools();
  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/pages/main/index.html'))
  }
  
}

function send(chanel, ...args) {
  win.webContents.send(chanel, ...args);
}

module.exports = {create, send}
