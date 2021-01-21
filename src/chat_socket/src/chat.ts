import { DrashSocketServer } from "../deps.ts";

export class Chat {
  /**
   * To create our socket server
   */
  private readonly Socket: DrashSocketServer;

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

    // TODO
  }
}
