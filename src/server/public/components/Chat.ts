import {
  Component,
  register,
  reactive,
  html,
  css,
  computed
} from "https://code.okku.dev/destiny-ui/v0.6.0/dist/mod.js";
import { openClient } from "../js/socket-client.ts";
import { AButton } from "./button.ts"

/**
 * General tips when writing destiny components:
 * 
 * - Use es private properties to avoid conflicts, as outlined by destiny itself
 */

register(
  // @ts-ignore
  class CChat extends Component {
    #client: WebSocket = new WebSocket("ws://127.0.0.1:1670?test_param=test_value");
    #messageToSend = reactive("");
    #messagesReceived: Array<{ username: string; message: string }> = reactive([]);
    #username = reactive("Guest User");
    #usersOnline = reactive([]);
    #showUsers = reactive("false");

    async connectedCallback() {
      window.onbeforeunload = () => {
        this.#client!.send(JSON.stringify({
          send_packet: {
            to: "user-left",
            message: {
              username: this.#username.value,
            },
          },
        }));
      }
      await this.initialiseSocketClient();
      const username = prompt("Your username:");
      this.#username.value = username ?? this.#username.value
      this.#client.send(JSON.stringify({
        send_packet: {
          to: "user-joined",
          message: {
            username: this.#username.value,
          },
        },
      }));
    }

    private async initialiseSocketClient() {
      await openClient(this.#client)
      this.#client.send(JSON.stringify({
        connect_to: [
          "user-joined",
          "chat-message",
          "users-online",
          "user-left",
        ],
      }));
      this.#client.onmessage = (msg) => {
        console.log("got msg");
        if (msg.data.indexOf("Connected to") > -1) {
          return;
        }
        const data = JSON.parse(msg.data);
        data.message = JSON.parse(data.message);
        switch (data.to) {
          case "chat-message":
            this.handleWSChatMessage({
              type: "add",
              username: data.message.username,
              message: data.message.message,
            });
            break;
          case "users-online":
            this.handleWSUsersOnline(data.message.usersOnline);
            break;
        }
      };
    }

    private handleWSUsersOnline(newUserList: string[]) {
      this.#usersOnline.value = newUserList;
    }

    private handleWSChatMessage(
      messagePayload: { type: string; username: string; message: string },
    ) {
      const { type, username, message } = messagePayload;
      console.log("handle chat message", type, username, message);
      if (type === "add") {
        this.#messagesReceived.push({ username, message });
      }
    }

    private handleSendMessageButtonClick() {
      this.#client.send(JSON.stringify({
        send_packet: {
          to: "chat-message",
          message: {
            username: this.#username.value,
            message: this.#messageToSend.value,
          },
        },
      }));
      this.#messageToSend.value = "";
    }

    static styles = css`
    /* Chat */
    /* Container*/
    .chatHolder {
        padding: 1em;
        border: 1px solid var(--custom-white);
        border-radius: 5px;
      }
      /* header container */
      .header {
        display: flex;
        padding: 0.5em;
        background-color: var(--custom-white);
        border-bottom: 5px solid var(--custom-blue);
      }
      /* Status bar inside header (icon and user count */
      .header > .status {
        display: flex;
        margin-right: 0.5em;
      }
      /* Icon inside header status */
      .header > .status > i {
        text-align: left;
        color: var(--custom-green);
        height: 20px;
        width: 20px;
        background: black;
        border-radius: 50%;
      }
      /* Icon and text inside header status */
      .header > .status > i,
      .header > .status > p {
        margin-top: auto;
        margin-bottom: auto;
      }
      /* status text */
      .header > .status > p {
        margin-left: 0.5em;
      }
      .header > .status > ul {
        position: absolute;
        z-index: 99999;
        margin-top: 3.5em;
        /* margin: auto; */
        /* left: 36px; */ 
        /* top: 51px; */
        background: var(--custom-grey);
        list-style-type: none;
        padding: 0;
        box-shadow: 0px 1px 9px 3px;
        border-radius: 5px;
      }
      .header > .status > ul li {
        padding: 0.3em;
        color: var(--custom-green);
      }
      /* Username */
      .header > h3 {
        margin: auto 0 auto auto;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 58%;
        text-align: right;
      }
      /* Chat feed */
      .body {
        min-height: 300px;
        max-height: 300px;
        background-color: var(--custom-white);
        border-radius: 5px;
        margin-bottom: 1em;
        overflow-y: scroll;
      }
      .body > div {
        border-bottom: 1px solid var(--custom-blue);
        display: flex;
        padding: 0.5em;
      }
      .body > div > strong {
        border-right: 1px solid var(--custom-green);
        padding-right: 0.5em;
        margin: auto 0 auto 0;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .body > div > strong > p {
        margin: auto;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .body > div > p {
        margin: auto auto auto 0.5em;
        word-break: break-word;
        width: 80%;
      }
      /* Message field and buttons container */
      .footer {
        text-align: center;
      }
      .footer button {
        margin-top: 0.5em;
      }
    `

    template = html`
    <div class="chatHolder">
      <div class="header">
        <div class="status">
          <i class="fa fa-circle" on:mouseenter=${() => this.#showUsers.value = "true"} on:mouseleave=${() => this.#showUsers.value = "false"}></i>
        ${computed(() => { if (this.#showUsers.value === "true") return html`
          <ul>
          ${this.#usersOnline.map((username: string) => html`
            <li>${username}</li>
          `)}
          </ul>`
        })}
          <p>${this.#usersOnline.length} online</p>
        </div>
        <h2>${this.#username}</h2>
      </div>
      <div class="body">
    ${this.#messagesReceived.map(message => html`
        <div>
          <strong>
            <p>${message.username}</p>
          </strong>
          <p>${message.message}</p>
        </div>
    `)}
      </div>
      <div class="footer">
        <label for="message" hidden="hidden">Message</label>
        <input id="message" type="text" placeholder="Talk" class="messageInput form-control" prop:value=${this.#messageToSend} />
        <a-button id="send-chat-message" on:click=${() => this.handleSendMessageButtonClick()}>Send</a-button>
      </div>
    </div>
`;
  }
);
