const { BrowserWindow } = require('electron');
const path = require('path');

function create() {
  let win;
  win = new BrowserWindow({
    width: 1080,
    height: 680,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.webContents.openDevTools();
  win.loadFile(path.resolve(__dirname, '../../renderer/pages/control/index.html'))
}

module.exports = {create}
