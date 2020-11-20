const { app, ipcMain } = require('electron');
const handleIPC = require('./ipc');
const { create: createMainWindow } = require('./windows/main');
const { create: createControlWindow } = require('./windows/control');

app.on('ready', () => {
  createMainWindow();
  handleIPC();
  require('./robot.js')
});
