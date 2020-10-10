import {DAMI, DrashSocketServer} from "../deps";

export class Chat {
  /**
   * To create our socket server
   */
  private readonly Socket: DrashSocketServer;

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor(socket: DrashSocketServer) {
    this.Socket = socket
  }

  public async start () {
    // TODO
  }
}