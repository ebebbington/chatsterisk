import { SocketServer } from "./deps.ts"

export function initSocketServer () {

  const socketServer = new SocketServer();

  socketServer.run({
    hostname: "ami_socket",
    port: 1668,
  }, {
    reconnect: false,
  });
  console.log(
      `Socket server started on ws://${socketServer.hostname}:${socketServer.port}`,
  );

  socketServer.createChannel("test").onMessage((data: any) => {
    console.log('test got message')
    socketServer.to("test", "hello")
  })

  socketServer.createChannel("make-call").onMessage(async (data: any) => {
    console.log('data was recieved for make call')
    console.log(data)
    //await makeCallToAsterisk(data.message.to_extension, data.message.from_extension)
    //socketServer.to("made-call", JSON.stringify({ success: true, message: "done", data: null}))
  });

  socketServer.createChannel("get-extensions").onMessage(async (data: any) => {
    console.log("get-extensions called")
    //const extensions = await getExtensionsFromAsterisk()
    //socketServer.to("get-extensions", JSON.stringify({ success: true, message: "done", data: extensions }))
  })

  socketServer.on("connection", () => {
    console.log("A client connected.");
  });

  socketServer.on("disconnect", () => {
    console.log("A client disconnected.");
  });
}