import { SocketServer } from "./deps.ts"

const socketServer = new SocketServer();

socketServer.run({
  hostname: "asterisk_pbx",
  port: 1668,
}, {
  reconnect: false,
});
console.log(
    `Socket server started on ws://${socketServer.hostname}:${socketServer.port}`,
);

async function getExtensionsFromAsterisk (): Promise<string[]> {
  //const cmd = `/usr/sbin/asterisk -rx 'sip show peers' | awk -F'/' '{print $1}' | awk 'NR>2 {print last} {last=$0}'`
  const cmd = ["asterisk", "-rx", `sip show peers`]
  const p = await Deno.run({
    cmd: cmd,
    stdout: "piped",
    stdin: "piped",
  })
  const stdout = new TextDecoder().decode(await p.output())
  let lines: string[] = stdout.split("\n").filter(line => !isNaN(Number(line[0]))) // remove lines without numbers at start
  lines = lines.filter(line => line.split(" ")[0].indexOf("/") > -1) // remove lines that are extensions eg title
  let extensions: string[] = []
  lines.forEach(line => {
    const tmpLine = line.split(" ") // eg line = "6006/6006      192.15.6.4.2    D N"
    if (tmpLine[0].match(/\d\/\d/)) { // eg "<number>/<number>"
      const extension = tmpLine[0].split("/")[0]
      extensions.push(extension)
    }
  });
  await p.close()
  return extensions
}

async function makeCallToAsterisk (extensionToCall: number, extensionCalledFrom: number): Promise<void> {
  const cmd = ["asterisk", "-rx", `originate local/${extensionToCall}@from-internal extension ${extensionCalledFrom}@from-internal`]
  console.log(cmd)
  const p = await Deno.run({
    cmd: cmd,
    stdout: "piped",
    stdin: "piped"
  })
  // const status = await p.status()
}

socketServer.createChannel("test").onMessage((data: any) => {
  console.log('test got message')
  socketServer.to("test", "hello")
})

socketServer.createChannel("make-call").onMessage(async (data: any) => {
  console.log('data was recieved for make call')
  console.log(data)
  //await makeCallToAsterisk(1, 2)
  socketServer.to("made-call", JSON.stringify({ success: true, message: "done", data: null}))
});

socketServer.createChannel("get-extensions").onMessage(async (data: any) => {
  console.log("get-extensions called")
  const extensions = await getExtensionsFromAsterisk()
  socketServer.to("get-extensions", JSON.stringify({ success: true, message: "done", data: extensions }))
})

socketServer.on("connection", () => {
  console.log("A client connected.");
});

socketServer.on("disconnect", () => {
  console.log("A client disconnected.");
});