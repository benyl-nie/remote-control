const peer = require('./peer-control');

peer.on('add-stream', (stream) => {
  play(stream);
})

let video = document.getElementById('screen-video');


function play(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = function() {
    video.play();
  }
}

window.onkeydown = function(e) {
  let data = {
    keyCode: e.keyCode,
    shift: e.shiftKey,
    meta: e.metaKey,
    ctrl: e.ctrlKey,
    alt: e.altKey
  };

  console.log('data onkeydown', data);

  peer.emit('robot', 'key', data);
}

window.onmouseup = function(e) {
  let data = {
    clientX: e.clientX,
    clientY: e.clientY,
    video: {
      width: video.getBoundingClientRect().width,
      height: video.getBoundingClientRect().height
    }
  };

  console.log('data onmouseup', data);
  peer.emit('robot', 'mouse', data);
}