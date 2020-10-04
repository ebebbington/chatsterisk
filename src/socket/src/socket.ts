import { Action, DAMI, DrashSocketServer, Event, Packet } from "../deps.ts";

export class SocketServer {
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
  private readonly Socket: DrashSocketServer;

  /**
   * Holds all registered extensions
   */
  private peer_entries: Event[] = [];

  /**
   * Extensions and their states
   */
  private peer_entry_states: { [exten: string]: string } = {};

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor() {
    this.Dami = new DAMI(this.ami_configs);
    this.Socket = new DrashSocketServer();
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
    this.Dami.to("SIPPeers", {}, (data: Event[]) => {
      data = data.filter(((d) => d["Event"] === "PeerEntry"));
      this.peer_entries = data;
    });

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
    this.Dami.on("Hangup", (data: Event[]) => {
      const exten: string = data[0]["CallerIDNum"].toString();
      const state: string = data[0]["ChannelStateDesc"].toString();
      if (!Array.isArray(exten) && !Array.isArray(state)) {
        this.peer_entry_states[exten] = state;
        this.Socket.to(
          "extension-states",
          JSON.stringify(this.peer_entry_states),
        );
      }
    });
    // When a channel is created, set the status, handles declining calls (sets to busy) and when an exten is called, sets it to ringing
    this.Dami.on("Newstate", (data: Event[]) => {
      const exten: string = data[0]["CallerIDNum"].toString();
      const state: string = data[0]["ChannelStateDesc"].toString();
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
    this.Socket.openChannel("make-call");
    this.Socket.on("make-call", async (data: Packet) => {
      console.log("data was received for make call");
      console.log(data);
      await this.Dami.to("Originate", {
        Channel: "sip/" +
          (data.message as { to_extension: string; from_extension: string })
            .to_extension,
        Exten:
          (data.message as { to_extension: string; from_extension: string })
            .from_extension,
        Context: "from-internal",
      });
    });

    this.Socket.openChannel("get-extensions");
    this.Socket.on("get-extensions", async (data: Packet) => {
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
