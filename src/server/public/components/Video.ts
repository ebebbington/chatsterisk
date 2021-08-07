import { createWebSocketClient } from "../js/socket-client.ts";
import { BaseComponent } from "./BaseComponent.ts";
import { AButton } from "./button.ts";
import { css, reactive, xml } from "./deps.ts";

const styling = `
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
`;

// deno-lint-ignore no-undef
class CVideo extends BaseComponent {
  private socket: WebSocket | null = null;

  #peerConnection = new RTCPeerConnection();

  #isAlreadyCalling = reactive(false);

  #callUser = reactive({
    socketId: "",
    hide: false,
    textContent: "Waiting for a friend...",
  });

  #endCall = reactive({
    hide: true,
  });

  #userVideo = reactive({
    srcObject: null,
  });

  #peerVideo = reactive({
    srcObject: "",
  });

  // TODO :: Once we can import destiny ts files and get type hints, remove this `as`
  static styles = [css`${styling}`] as unknown as never[];

  template = this.html(xml`
      <div id="video-chat">
      <video id="user-video" autoplay="true" playsinline="true" controls="true" prop:srcObject=${this.#userVideo.srcObject}></video>
      <span>
          <${AButton} prop:id=${"call-user"} prop:class=${`success ${
    this.#callUser.hide.value ? "hide" : ""
  }`} prop:value=${"call"} prop:text=${this.#callUser.textContent} on:click=${() =>
    this.handleCallUserClick()}></${AButton}>
          <${AButton} prop:id=${"end-call"} prop:class=${`error ${
    this.#endCall.hide.value ? "hide" : ""
  }`} prop:text=${"End Call"} on:click=${() =>
    this.handleEndCallClick()}></${AButton}>
      </span>
      <hr />
      <video id="peer-video" autoplay="true" playsinline="true" controls="true" src=${this.#peerVideo.srcObject}></video>
      </div>
    `);

  async connectedCallback() {
    await this.initialiseSocketClient();
    await this.registerListeners();
  }

  private handleCallUserClick() {
    //Notifier.success("Call User", "Calling user...");
    const id = this.#callUser.socketId.value;
    if (id) {
      this.callUser(id);
    }
  }

  private handleEndCallClick() {
    this.#peerConnection.close();
    window.location.href = "/chat";
  }

  private async initialiseSocketClient() {
    this.socket = await createWebSocketClient({ port: 1669 });
    this.socket!.onmessage = (message) => {
      if (message.data.indexOf("Connected to") > -1) {
        return false;
      }
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
    const theirId = this.#callUser.socketId.value;
    // If they have left e.g. no users, remove the src object
    if (theirId && !data.users.length) {
      //Notifier.warning("User Left", "User has left the room");
      this.#peerVideo.srcObject.value = null;
      this.#endCall.hide.value = false;
      this.#callUser.hide.value = true;
    }
    if (!theirId && data.users.length) {
      //Notifier.success("User Joined", "User has joined the room");
    }
    this.#callUser.textContent.value = data.users[0]
      ? "Call User!"
      : "Waiting for a friend...";
    this.#callUser.socketId.value = data.users[0];
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
    this.#peerConnection.createOffer().then(
      (offer: RTCSessionDescriptionInit) => {
        return this.#peerConnection.setLocalDescription(
          // deno-lint-ignore no-undef
          new RTCSessionDescription(offer),
        );
      },
    ).then(() => {
      this.socket!.send(
        JSON.stringify({
          to: "call-user",
          message: {
            offer: this.#peerConnection.localDescription,
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
    await this.#peerConnection.setRemoteDescription(
      // deno-lint-ignore no-undef
      new RTCSessionDescription(data.offer),
    );
    const answer = await this.#peerConnection.createAnswer();
    await this.#peerConnection.setLocalDescription(
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
    await this.#peerConnection.setRemoteDescription(
      // deno-lint-ignore no-undef
      new RTCSessionDescription(data.answer),
    );
    if (!this.#isAlreadyCalling.value) {
      this.callUser(data.socket);
      this.#isAlreadyCalling.value = true;
    }
    this.#isAlreadyCalling.value = false;
  }

  /**
   * @method displayMyVideoAndGetTracks
   *
   * @description
   * Display the users video and add the tracks to the peer connection
   */
  private async displayMyVideoAndGetTracks() {
    // Display stream and set tracks
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.#userVideo.srcObject.value = stream;
    const tracks: MediaStreamTrack[] = stream.getTracks();
    tracks.forEach((track: MediaStreamTrack) => {
      this.#peerConnection.addTrack(track, stream);
    });
  }

  private async registerListeners() {
    await this.displayMyVideoAndGetTracks();

    // Listen for peer connections
    this.#peerConnection.ontrack = ({ streams: [stream] }) => {
      this.#peerVideo.srcObject.value = stream;
      this.#callUser.hide.value = true;
      this.#endCall.hide.value = false;
    };

    this.#peerConnection.oniceconnectionstatechange = () => {
      if (
        this.#peerConnection.iceConnectionState === "failed" ||
        this.#peerConnection.iceConnectionState === "disconnected" ||
        this.#peerConnection.iceConnectionState === "closed"
      ) {
        this.#peerVideo.srcObject.value = null;
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
  }
}
export { CVideo };
