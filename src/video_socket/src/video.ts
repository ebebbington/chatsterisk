import { DrashSocketServer, Packet } from "../deps.ts";

interface Room {
  name: string;
  users: number[];
}

export class Video {
  /**
   * To create our socket server
   */
  private readonly Socket: DrashSocketServer;

  /**
   * Connection configs for the socket server
   */
  private readonly socket_configs = {
    hostname: "video_socket",
    port: 1669,
  };

  /**
   * A list of rooms for users
   */
  private rooms: Room[] = [];

  /**
   * You can kinda guess
   */
  private readonly MAX_CONNECTIONS_PER_ROOM = 2;

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor() {
    this.Socket = new DrashSocketServer();
  }

  public async start() {
    await this.Socket.run(this.socket_configs);

    this.Socket.on("connection", (packet: Packet) => {
      this.joinRoom(Number(packet.from.id));

      /**
       * When requested, will get the room data, so your id, their ids and the name.
       * It will also send an event to the other users in the room with the updated user list
       */
      this.Socket.on("room", (packet: Packet) => {
        this.emitRoom(Number(packet.from.id));
      });

      // Update rooms
      this.Socket.on("disconnect", (packet: Packet) => {
        this.emitRoom(Number(packet.from.id), true);
        this.removeUserFromRoom(Number(packet.from.id));
      });

      // Make a call request
      this.Socket.on("call-user", (packet: Packet) => {
        this.emitCallMade(
          Number(packet.from.id),
            // @ts-ignore Deno cannot find the name apprently...
            (packet.message as { to: string; offer: RTCOfferOptions }),
        );
      });

      // Answer the call request
      this.Socket.on("make-answer", (packet: Packet) => {
        this.emitAnswerMade(
          Number(packet.from.id),
            // @ts-ignore Deno cannot find the name apprently...
            (packet.message as { to: string; answer: RTCOfferOptions }),
        );
      });
    });
  }

  /**
   * @description
   * Get the room the user is in by their socket id
   *
   * @example
   * const joinedRoom = this.getJoinedRoom(packet.id)
   *
   * @param socketId - socket.id
   *
   * @return The room object or undefined if they haven't joined a room
   */
  private getJoinedRoom(socketId: number): Room | undefined {
    const joinedRoom = this.rooms.filter((room) =>
      room.users.includes(socketId)
    );
    if (joinedRoom.length) {
      return joinedRoom[0];
    }
    return undefined;
  }

  /**
   * @description
   * Our helper function for creating the names for our rooms
   *
   * @example
   * const newRoomName = this.generateRoomName()
   * socket.join(newRoomName)
   *
   * @return A randomised 14 character string
   */
  private generateRoomName(): string {
    return Math.random().toString(36).substring(7) +
      Math.random().toString(36).substring(7);
  }

  /**
   * @description
   * Get the calling (current) users room by the socket id, and get the other user in that room
   *
   * @example
   * const otherUsersId = this.getOtherUsersIdByRoom(socket)
   *
   * @return {string} The other users id or undefined if couldn't find one
   *
   * @param currentUserId
   */
  private getOtherUsersIdByRoom(currentUserId: number): number | false {
    const joinedRoom = this.getJoinedRoom(currentUserId);
    if (!joinedRoom) {
      return false;
    }
    const userId: number[] = joinedRoom.users.filter((id) =>
      id !== currentUserId
    );
    if (userId.length) {
      return userId[0];
    } else {
      return false;
    }
  }

  /**
   * @description
   * Join a room using the calling sockets id. First find a spare room, else create a new one.
   * Updates the rooms property as well
   *
   * @example
   * this.joinRoom(socket)
   *
   * @param socketId - Socket conn to join room
   */
  private joinRoom(socketId: number): void {
    // find a spare room
    const foundSpareRoom = this.rooms.filter((room, i) => {
      if (room.users.length < this.MAX_CONNECTIONS_PER_ROOM) {
        //socket.join(room.name)
        this.rooms[i].users.push(socketId);
        return true;
      }
    });
    if (!foundSpareRoom.length) {
      // create one instead
      const newRoomName = this.generateRoomName();
      //socket.join(newRoomName)
      this.rooms.push({ name: newRoomName, users: [socketId] });
    }
  }

  /**
   * @method removeUserFromRoom
   *
   * @description
   * Remove the socket connection from all processes e.g. the rooms prop, and cleans up the room if its empty
   *
   * @example
   * this.io.on('connection', (socket) => this.removeUserFromRoom(socket))
   *
   * @param socketId - The socket object
   */
  private removeUserFromRoom(socketId: number) {
    // remove user
    this.rooms.forEach((room, i) => {
      if (room.users.includes(socketId)) {
        this.rooms[i].users = room.users.filter((user) => user !== socketId);
      }
    });
    // clean room if empty
    this.rooms.forEach((room, i) => {
      if (room.users.length === 0) {
        this.rooms.splice(i, 1);
      }
    });
    //socket.leave(socket.id)
  }

  /**
   * @method emitRoom
   *
   * @description
   * Send the room data to all clients in the room
   *
   * @example
   * this.emitRoom(socket, true|false)
   *
   * @param socketId - The socket object
   * @param isDisconnecting - If the user is disconnecting. If true will omit the disconnecting users is
   *
   * @returns False if the socket id is not in a room, else void if we send the msg
   */
  private emitRoom(
    socketId: number,
    isDisconnecting: boolean = false,
  ): false | void {
    const otherUsersId = this.getOtherUsersIdByRoom(socketId);
    if (otherUsersId === false) {
      return false
    }
    const joinedRoom = this.getJoinedRoom(socketId);
    if (!joinedRoom) {
      return false;
    }
    this.Socket.to("room", {
      myId: otherUsersId,
      users: isDisconnecting
        ? joinedRoom.users.filter((id) =>
          id !== socketId && id !== otherUsersId
        )
        : [socketId],
      name: joinedRoom.name,
    }, otherUsersId);
    this.Socket.to("room", {
      myId: socketId,
      users: joinedRoom.users.filter((id) => id !== socketId),
      name: joinedRoom.name,
    });
  }

  /**
   * @method emitCallMade
   *
   * @description
   * On calling a user, emit an event to say a call has been made
   *
   * @param socketId - The socket object
   * @param data - Holding the id of the socket to send to and the other users offer
   */
  private emitCallMade(
    socketId: number,
    // @ts-ignore Deno cannot find the name apprently...
    data: { to: string; offer: RTCOfferOptions },
  ) {
    this.Socket.to("call-made", {
      offer: data.offer,
      socket: socketId,
    }, Number(data.to));
  }

  /**
   * @method emitAnswerMade
   *
   * @description
   * Answer the call by sending the answer options
   *
   * @param socketId - Socket id
   * @param {object}            data        The data passed back from the event
   * @param {string}            data.to     The id of the the user to make the call to
   * @param {RTCAnswerOptions}  data.answer  Answer options
   */
  private emitAnswerMade(
    socketId: number,
    // @ts-ignore Deno cannot find the name apprently...
    data: { to: string; answer: RTCAnswerOptions },
  ) {
    this.Socket.to("answer-made", {
      socket: socketId,
      answer: data.answer,
    }, Number(data.to));
  }
}
