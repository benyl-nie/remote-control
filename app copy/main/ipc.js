const { ipcMain } = require('electron');
const {send: sendMainWindow} = require('./windows/main');
const { create: createControlWindow, send: sendControlWindow } = require('./windows/control');

const signal = require('./signal');


module.exports = function() {
  ipcMain.handle('login', async () => {
    // let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    let { code } = await signal.invoke('login', null, 'logined');
    return code;
  })

  ipcMain.on('control', async (e, remote) => {
    signal.send('control', {remote});
  })

  signal.on('controlled', (data) => {
    sendMainWindow('control-state-change', data.remote, 1);
    createControlWindow();
  })

  signal.on('be-controlled', (data) => {
    sendMainWindow('control-state-change', data.remote, 2);
  })

  // 信令  puppet, control 共享的信道 即转发
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', {event, data});
  })

  // 收到offer puppet响应
  signal.on('offer', (data) => {
    sendMainWindow('offer', data);
  })

  // 收到puppet证书，answer响应
  signal.on('answer', (data) => {
    sendControlWindow('answer', data);
  });

  // 收到control证书，answer响应
  signal.on('puppet-candidate', (data) => {
    sendControlWindow('candidate', data);
  })

  signal.on('control-candidate', (data) => {
    sendMainWindow('candidate', data);
  })
}