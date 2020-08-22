import { DAMI, DAMIData, SocketServer } from "./deps.ts";

class Server {
  /**
   * Connection configs for the AMI client
   */
  private readonly ami_configs = {
    hostname: "asterisk_pbx",
    port: 5038,
    logger: true,
  };

  /**
   * Auth details for logging in to the AMI
   */
  private readonly ami_auth = { username: "admin", secret: "mysecret" };

  /**
   * Connection configs for the socket server
   */
  private readonly socket_configs = {
    hostname: "ami_socket",
    port: 1668,
  };

  /**
   * DAMI  instance to speak to the AMI
   */
  private readonly Dami: DAMI;

  /**
   * To create our socket server
   */
  private readonly Socket: SocketServer;

  /**
   * Holds all registered extensions
   */
  public peer_entries: Array<DAMIData> = [];

  /**
   * Extensions and their states
   */
  public peer_entry_states: { [exten: string]: string } = {};

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor() {
    this.Dami = new DAMI(this.ami_configs);
    this.Socket = new SocketServer();
  }

  /**
   * Starts our socket server, connects and logs in to the AMI
   */
  public async start(): Promise<void> {
    // Connect and listen to the AMI
    await this.Dami.connectAndLogin(this.ami_auth);
    await this.Dami.listen();

    // Start the socket server
    await this.Socket.run(this.socket_configs);
    console.log(
      `Socket server started on ws://${this.socket_configs.hostname}:${this.socket_configs.port}`,
    );
    this.Socket.on("connection", () => {
      console.log("A socket client connected.");
    });
    this.Socket.on("disconnect", () => {
      console.log("A socket client disconnected.");
    });

    // Set peer entries immediantly so  we have access to all extensions
    const peerEntries = await this.Dami.to("SIPPeers", {ActionID: 12});
    this.peer_entries = peerEntries.filter(entry => entry["Event"] === "PeerEntry");

    // Keep our entry statuses updated
    this.listenForExtensionStates();

    // Start listening on the socket channels
    await this.initialiseSocketChannels();
  }

  /**
   * Used to listen on any states extensions to update the states property when required
   */
  private listenForExtensionStates(): void {
    // on calls hung up, set status to available
    this.Dami.on("Hangup", (data: DAMIData) => {
      const exten: string = data["CallerIDNum"].toString();
      const state: string = data["ChannelStateDesc"].toString();
      if (!Array.isArray(exten) && !Array.isArray(state)) {
        this.peer_entry_states[exten] = state;
        this.Socket.to(
          "extension-states",
          JSON.stringify(this.peer_entry_states),
        );
      }
    });
    // When a channel is created, set the status, handles declining calls (sets to busy) and when an exten is called, sets it to ringing
    this.Dami.on("Newstate", (data: DAMIData) => {
      const exten: string = data["CallerIDNum"].toString();
      const state: string = data["ChannelStateDesc"].toString();
      if (!Array.isArray(exten) && !Array.isArray(state)) {
        this.peer_entry_states[exten] = state;
        this.Socket.to(
          "extension-states",
          JSON.stringify(this.peer_entry_states),
        );
      }
    });
  }

  /**
   * Creates the listeners for the socket server
   */
  private async initialiseSocketChannels() {
    // deno-lint-ignore no-explicit-any TODO(edward) Remove any when sockets repo is  updated
    this.Socket.createChannel("make-call").onMessage(async (data: any) => {
      console.log("data was recieved for make call");
      console.log(data);
      await this.Dami.to("Originate", {
        Channel: "sip/" + data.message.to_extension,
        Exten: data.message.from_extension,
        Context: "from-internal",
      });
    });
    // deno-lint-ignore no-explicit-any TODO(edward) Remove any when sockets repo is  updated
    this.Socket.createChannel("get-extensions").onMessage(async (data: any) => {
      console.log("get-extensions called");
      //const extensions = await getExtensionsFromAsterisk()
      const extensions = this.peer_entries.map((peerEntry) => {
        return peerEntry.ObjectName;
      });
      console.log(extensions);
      this.Socket.to("get-extensions", JSON.stringify(extensions));
    });
  }
}

const server = new Server();
await server.start();

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
