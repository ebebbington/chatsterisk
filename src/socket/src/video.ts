import {DAMI, DrashSocketServer} from "../deps";

export class Video {
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

// import SocketIO, {Server as SocketIOServer} from "socket.io";
//
// interface Room {
//   name: string,
//   users: string[]
// }
//
// /**
//  * @class Socket
//  *
//  * @property  {MAX_CONNECTIONS}
//  * @property  {io}
//  * @property  {rooms}
//  *
//  * @method    getJoinedRoom           {@link Socket#getJoinedRoom}
//  * @method    generateRoomName        {@link Socket#generateRoomName}
//  * @method    getOtherUsersIdByRoom   {@link Socket#getOtherUsersIdByRoom}
//  * @method    joinRoom                {@link Socket#joinRoom}
//  * @method    removeUserFromRoom      {@link Socket#removeUserFromRoom}
//  * @method    emitRoom                {@link Socket#emitRoom}
//  * @method    handle                  {@link Socket#handle}
//  * @method    emitCallMade            {@link Socket#emitCallMade}
//  */
// class SocketServer {
//
//   /**
//    * @var {number} Maximum number of connections for a room
//    */
//   private readonly MAX_CONNECTIONS = 2
//
//   /**
//    * @var {SocketIOServer} The SocketIO object to handle everything
//    */
//   private io: SocketIOServer
//
//   /**
//    * @var {[Room]} List of rooms that are currently in use by users
//    */
//   private rooms: Array<Room> = []
//
//   /**
//    * @param {SocketIOServer} io
//    */
//   constructor(io: SocketIOServer) {
//     this.io = io
//   }
//
//   /**
//    * @description
//    * Get the room the user is in by their socket id
//    *
//    * @example
//    * const joinedRoom = this.getJoinedRoom(socket.id)
//    *
//    * @param {string} socketId socket.id
//    *
//    * @return {Room|undefined} The room object or undefined if they haven't joined a room
//    */
//   private getJoinedRoom (socketId: string): Room|undefined {
//     const joinedRoom = this.rooms.filter(room => room.users.includes(socketId))
//     if (joinedRoom.length)
//       return joinedRoom[0]
//     return undefined
//   }
//
//   /**
//    * @description
//    * Our helper function for creating the names for our rooms
//    *
//    * @example
//    * const newRoomName = this.generateRoomName()
//    * socket.join(newRoomName)
//    *
//    * @return {string} A randomised 14 character string
//    */
//   private generateRoomName (): string {
//     return Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7);
//   }
//
//   /**
//    * @description
//    * Get the calling (current) users room by the socket id, and get the other user in that room
//    *
//    * @example
//    * const otherUsersId = this.getOtherUsersIdByRoom(socket)
//    *
//    * @param {SocketIO.Socket} socket The callback data from the io connection
//    *
//    * @return {string} The other users id or undefined if couldn't find one
//    */
//   private getOtherUsersIdByRoom (socket: SocketIO.Socket): string {
//     const joinedRoom = this.getJoinedRoom(socket.id)
//     if (!joinedRoom)
//       return ''
//     const userId: string[] = joinedRoom.users.filter(id => id !== socket.id)
//     if (userId.length)
//       return userId[0]
//     else
//       return ''
//   }
//
//   /**
//    * @description
//    * Join a room using the calling sockets id. First find a spare room, else create a new one.
//    * Updates the rooms property as well
//    *
//    * @example
//    * this.joinRoom(socket)
//    *
//    * @param {SocketIO.Socket} socket Passed back data from the io.on connection callback
//    *
//    * @return {void}
//    */
//   private joinRoom (socket: SocketIO.Socket): void {
//     // find a spare room
//     const foundSpareRoom = this.rooms.filter((room, i) => {
//       if (room.users.length < this.MAX_CONNECTIONS) {
//         socket.join(room.name)
//         this.rooms[i].users.push(socket.id)
//         return true
//       }
//     })
//     if (!foundSpareRoom.length) {
//       // create one instead
//       const newRoomName = this.generateRoomName()
//       socket.join(newRoomName)
//       this.rooms.push({name: newRoomName, users: [socket.id]})
//     }
//   }
//
//   /**
//    * @method removeUserFromRoom
//    *
//    * @description
//    * Remove the socket connection from all processes e.g. the rooms prop, and cleans up the room if its empty
//    *
//    * @example
//    * this.io.on('connection', (socket) => this.removeUserFromRoom(socket))
//    *
//    * @param {SocketIO.Socket} socket The socket object
//    */
//   private removeUserFromRoom (socket: SocketIO.Socket) {
//     // remove user
//     this.rooms.forEach((room, i) => {
//       if (room.users.includes(socket.id)) {
//         this.rooms[i].users = room.users.filter(user => user !== socket.id)
//       }
//     })
//     // clean room if empty
//     this.rooms.forEach((room, i) => {
//       if (room.users.length === 0) {
//         this.rooms.splice(i, 1)
//       }
//     })
//     socket.leave(socket.id)
//   }
//
//   /**
//    * @method emitRoom
//    *
//    * @description
//    * Send the room data to all clients in the room
//    *
//    * @example
//    * this.emitRoom(socket, true|false)
//    *
//    * @param {SocketIO.Socket} socket The socket object
//    * @param {boolean} isDisconnecting If the user is disconnecting. If true will omit the disconnecting users is
//    */
//   private emitRoom (socket: SocketIO.Socket, isDisconnecting: boolean = false) {
//     const otherUsersId = this.getOtherUsersIdByRoom(socket)
//     const joinedRoom = this.getJoinedRoom(socket.id)
//     if (!joinedRoom)
//       return false
//     socket.to(otherUsersId).emit('room', {
//       myId: otherUsersId,
//       users: isDisconnecting ? joinedRoom.users.filter(id => id !== socket.id && id !== otherUsersId) : [socket.id],
//       name: joinedRoom.name
//     })
//     socket.emit('room', {
//       myId: socket.id,
//       users: joinedRoom.users.filter(id => id !== socket.id),
//       name: joinedRoom.name
//     })
//   }
//
//   /**
//    * @method emitCallMade
//    *
//    * @description
//    * On calling a user, emit an event to say a call has been made
//    *
//    * @param {SocketIO.Socket}   socket      The socket object
//    * @param {object}            data        The data passed back from the event
//    * @param {string}            data.to     The id of the the user to make the call to
//    * @param {RTCOfferOptions}   data.offer  Offer options
//    */
//   private emitCallMade (socket: SocketIO.Socket, data: { to: string, offer: RTCOfferOptions}) {
//     socket.to(data.to).emit("call-made", {
//       offer: data.offer,
//       socket: socket.id
//     });
//   }
//
//   /**
//    * @method emitAnswerMade
//    *
//    * @description
//    * Answer the call by sending the answer options
//    *
//    * @param {SocketIO.Socket} socket The socket object
//    * @param {object}            data        The data passed back from the event
//    * @param {string}            data.to     The id of the the user to make the call to
//    * @param {RTCAnswerOptions}  data.answer  Answer options
//    */
//   private emitAnswerMade (socket: SocketIO.Socket, data:  { to: string, answer: RTCAnswerOptions}) {
//     socket.to(data.to).emit("answer-made", {
//       socket: socket.id,
//       answer: data.answer
//     });
//   }
//
//   /**
//    * @description
//    * The entry point for handling all events and connections
//    *
//    * @return {void}
//    */
//   public handle () {
//     this.io.on('connection', (socket: SocketIO.Socket) => {
//
//       this.joinRoom(socket)
//
//       /**
//        * When requested, will get the room data, so your id, their ids and the name.
//        * It will also send an event to the other users in the room with the updated user list
//        */
//       socket.on('room', () => {
//         this.emitRoom(socket)
//       })
//
//       // Update rooms
//       socket.on("disconnect", () => {
//         this.emitRoom(socket, true)
//         this.removeUserFromRoom(socket)
//       });
//
//       // Make a call request
//       socket.on("call-user", (data: { to: string, offer: RTCOfferOptions}) => {
//         this.emitCallMade(socket, data)
//       });
//
//       // Answer the call request
//       socket.on("make-answer", (data: { to: string, answer: RTCAnswerOptions}) => {
//         this.emitAnswerMade(socket, data)
//       });
//
//     })
//   }
// }
//
// export default SocketServer