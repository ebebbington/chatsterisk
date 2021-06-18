import {
  Component,
  register,
} from "https://code.okku.dev/destiny-ui/v0.6.0/dist/mod.js";
import { createWebSocketClient } from "../js/socket-client.ts";

// todo :: users online events dont work

register(
  class CChat extends Component {
    private client: WebSocket | null = null;
    private messageToSend = "";
    private messagesReceived: Array<{ username: string; message: string }> = [];
    private username = "";
    private usersOnline: string[] = [];
    private showUsers = false;

    constructor() {
      super();
      console.log("hello :)");
    }

    async connectedCallback() {
      console.log("connected");
      this.render();
      this.createEventListeners();
      await this.initialiseSocketClient();
      if (!this.username) {
        const username = prompt("Your username:") || "Guest user";
        this.username = username;
        this.client!.send(JSON.stringify({
          send_packet: {
            to: "user-joined",
            message: {
              username,
            },
          },
        }));
      }
    }

    private createEventListeners() {
      window.onbeforeunload = () => {
        this.client!.send(JSON.stringify({
          send_packet: {
            to: "user-left",
            message: {
              username: this.username,
            },
          },
        }));
      };
      document.querySelector("h2")!.addEventListener(
        "click",
        () => {
          console.log("yo moma");
          this.showUsers = true;
          this.render();
        },
      );
      this.querySelector(".chatHolder > .header > .status i")!.addEventListener(
        "mouseleave",
        () => {
          this.showUsers = false;
          this.render();
        },
      );
      document.querySelector("body")!.addEventListener(
        "keyup",
        (event) => {
          // deno-lint-ignore ban-ts-comment
          // @ts-ignore
          if (event.target.id !== "message") {
            return;
          }
          // deno-lint-ignore ban-ts-comment
          // @ts-ignore
          const value = event.target.value;
          this.messageToSend = value;
        },
      );
      document.querySelector("body")!.addEventListener(
        "click",
        (event) => {
          // deno-lint-ignore ban-ts-comment
          // @ts-ignore
          if (event.target.id !== "send-chat-message") {
            return;
          }
          this.client!.send(JSON.stringify({
            send_packet: {
              to: "chat-message",
              message: {
                username: this.username,
                message: this.messageToSend,
              },
            },
          }));
          this.messageToSend = "";
          const inputElem: HTMLInputElement | null = this.querySelector(
            ".chatHolder input",
          );
          if (inputElem) inputElem!.value = "";
        },
      );
    }

    private async initialiseSocketClient() {
      this.client = await createWebSocketClient({ port: 1670 });
      this.client.send(JSON.stringify({
        connect_to: [
          "user-joined",
          "chat-message",
          "users-online",
          "user-left",
        ],
      }));
      this.client.onmessage = (msg) => {
        console.log("got msg");
        if (msg.data.indexOf("Connected to") > -1) {
          return;
        }
        const data = JSON.parse(msg.data); // { from, to, message }
        console.log(data);
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
      this.usersOnline = newUserList;
      this.render();
    }

    private handleWSChatMessage(
      messagePayload: { type: string; username: string; message: string },
    ) {
      const { type, username, message } = messagePayload;
      console.log("handle chat message", type, username, message);
      if (type === "add") {
        this.messagesReceived.push({ username, message });
      }
      this.render();
    }

    private render() {
      console.log("render");
      let html = `<div class="chatHolder">
        <div class="header">
          <div class="status">
            <i class="fa fa-circle"></i>`;
      if (this.showUsers) {
        html += `<ul class="userList">`;
        this.usersOnline.forEach((username, index) => {
          html += `<li key=${index}>${username}</li>`;
        });
        html += "</ul>";
      }
      html += `<p>${this.usersOnline.length} online</p>
          </div>
          <h2>${this.username}</h2>
        </div>
        <div class="body">`;
      this.messagesReceived.forEach((message, index) => {
        html += `<div key=${index}>
                <strong>
                  <p>${message.username}</p>
                </strong>
                <p>${message.message}</p>
              </div>`;
      });
      html += `</div>
        <div class="footer">
          <label for="message" hidden>
            Message
          </label>
          <input
            id="message"
            type="text"
            placeholder="Type something => ENTER"
            class="messageInput form-control"
          />
          <a-button id="send-chat-message">Send</button>
        </div>
      </div>
`;
      this.innerHTML = html;
    }
  },
);
