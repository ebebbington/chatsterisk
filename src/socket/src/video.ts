import { DAMI, DrashSocketServer, Packet } from "../deps.ts";

interface Room {
  name: string,
  users: number[]
}

export class Video {
  /**
   * To create our socket server
   */
  private readonly Socket: DrashSocketServer;

  /**
   * A list of rooms for users
   */
  private rooms: Room[] = []

  /**
   * You can kinda guess
   */
  private readonly MAX_CONNECTIONS_PER_ROOM = 2

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor(socket: DrashSocketServer) {
    this.Socket = socket;
  }

  public async start() {
    this.Socket.on("connection", (packet: Packet) => {
      this.joinRoom(packet.from.id)

      /**
       * When requested, will get the room data, so your id, their ids and the name.
       * It will also send an event to the other users in the room with the updated user list
       */
      this.Socket.openChannel("video.room")
      this.Socket.on('video.room', (packet: Packet) => {
        this.emitRoom(packet.from.id)
      })

      // Update rooms
      this.Socket.on("disconnect", (packet: Packet) => {
        this.emitRoom(packet.from.id, true)
        this.removeUserFromRoom(packet.from.id)
      });

      // Make a call request
      this.Socket.openChannel("video.call-user")
      this.Socket.on("video.call-user", (packet: Packet) => {
        this.emitCallMade(packet.from.id, (packet.message as { to: string, offer: RTCOfferOptions }))
      });

      // Answer the call request
      this.Socket.openChannel("video.make-answer")
      this.Socket.on("video.make-answer", (packet: Packet) => {
        this.emitAnswerMade(packet.from.id, (packet.message as { to: string, answer: RTCOfferOptions }))
      });
    })
  }

  /**
   * @description
   * Get the room the user is in by their socket id
   *
   * @example
   * const joinedRoom = this.getJoinedRoom(socket.id)
   *
   * @param {string} socketId socket.id
   *
   * @return {Room|undefined} The room object or undefined if they haven't joined a room
   */
  private getJoinedRoom (socketId: number): Room|undefined {
    const joinedRoom = this.rooms.filter(room => room.users.includes(socketId))
    if (joinedRoom.length)
      return joinedRoom[0]
    return undefined
  }

  /**
   * @description
   * Our helper function for creating the names for our rooms
   *
   * @example
   * const newRoomName = this.generateRoomName()
   * socket.join(newRoomName)
   *
   * @return {string} A randomised 14 character string
   */
  private generateRoomName (): string {
    return Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7);
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
  private getOtherUsersIdByRoom (currentUserId: number): number|false {
    const joinedRoom = this.getJoinedRoom(currentUserId)
    if (!joinedRoom)
      return false
    const userId: number[] = joinedRoom.users.filter(id => id !== currentUserId)
    if (userId.length)
      return userId[0]
    else
      return false
  }

  /**
   * @description
   * Join a room using the calling sockets id. First find a spare room, else create a new one.
   * Updates the rooms property as well
   *
   * @example
   * this.joinRoom(socket)
   *
   * @param {SocketIO.Socket} socket Passed back data from the io.on connection callback
   *
   * @return {void}
   */
  private joinRoom (socketId: number): void {
    // find a spare room
    const foundSpareRoom = this.rooms.filter((room, i) => {
      if (room.users.length < this.MAX_CONNECTIONS_PER_ROOM) {
        //socket.join(room.name)
        this.rooms[i].users.push(socketId)
        return true
      }
    })
    if (!foundSpareRoom.length) {
      // create one instead
      const newRoomName = this.generateRoomName()
      //socket.join(newRoomName)
      this.rooms.push({name: newRoomName, users: [socketId]})
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
   * @param {SocketIO.Socket} socket The socket object
   */
  private removeUserFromRoom (socketId: number) {
    // remove user
    this.rooms.forEach((room, i) => {
      if (room.users.includes(socketId)) {
        this.rooms[i].users = room.users.filter(user => user !== socketId)
      }
    })
    // clean room if empty
    this.rooms.forEach((room, i) => {
      if (room.users.length === 0) {
        this.rooms.splice(i, 1)
      }
    })
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
   * @param {SocketIO.Socket} socket The socket object
   * @param {boolean} isDisconnecting If the user is disconnecting. If true will omit the disconnecting users is
   */
  private emitRoom (socketId: number, isDisconnecting: boolean = false) {
    const otherUsersId = this.getOtherUsersIdByRoom(socketId)
    const joinedRoom = this.getJoinedRoom(socketId)
    if (!joinedRoom)
      return false
    this.Socket.to(otherUsersId).emit('video.room', {
      myId: otherUsersId,
      users: isDisconnecting ? joinedRoom.users.filter(id => id !== socketId && id !== otherUsersId) : [socketId],
      name: joinedRoom.name
    })
    this.Socket.emit('video.room', {
      myId: socketId,
      users: joinedRoom.users.filter(id => id !== socketId),
      name: joinedRoom.name
    })
  }

  /**
   * @method emitCallMade
   *
   * @description
   * On calling a user, emit an event to say a call has been made
   *
   * @param {SocketIO.Socket}   socket      The socket object
   * @param {object}            data        The data passed back from the event
   * @param {string}            data.to     The id of the the user to make the call to
   * @param {RTCOfferOptions}   data.offer  Offer options
   */
  private emitCallMade (socketId: number, data: { to: string, offer: RTCOfferOptions}) {
    this.Socket.to(data.to).emit("video.call-made", {
      offer: data.offer,
      socket: socketId
    });
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
  private emitAnswerMade (socketId: number, data:  { to: string, answer: RTCAnswerOptions}) {
    this.Socket.to(data.to).emit("video.answer-made", {
      socket: socketId,
      answer: data.answer
    });
  }
}
