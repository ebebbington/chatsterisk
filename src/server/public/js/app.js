function handleGetExtensions(message) {
    const extensions = message;
    const $extensionToCallFrom = document.getElementById("extension-to-call-from");
    const $extensionToCallTo = document.getElementById("extension-to-call-to");
    message.forEach((extension)=>{
        let $option;
        $option = document.createElement("option");
        $option.value = extension;
        $option.innerText = extension;
        $extensionToCallFrom.appendChild($option);
        $option = document.createElement("option");
        $option.value = extension;
        $option.innerText = extension;
        $extensionToCallTo.appendChild($option);
    });
}
function deferred() {
    let methods;
    const promise = new Promise((resolve, reject)=>{
        methods = {
            resolve,
            reject
        };
    });
    return Object.assign(promise, methods);
}
async function createWebSocketClient(options) {
    const prom = deferred();
    const client = new WebSocket("ws://0.0.0.0:1668");
    client.onopen = function() {
        prom.resolve();
    };
    client.onerror = function(e) {
        console.log("client got error");
        console.log(e);
    };
    await prom;
    console.log("ws client connected");
    return client;
}
async function init() {
    const socket = await createWebSocketClient({
        port: 1669
    });
    socket.onmessage = function(message) {
        const data = JSON.parse(message.data);
        switch(data.to){
            case "room":
                handleRoom(data.message);
                break;
            case "call-made":
                handleCallMade(data.message);
                break;
            case 'answer-made':
                handleAnswerMade(data.message);
                break;
            default: break;
        }
    };
    const peerConnection = new RTCPeerConnection();
    let isAlreadyCalling = false;
    function handleRoom(data) {
        const callUserElement = document.getElementById("call-user");
        const theirId = callUserElement.dataset.socketId;
        if (theirId && !data.users.length) {
            const peerVideoElement = document.querySelector("video#peer-video");
            peerVideoElement.srcObject = null;
            const endCallElement = document.getElementById("end-call");
            callUserElement.classList.remove("hide");
            endCallElement.classList.add("hide");
        }
        if (!theirId && data.users.length) {
        }
        callUserElement.textContent = data.users[0] ? "Call User!" : "Waiting for a friend...";
        callUserElement.dataset.socketId = data.users[0];
    }
    function callUser(socketId) {
        peerConnection.createOffer().then((offer)=>{
            return peerConnection.setLocalDescription(new RTCSessionDescription(offer));
        }).then(()=>{
            socket.send(JSON.stringify({
                to: "call-user",
                message: {
                    offer: peerConnection.localDescription,
                    to: socketId
                }
            }));
        });
    }
    async function handleCallMade(data) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        socket.send(JSON.stringify({
            to: "make-answer",
            message: {
                answer,
                to: data.socket
            }
        }));
    }
    async function handleAnswerMade(data) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        if (!isAlreadyCalling) {
            callUser(data.socket);
            isAlreadyCalling = true;
        }
        isAlreadyCalling = false;
    }
    function displayMyVideoAndGetTracks() {
        navigator.getUserMedia({
            video: true,
            audio: true
        }, (stream)=>{
            const localVideo = document.getElementById("user-video");
            if (localVideo) {
                localVideo.srcObject = stream;
            }
            const tracks = stream.getTracks();
            tracks.forEach((track)=>{
                peerConnection.addTrack(track, stream);
            });
        }, (error)=>{
            console.warn(error.message);
        });
    }
    window.addEventListener("DOMContentLoaded", function() {
        displayMyVideoAndGetTracks();
        peerConnection.ontrack = function({ streams: [stream]  }) {
            const remoteVideo = document.getElementById("peer-video");
            if (remoteVideo) {
                remoteVideo.srcObject = stream;
                const callUserElement = document.getElementById("call-user");
                const endCallElement = document.getElementById("end-call");
                callUserElement.classList.add("hide");
                endCallElement.classList.remove("hide");
            }
        };
        peerConnection.oniceconnectionstatechange = function(data) {
            if (peerConnection.iceConnectionState === "failed" || peerConnection.iceConnectionState === "disconnected" || peerConnection.iceConnectionState === "closed") {
                const peerVideo = document.querySelector("video#peer-video");
                peerVideo.srcObject = null;
                window.location.href = "/chat";
            }
        };
        socket.send(JSON.stringify({
            send_packet: {
                to: "room"
            }
        }));
        document.getElementById("call-user").addEventListener("click", function(event) {
            const callUserElement = document.getElementById("call-user");
            const id = callUserElement.dataset.socketId;
            if (!id) {
                return false;
            }
            callUser(id);
        });
        document.getElementById("end-call").addEventListener("click", function() {
            peerConnection.close();
            window.location.href = "/chat";
        });
    });
}
const VideoPage = {
    init: init
};
async function init1() {
    const client = await createWebSocketClient({
        port: 1668
    });
    client.send(JSON.stringify({
        connect_to: [
            "get-extensions",
            "make-call"
        ]
    }));
    client.onmessage = function(msg) {
        if (msg.data.indexOf("Connected to") > -1) {
            return;
        }
        const data = JSON.parse(msg.data);
        data.message = JSON.parse(data.message);
        if (data.to === "get-extensions") {
            handleGetExtensions(data.message);
        }
    };
    client.send(JSON.stringify({
        send_packet: {
            to: "get-extensions",
            data: ""
        }
    }));
    document.getElementById("extension-to-call-from").addEventListener("change", function() {
        const chosenExtension = document.getElementById("extension-to-call-from").value;
        const $options = document.querySelectorAll("select#extension-to-call-to option");
        $options.forEach(($option)=>{
            if ($option.value === chosenExtension) {
                $option.classList.add("hide");
            } else {
                $option.classList.remove("hide");
            }
        });
    });
    document.getElementById("extension-to-call-to").addEventListener("change", function(event) {
        const chosenExtension = document.getElementById("extension-to-call-to").value;
        const $options = document.querySelectorAll("select#extension-to-call-from option");
        $options.forEach(($option)=>{
            if ($option.value === chosenExtension) {
                $option.classList.add("hide");
            } else {
                $option.classList.remove("hide");
            }
        });
    });
    document.getElementById("initiate-call").addEventListener("click", function(event) {
        const from = document.getElementById("extension-to-call-from").value;
        const to = document.getElementById("extension-to-call-to").value;
        client.send(JSON.stringify({
            send_packet: {
                to: "make-call",
                message: {
                    to_extension: Number(to),
                    from_extension: Number(from)
                }
            }
        }));
    });
}
const CallPage = {
    init: init1
};
window.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname === "/video") {
        VideoPage.init();
    }
    if (window.location.pathname === "/call") {
        CallPage.init();
    }
});
