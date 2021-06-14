import { DAMI, DrashSocketServer } from "../deps.ts";
import type { Event, Packet } from "../deps.ts";

export class Call {
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
   * DAMI  instance to speak to the AMI
   */
  private readonly Dami: DAMI;

  /**
   * Holds all registered extensions
   */
  private peer_entries: Event[] = [];

  /**
   * Extensions and their states
   */
  private peer_entry_states: { [exten: string]: string } = {};

  /**
   * To create our socket server
   */
  private readonly Socket: DrashSocketServer;

  /**
   * Connection configs for the socket server
   */
  private readonly socket_configs = {
    hostname: "call_socket",
    port: 1668,
  };

  /**
   * Creates instances of the socket server and DAMI
   */
  constructor() {
    this.Dami = new DAMI(this.ami_configs);
    this.Socket = new DrashSocketServer();
  }

  public async start() {
    // Start socket server
    await this.Socket.run(this.socket_configs);

    // Connect and listen to the AMI
    await this.Dami.connect(this.ami_auth);

    // Set peer entries immediantly so we have access to all extensions
    const peerEntries = await this.Dami.to("SIPPeers", {});
    peerEntries.forEach((entry) => {
      if (entry["Event"] === "PeerEntry") {
        this.peer_entries.push(entry);
      }
    });

    this.initialiseSocketChannels();
  }

  private initialiseSocketChannels(): void {
    this.Socket.on("make-call", async (data: Packet) => {
      console.log("data was received for make call");
      console.log(data);
      await this.Dami.to("Originate", {
        Channel: "SIP/" +
          (data.message as { to_extension: string; from_extension: string })
            .to_extension,
        Exten:
          (data.message as { to_extension: string; from_extension: string })
            .from_extension,
        Context: "from-internal",
        Priority: 1,
        Callerid:
          (data.message as { to_extension: string; from_extension: string })
            .from_extension,
      });
    });

    this.Socket.on("get-extensions", (_data: Packet) => {
      console.log("get-extensions called");
      const extensions = this.peer_entries.map((peerEntry) => {
        return peerEntry["ObjectName"];
      });
      this.Socket.to("get-extensions", JSON.stringify(extensions));
    });
  }

  /**
   * Used to listen on any states extensions to update the states property when required
   */
  private listenForExtensionStates(): void {
    // on calls hung up, set status to available
    this.Dami.on("Hangup", (data: Event) => {
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
    this.Dami.on("Newstate", (data: Event) => {
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
}
