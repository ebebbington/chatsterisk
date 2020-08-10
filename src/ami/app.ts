import { SocketServer } from "./deps.ts"
import { SSHClient } from "./ssh_client.ts";

const socketServer = new SocketServer();
const sshClient = new SSHClient({
  host: "asterisk_pbx",
  is_docker_container: true
})

socketServer.run({
  hostname: "sip_ami",
  port: 1668,
}, {
  reconnect: false,
});
console.log(
    `Socket server started on ws://${socketServer.hostname}:${socketServer.port}`,
);

socketServer.createChannel("make-call")
socketServer.createChannel("made-call")
socketServer.on("connection", () => {
  console.log("A client connected.");
  socketServer.on("make-call", async (data: any) => {
    console.log('data was recieved')
    console.log(data)
    const callTo = data.call_to
    // TODO(edward) Make the call. Current we run into the error when doing `console dial 100@outgoing` (or 6002) in the asterisk cli. Also doing the below, the phone gets a call from caller id "anonymous", how do we change that?
    await sshClient.execute("asterisk -rx 'originate local/6002@from-internal extension 6001@from-internal'") // FIXME(edward) The cmd gets all wierd with "... \"...\""
    socketServer.to("made-call", "hello")
    socketServer.broadcast("made-call", 'done')
  });
});

socketServer.on("disconnect", () => {
  console.log("A client disconnected.");
});


// LISTEN ON MESSAGES, THEN SEND SSH MESSAGE TO CONTAINER TO MAKE CALL. CREATE SSH CLIENT