import {DAMI, DAMIData, SocketServer} from "./deps.ts"

const peerEntries: Array<DAMIData> = []

export async function initSocketServer (Dami: DAMI) {

  Dami.on("PeerEntry", (data: DAMIData) => {
    peerEntries.push(data)
  })
  Dami.to("Sippeers", {})

  const socketServer = new SocketServer();

  await socketServer.run({
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
    await Dami.to("Originate", {
      Channel: "sip/" + data.message.to_extension,
      Exten: data.message.from_extension,
      Context: "from-internal"
    })

  });

  socketServer.createChannel("get-extensions").onMessage(async (data: any) => {
    console.log("get-extensions called")
    //const extensions = await getExtensionsFromAsterisk()
    const extensions = peerEntries.map(peerEntry => {
      return peerEntry.ObjectName
    })
    console.log(extensions)
    socketServer.to("get-extensions", JSON.stringify({ success: true, message: "done", data: 'extens' }))
  })

  socketServer.on("connection", () => {
    console.log("A client connected.");
  });

  socketServer.on("disconnect", () => {
    console.log("A client disconnected.");
  });
}