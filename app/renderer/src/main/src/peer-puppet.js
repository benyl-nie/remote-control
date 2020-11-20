// // createAnswer
// // addstream

// //  傀儡端
// const { desktopCapturer, ipcRenderer } = require('electron');

// async function getScreenStream() {
//   const sources = await desktopCapturer.getSources({types: ['screen']});
//   return new Promise((resolve, reject) => {
//     navigator.webkitGetUserMedia({
//       audio: false,
//       video: {
//         mandatory: {
//           chromeMediaSource: 'desktop',
//           chromeMediaSourceId: sources[0].id,
//           maxWidth: window.screen.width,
//           maxHeight: window.screen.height
//         }
//       }
//     }, (stream) => {
//       // peer.emit('add-stream', stream);
//       resolve(stream);
//     }, err => {
//       console.log(err);
//     })
//   })
// }

// const pc = new window.RTCPeerConnection({});

// // pc.onicecandidate = function(e) {
// //   console.log('candidate', JSON.stringify(e.candidate));
// // };
// pc.onicecandidate = function(e) {
//   console.log('candidate', JSON.stringify(e.candidate));
//   if (e.candidate) {
//     ipcRenderer.send('forward', 'puppet-candidate', e.candidate);
//   }
// };

// ipcRenderer.on('candidate', (e, candidate) => {
//   addIceCandidate(candidate);
// })


// let candidates = [];
// async function addIceCandidate(candidate) {
//   if (candidate) {
//     candidates.push(candidate);
//   }
//   if (pc.remoteDescription && pc.remoteDescription.type) {
//     for(let i = 0; i < candidates.length; i++) {
//       await pc.addIceCandidate(new RTCIceCandidate(candidate));
//     }
//     candidates = [];
//   }
// };
// window.addIceCandidate = addIceCandidate;

// ipcRenderer.on('offer', async (e, offer) => {
//   let answer = await createAnswer(offer);

//   ipcRenderer.send('forward', 'answer', {type: answer.type, sdp: answer.sdp});
// })

// async function createAnswer(offer) {
//   let screenStream = await getScreenStream();
//   pc.addStream(screenStream);
//   await pc.setRemoteDescription(offer);
//   await pc.setLocalDescription(await pc.createAnswer());
//   console.log('answer', JSON.stringify(pc.localDescription));
//   return pc.localDescription;
// }

// window.createAnswer = createAnswer;

import EventEmitter from 'events'
import {ipcRenderer, desktopCapturer} from 'electron'
let peer = new EventEmitter()
window.peer = peer // 为了直接模拟过程，信令结束后，会删掉
ipcRenderer.on('offer', (e, offer) => {
    console.log('init pc', offer)
    const pc = new window.RTCPeerConnection();
	
    pc.ondatachannel = (e) => {
        console.log('data', e)
		e.channel.onmessage = (e)  => {
			console.log('onmessage', e, JSON.parse(e.data))
           let {type, data} = JSON.parse(e.data)
            console.log('robot', type, data)
            if(type === 'mouse') {
                data.screen = {
                    width: window.screen.width, 
                    height: window.screen.height
                }
            }
            ipcRenderer.send('robot', type, data)
		}
	}

    async function getScreenStream() {
        const sources = await desktopCapturer.getSources({types: ['screen']})
        return new Promise((resolve, reject) => {
            navigator.webkitGetUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sources[0].id,
                        maxWidth: window.screen.width,
                        maxHeight: window.screen.height
                    }
                }
            }, (stream) => {
                console.log('add-stream', stream)
                resolve(stream)
            }, reject)
        })
    }
    
    pc.onicecandidate = (e) => {
        // 告知其他人
        ipcRenderer.send('forward', 'puppet-candidate', e.candidate)
    }

	async function addIceCandidate(candidate) {
        if(!candidate || !candidate.type) return
		await pc.addIceCandidate(new RTCIceCandidate(candidate))
	}
	window.addIceCandidate = addIceCandidate

    async function createAnswer(offer) {
        let stream = await getScreenStream()
        pc.addStream(stream)
        await pc.setRemoteDescription(offer);
        await pc.setLocalDescription(await pc.createAnswer());
        console.log('create answer \n', JSON.stringify(pc.localDescription))
        // send answer
        return pc.localDescription
    }
    createAnswer(offer).then((answer) => {
        ipcRenderer.send('forward', 'answer', {type: answer.type, sdp: answer.sdp})
    })
	
})
export default peer


