const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: 3001
});
console.log(`myPeer: \n destroyed: ${myPeer.destroyed}\n disconnected: ${myPeer.disconnected}\n id: ${myPeer.id}\n open: ${myPeer.open}\n options: ${Object.keys(myPeer.options)}\n socket: ${Object.keys(myPeer.socket)}`);

const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    myPeer.on('call', call => {
        console.log(`We got a call!`);
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });
    socket.on('new-user-connected', userId => {
        if (userId != myPeer.id) {
            console.log("New user: " + userId);
            connectToNewUser(userId, stream);
        }
    });
    // socket.on('user-connected', userId => {
    //     connectToNewUser(userId, stream);
    // });
    socket.emit('connection-request', ROOM_ID, myPeer.id);
});

socket.on('user-disconnected', userId => {
    console.log(`user-disconnected: ${userId}`);
    if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
    console.log(`join: ${id}`);
    socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    //When the other user connects, it sends us their stream
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}