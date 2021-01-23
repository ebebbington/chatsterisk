import { register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";
import { createWebSocketClient } from "../js/socket-client.ts";

// deno-lint-ignore no-undef
const peerConnection = new RTCPeerConnection();
let isAlreadyCalling = false;

const styling = `
<style>
#video-chat > video {
    height: 200px;
}
#video-chat > #user-video {
    position: fixed;
    left: 2px;
    bottom: 2px;
}
#video-chat > #peer-video {
    width: 100%;
    height: auto;
}
</style>`;

register(
  // deno-lint-ignore no-undef
  class CVideo extends HTMLElement {
    private socket: WebSocket | null = null;

    async connectedCallback() {
      this.innerHTML = `${styling}<div id="video-chat">
    <video id="user-video" autoplay playsinline controls></video>
    <span>
        <a-button id="call-user" class="success" value="call">Waiting for a friend...</a-button>
        <a-button id="end-call" class="error hide">End Call</a-button>
    </span>
    <hr>
    <video id="peer-video" autoplay playsinline controls></video>
</div>
`;
      await this.initialiseSocketClient();
      this.registerListeners();
    }

    private async initialiseSocketClient() {
      this.socket = await createWebSocketClient({ port: 1669 });
      this.socket!.onmessage = (message) => {
        if (message.data.indexOf("Connected to") > -1) {
          return false;
        }
        console.log(message.data);
        const data = JSON.parse(message.data);
        switch (data.to) {
          case "room":
            this.handleRoom(data.message);
            break;
          case "call-made":
            this.handleCallMade(data.message);
            break;
          case "answer-made":
            this.handleAnswerMade(data.message);
            break;
          default:
            break;
        }
      };
    }

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
    private handleRoom(
      data: {
        readonly myId: string;
        readonly users: string[];
        readonly name: string;
      },
    ) {
      // Check the id elem text to see if a user was on the page
      const callUserElement = this.querySelector("#call-user");
      const theirId = callUserElement!.getAttribute("socket-id");
      // If they have left e.g. no users, remove the src object
      if (theirId && !data.users.length) {
        //Notifier.warning("User Left", "User has left the room");
        const peerVideoElement: HTMLVideoElement | null = this.querySelector(
          "video#peer-video",
        );
        peerVideoElement!.srcObject = null;
        const endCallElement = this.querySelector("#end-call");
        callUserElement!.classList.remove("hide");
        endCallElement!.classList.add("hide");
      }
      if (!theirId && data.users.length) {
        //Notifier.success("User Joined", "User has joined the room");
      }
      callUserElement!.textContent = data.users[0]
        ? "Call User!"
        : "Waiting for a friend...";
      callUserElement!.setAttribute("socketId", data.users[0]);
    }

    /**
   * @method callUser
   *
   * @description
   * Make a WebRTC call to a user using their socket id, and send it through the socket server
   *
   * @param {string} socketId The other persons socket id
   */
    private callUser(socketId: string) {
      peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
        return peerConnection.setLocalDescription(
          // deno-lint-ignore no-undef
          new RTCSessionDescription(offer),
        );
      }).then(() => {
        this.socket!.send(
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
    private async handleCallMade(
      data: { offer: RTCSessionDescriptionInit; socket: string },
    ) {
      await peerConnection.setRemoteDescription(
        // deno-lint-ignore no-undef
        new RTCSessionDescription(data.offer),
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(
        // deno-lint-ignore no-undef
        new RTCSessionDescription(answer),
      );
      this.socket!.send(
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
    private async handleAnswerMade(
      data: { answer: RTCSessionDescriptionInit; socket: string },
    ): Promise<void> {
      await peerConnection.setRemoteDescription(
        // deno-lint-ignore no-undef
        new RTCSessionDescription(data.answer),
      );
      if (!isAlreadyCalling) {
        this.callUser(data.socket);
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
    private displayMyVideoAndGetTracks() {
      // Display stream and set tracks
      // deno-lint-ignore no-undef
      navigator.getUserMedia(
        { video: true, audio: true },
        (stream) => {
          const localVideo: HTMLVideoElement | null = this.querySelector(
            "#user-video",
          );
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

    private registerListeners() {
      this.displayMyVideoAndGetTracks();

      // Listen for peer connections
      peerConnection.ontrack = ({ streams: [stream] }) => {
        const remoteVideo: HTMLVideoElement | null = this.querySelector(
          "#peer-video",
        );
        if (remoteVideo) {
          remoteVideo.srcObject = stream;
          const callUserElement = this.querySelector("#call-user");
          const endCallElement = this.querySelector("#end-call");
          callUserElement!.classList.add("hide");
          endCallElement!.classList.remove("hide");
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        if (
          peerConnection.iceConnectionState === "failed" ||
          peerConnection.iceConnectionState === "disconnected" ||
          peerConnection.iceConnectionState === "closed"
        ) {
          const peerVideo: HTMLVideoElement | null = this.querySelector(
            "video#peer-video",
          );
          peerVideo!.srcObject = null;
          window.location.href = "/chat";
        }
      };

      this.socket!.send(JSON.stringify({
        connect_to: ["room"],
      }));
      this.socket!.send(JSON.stringify({
        send_packet: {
          to: "room",
        },
      }));

      this.querySelector("#call-user")!.addEventListener(
        "click",
        () => {
          const callUserElement = this.querySelector("call-user");
          //Notifier.success("Call User", "Calling user...");
          const id = callUserElement!.getAttribute("socketId");
          if (!id) {
            return false;
          }
          this.callUser(id);
        },
      );

      this.querySelector("#end-call")!.addEventListener(
        "click",
        function () {
          //Loading(true);
          peerConnection.close();
          window.location.href = "/chat";
        },
      );
    }
  },
);
