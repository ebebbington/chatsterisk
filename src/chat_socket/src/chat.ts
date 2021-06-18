import { DrashSocketServer } from "../deps.ts";
import type { Packet } from "../deps.ts"

interface ReceivedChatMessage {
  username: string
  message: string
}

interface ReceivedUser {
  username: string
}

export class Chat {
  /**
   * To create our socket server
   */
  private readonly Socket: DrashSocketServer;

  private usersOnline: string[] = []

  /**
   * Connection configs for the socket server
   */
  private readonly socket_configs = {
    hostname: "chat_socket",
    port: 1670,
  };

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor() {
    this.Socket = new DrashSocketServer();
  }

  public async start() {
    await this.Socket.run(this.socket_configs);

    this.Socket.on("connect", () => {
      console.log('connected')
    })
    this.Socket.on("disconnect", () => {
      console.log('disconnected')
    })

    this.Socket.on("users-online", () => {})

    this.Socket.on("chat-message", (packet: Packet) => {
      const { username, message } = packet.message as ReceivedChatMessage
      console.log(`user ${username} has sent a msg: ${message}`)
      if (username && message) {
        this.emitChatMessage(username, message, packet.from.id)
      }
    })

    this.Socket.on("user-left", (packet: Packet) => {
      const { username } = packet.message as ReceivedUser
      console.log(`user ${username} has left`)
      const index = this.usersOnline.indexOf(username)
      this.usersOnline.splice(index, 1)
      if (username !== "") {
        this.emitChatMessage(username, "has left", packet.from.id)
        this.emitUsersOnline()
      }
    })

    this.Socket.on("user-joined", (packet: Packet) => {
      const { username } = (packet.message as ReceivedUser)
      console.log(`user ${username} has joined`)
      if (username !== "" ) {
        this.usersOnline.push(username)
        this.emitChatMessage(username, "has joined", packet.from.id)
        this.emitUsersOnline()
      }
    })
// TODO :: Thsi is where i left off, i was using the tab in chrome of juanportal to add back all the socket handlers and emit methods needed to finish the server
  }

  private emitChatMessage(username: string, message: string, id: string | number) {
    console.log('emitting chat msg')
    this.Socket.to("chat-message", JSON.stringify({
      username,
      message
    }));
  }

  private emitUsersOnline() {
    console.log('emitting users online')
    this.Socket.to("users-online", JSON.stringify({
      usersOnline: this.usersOnline
    }))
  }
}
