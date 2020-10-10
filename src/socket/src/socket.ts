import { Action, DAMI, DrashSocketServer, Event, Packet } from "../deps.ts";
import {Call} from "./call.ts";
import {Video} from "./video.ts";
import {Chat} from "./chat.ts";

export class SocketServer {
  /**
   * To create our socket server
   */
  private readonly Socket: DrashSocketServer;

  /**
   * Connection configs for the socket server
   */
  private readonly socket_configs = {
    hostname: "socket",
    port: 1668,
  };

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor() {
    this.Socket = new DrashSocketServer();
  }

  /**
   * Starts our socket server, connects and logs in to the AMI
   */
  public async start(): Promise<void> {
    // Start the socket server
    await this.Socket.run(this.socket_configs);
    console.log(
      `Socket server started on ws://${this.socket_configs.hostname}:${this.socket_configs.port}`,
    );
    this.Socket.on("connection", () => {
      console.log("A socket client connected.");
    });
    this.Socket.on("disconnect", () => {
      console.log("A socket client disconnected.");
    });

    // Start listening on the socket channels for the different apps
    const call = new Call(this.Socket)
    const video = new Video(this.Socket)
    const chat = new Chat(this.Socket)
    await call.start()
    await video.start()
    await chat.start()
  }
}
