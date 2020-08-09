import { SocketServer } from "./deps.ts"

const socketServer = new SocketServer();

socketServer.run({
  hostname: "sip_ami",
  port: 1668,
}, {
  reconnect: false,
});
console.log(
    `Socket server started on ws://${socketServer.hostname}:${socketServer.port}`,
);

socketServer.on("connection", () => {
  console.log("A client connected.");
});

socketServer.on("disconnect", () => {
  console.log("A client disconnected.");
});

// LISTEN ON MESSAGES, THEN SEND SSH MESSAGE TO CONTAINER TO MAKE CALL. CREATE SSH CLIENT