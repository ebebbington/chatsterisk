import { initSocketServer } from "./socket_server.ts";
import {DAMI, DAMIData} from "./deps.ts"

const Dami = new DAMI({ hostname: "asterisk_pbx", port: 5038, logger: true });
await Dami.connectAndLogin({ username: "admin", secret: "mysecret" });
await Dami.listen();
await initSocketServer(Dami)

// const socketClient = new SocketClient({
//   hostname: "asterisk_pbx",
//   port: 5038
// })
// socketClient.on()

// async function getExtensionsFromAsterisk (): Promise<string[]> {
//   //const cmd = `/usr/sbin/asterisk -rx 'sip show peers' | awk -F'/' '{print $1}' | awk 'NR>2 {print last} {last=$0}'`
//   const cmd = ["asterisk", "-rx", `sip show peers`]
//   const p = await Deno.run({
//     cmd: cmd,
//     stdout: "piped",
//     stdin: "piped",
//   })
//   const stdout = new TextDecoder().decode(await p.output())
//   let lines: string[] = stdout.split("\n").filter(line => !isNaN(Number(line[0]))) // remove lines without numbers at start
//   lines = lines.filter(line => line.split(" ")[0].indexOf("/") > -1) // remove lines that are extensions eg title
//   let extensions: string[] = []
//   lines.forEach(line => {
//     const tmpLine = line.split(" ") // eg line = "6006/6006      192.15.6.4.2    D N"
//     if (tmpLine[0].match(/\d\/\d/)) { // eg "<number>/<number>"
//       const extension = tmpLine[0].split("/")[0]
//       extensions.push(extension)
//     }
//   });
//   const status = await p.status()
//   await p.close()
//   return extensions
// }
//
// async function makeCallToAsterisk (extensionToCall: number, extensionCalledFrom: number): Promise<void> {
//   const cmd = ["asterisk", "-rx", `originate local/${extensionToCall}@from-internal extension ${extensionCalledFrom}@from-internal`]
//   console.log(cmd)
//   const p = await Deno.run({
//     cmd: cmd,
//     stdout: "piped",
//     stdin: "piped"
//   })
//   console.log(await p.status())
//   const stdout = new TextDecoder().decode(await p.output())
//   p.close()
// }