const EventEmitter = require('events');

const peer = new EventEmitter();

// 以下是 peer-puppet的代码
const { ipcRenderer, desktopCapturer } = require('electron');

// async function getScreenStream() {
//   const sources = await desktopCapturer.getSources({types: ['screen']});
//   navigator.webkitGetUserMedia({
//     audio: false,
//     video: {
//       mandatory: {
//         chromeMediaSource: 'desktop',
//         chromeMediaSourceId: sources[0].id,
//         maxWidth: window.screen.width,
//         maxHeight: window.screen.height
//       }
//     }
//   }, (stream) => {
//     peer.emit('add-stream', stream);
//   }, err => {
//     console.log(err);
//   })
// }

// getScreenStream();

// peer.on('robot', (type, data) => {
//   if (type === 'mouse') {
//     data.screen = {
//       width: window.screen.width, 
//       height: window.screen.height
//     };
//   }
//   ipcRenderer.send('robot', type, data);
// })

const pc = new window.RTCPeerConnection({});

let dc = pc.createDataChannel('robotchannel', {reliable: false});
dc.onopen = function() {
  console.log('opened');
  peer.on('robot', (type, data) => {
    dc.send(JSON.stringify({type, data}))
  })
}

dc.onmessage - function(event) {
  console.log('message', evnet);
}

dc.onerror = (e) => {
  console.log(e);
}

pc.onicecandidate = function(e) {
  console.log('candidate', JSON.stringify(e.candidate));
  if (e.candidate) {
    ipcRenderer.send('forward', 'control-candidate', e.candidate);
  }
};

ipcRenderer.on('candidate', (e, candidate) => {
  addIceCandidate(candidate);
})

let candidates = [];
async function addIceCandidate(candidate) {
  if (candidate) {
    candidates.push(candidate);
  }
  if (pc.remoteDescription && pc.remoteDescription.type) {
    for(let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    candidates = [];
  }
};

// window.addIceCandidate = addIceCandidate;

async function createOffer() {
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true
  });
  await pc.setLocalDescription(offer);
  console.log('pc offer', JSON.stringify(offer));
  return pc.localDescription
}

createOffer().then((offer) => {
  ipcRenderer.send('forward', 'offer', {type: offer.type, sdp: offer.sdp});
});

async function setRemote(answer) {
  await pc.setRemoteDescription(answer);
}

ipcRenderer.on('answer', (e, answer) => {
  setRemote(answer);
})

window.setRemote = setRemote;

pc.onaddstream = function(e) {
  console.log('add stream', e);
  peer.emit('add-stream', e.stream);
}

module.exports = peer;