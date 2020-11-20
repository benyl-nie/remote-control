const { ipcMain } = require('electron');
const robot = require('robotjs');
const vkey = require('vkey');

function handleMouse(data) {
  /**
   * data  {clientX, clientY screen: {width, height}, video: {width, height}}
   */
  const {clientX, clientY, screen, video} = data;

  let x = clientX * screen.width / video.width;
  let y = clientY * screen.height / video.height;
  robot.moveMouse(x, y);
  robot.mouseClick();
}

function handleKey(data) {
  /**
   * data {keyCode, meta, alt, ctrl, shift}
   */

  const {keyCode, meta, alt, ctrl, shift} = data;
  const modifiers = [];

  if (meta) modifiers.push('meta');
  if (alt) modifiers.push('alt');
  if (ctrl) modifiers.push('ctrl');
  if (shift) modifiers.push('shift');
  let key = vkey[data.keyCode].toLowerCase();
  if (key[0] !== '<') {
    robot.keyTap(key, modifiers);
  }
}

module.exports = function() {
  ipcMain.on('robot', (e, type, data) => {
    if(type === 'mouse') {
      handleMouse(data);
    } else if (type === 'key') {
      handleKey(data);
    }
  })
}