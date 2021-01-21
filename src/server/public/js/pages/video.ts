import { createWebSocketClient } from "../modules/socket-client.ts";

async function init() {
  const socket = await createWebSocketClient({ port: 1669 });
  socket.onmessage = function (message) {
    const data = JSON.parse(message.data);
    switch (data.to) {
      case "room":
        handleRoom(data.message);
        break;
      case "call-made":
        handleCallMade(data.message);
        break;
      case "answer-made":
        handleAnswerMade(data.message);
        break;
      default:
        break;
    }
  };

  const peerConnection = new RTCPeerConnection();
  let isAlreadyCalling = false;

  /**
 * @method handleRoom
 *
 * @description
 * Handles the event/callback of the `room` message.
 * Updates the UI, such as the user ids. The `room` event is sent each time a user joins or leaves
 *
 * @param {object}      data        Data sent back from the socket server
 * @param {string}      data.myId   Your socket id
 * @param {string[]}    data.users  List of other users in the room. Empty is no other users
 * @param {string}      data.name   Name of the socket room you're in
 *
 */
  function handleRoom(
    data: {
      readonly myId: string;
      readonly users: string[];
      readonly name: string;
    },
  ) {
    // Check the id elem text to see if a user was on the page
    const callUserElement = document.getElementById("call-user");
    const theirId = callUserElement!.dataset.socketId;
    // If they have left e.g. no users, remove the src object
    if (theirId && !data.users.length) {
      //Notifier.warning("User Left", "User has left the room");
      const peerVideoElement: HTMLVideoElement | null = document.querySelector(
        "video#peer-video",
      );
      peerVideoElement!.srcObject = null;
      const endCallElement = document.getElementById("end-call");
      callUserElement!.classList.remove("hide");
      endCallElement!.classList.add("hide");
    }
    if (!theirId && data.users.length) {
      //Notifier.success("User Joined", "User has joined the room");
    }
    callUserElement!.textContent = data.users[0]
      ? "Call User!"
      : "Waiting for a friend...";
    callUserElement!.dataset.socketId = data.users[0];
  }

  /**
 * @method callUser
 *
 * @description
 * Make a WebRTC call to a user using their socket id, and send it through the socket server
 *
 * @param {string} socketId The other persons socket id
 */
  function callUser(socketId: string) {
    peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
      return peerConnection.setLocalDescription(
        new RTCSessionDescription(offer),
      );
    }).then(() => {
      socket.send(
        JSON.stringify({
          to: "call-user",
          message: {
            offer: peerConnection.localDescription,
            to: socketId,
          },
        }),
      );
    });
  }

  /**
 * @method handleCallMade
 *
 * @description
 * Handle the event for `call-made` from the socket. Answer the call
 *
 * @param {object}  data        The data passed back from the event
 * @param {any}     data.offer  The offer for the call
 * @param {string}  data.socket Socket id trying to call
 */
  async function handleCallMade(data: { offer: any; socket: string }) {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer),
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(
      new RTCSessionDescription(answer),
    );
    socket.send(
      JSON.stringify({
        to: "make-answer",
        message: {
          answer,
          to: data.socket,
        },
      }),
    );
  }

  /**
 * @method handleAnswerMade
 *
 * @description
 * Handler for socket event of `answer-made`. Calls the user
 *
 * @param {object}  data            The data passed back from the event
 * @param {any}     data.answer     The answer object for the call
 * @param {string}  data.socket     Socket id trying to call
 */
  async function handleAnswerMade(
    data: { answer: any; socket: string },
  ): Promise<void> {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer),
    );
    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }
    isAlreadyCalling = false;
  }

  /**
 * @method displayMyVideoAndGetTracks
 *
 * @description
 * Display the users video and add the tracks to the peer connection
 */
  function displayMyVideoAndGetTracks() {
    // Display stream and set tracks
    navigator.getUserMedia(
      { video: true, audio: true },
      (stream) => {
        const localVideo: any = document.getElementById("user-video");
        if (localVideo) {
          localVideo.srcObject = stream;
        }

        const tracks: MediaStreamTrack[] = stream.getTracks();
        tracks.forEach((track: MediaStreamTrack) => {
          peerConnection.addTrack(track, stream);
        });
      },
      (error) => {
        console.warn(error.message);
      },
    );
  }

  window.addEventListener("DOMContentLoaded", function () {
    // Must be first
    displayMyVideoAndGetTracks();

    // Listen for peer connections
    peerConnection.ontrack = function ({ streams: [stream] }) {
      const remoteVideo: any = document.getElementById("peer-video");
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
        const callUserElement = document.getElementById("call-user");
        const endCallElement = document.getElementById("end-call");
        callUserElement!.classList.add("hide");
        endCallElement!.classList.remove("hide");
      }
    };

    peerConnection.oniceconnectionstatechange = function (data: any) {
      if (
        peerConnection.iceConnectionState === "failed" ||
        peerConnection.iceConnectionState === "disconnected" ||
        peerConnection.iceConnectionState === "closed"
      ) {
        const peerVideo: HTMLVideoElement | null = document.querySelector(
          "video#peer-video",
        );
        peerVideo!.srcObject = null;
        window.location.href = "/chat";
      }
    };

    socket.send(JSON.stringify({
      send_packet: {
        to: "room",
      },
    }));

    document.getElementById("call-user")!.addEventListener(
      "click",
      function (event: any) {
        const callUserElement = document.getElementById("call-user");
        //Notifier.success("Call User", "Calling user...");
        const id = callUserElement!.dataset.socketId;
        if (!id) {
          return false;
        }
        callUser(id);
      },
    );

    document.getElementById("end-call")!.addEventListener(
      "click",
      function () {
        //Loading(true);
        peerConnection.close();
        window.location.href = "/chat";
      },
    );
  });
}

export const VideoPage = {
  init: init,
};
