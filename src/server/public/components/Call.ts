import { DestinyElement, html, reactive, register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";
// TODO :: Make a dep file for destiny
import { createWebSocketClient } from "../js/socket-client.ts";

register(class CCall extends HTMLElement {

  private client: WebSocket | null = null

  public async connectedCallback() {
    const script = document.createElement("script")
    script.type = "module"
    script.src = '/public/components/button.js'
    document.body.appendChild(script)
    this.innerHTML =
      `<p>Remember to refresh the extensions to make a call!</p>

        <div class="row flex">

            <div class="col-6 text-align-c">
                <p>Select an extension to call from</p>
                <select id="extension-to-call-from">
                    <option value="" selected>Select...</option>
                </select>
            </div>

            <div class="col-6 text-align-c">
                <p>Select an extension to call to</p>
                <select id="extension-to-call-to">
                    <option value="" selected>Select...</option>
                </select>
            </div>

        </div>

        <div class="row">
            <a-button id="initiate-call">Initiate Call</a-button>
        </div>

        <div class="row">
            <audio id="audio-remote" controls>
                <p>Your browser doesn't support HTML5 audio.</p>
            </audio>
        </div>
`;
    this.initialiseSocketClient()
    this.createEventListeners()
  }

  private createEventListeners () {
    this.querySelector("#extension-to-call-from")!.addEventListener(
        "change",
        () => {
          const chosenExtension =
              // @ts-ignore
              this.querySelector("#extension-to-call-from")!.value;
          const $options = this.querySelectorAll(
              "select#extension-to-call-to option",
          );
          $options.forEach(($option: any) => {
            if ($option.value === chosenExtension) {
              $option.classList.add("hide");
            } else {
              $option.classList.remove("hide");
            }
          });
        },
    );
    this.querySelector("#extension-to-call-to")!.addEventListener(
        "change",
        (event) => {
          const chosenExtension =
              // @ts-ignore
              this.querySelector("#extension-to-call-to").value;
          const $options: any = this.querySelectorAll(
              "select#extension-to-call-from option",
          );
          $options.forEach(($option: any) => {
            if ($option.value === chosenExtension) {
              $option.classList.add("hide");
            } else {
              $option.classList.remove("hide");
            }
          });
        },
    );

    this.querySelector("#initiate-call")!.addEventListener(
        "click",
        (event) => {
          // @ts-ignore
          const from: any = this.querySelector("#extension-to-call-from").value;
          // @ts-ignore
          const to: any = this.querySelector("#extension-to-call-to")!.value;
          this.client!.send(JSON.stringify({
            send_packet: {
              to: "make-call",
              message: {
                to_extension: Number(to),
                from_extension: Number(from),
              },
            },
          }));
        },
    );
  }

  private handleGetExtensions(message: string[]) {
    const extensions = message;
    const $extensionToCallFrom = this.querySelector(
        "#extension-to-call-from",
    );
    const $extensionToCallTo = this.querySelector("#extension-to-call-to");
    extensions.forEach((extension: any) => {
      let $option;

      $option = document.createElement("option");
      $option.value = extension;
      $option.innerText = extension;
      $extensionToCallFrom!.appendChild($option);

      $option = document.createElement("option");
      $option.value = extension;
      $option.innerText = extension;
      $extensionToCallTo!.appendChild($option);
    });
  }

  private async initialiseSocketClient () {
    this.client = await createWebSocketClient({ port: 1668 });
    this.client.send(JSON.stringify({
      connect_to: ["get-extensions", "make-call"],
    }));

    this.client.onmessage = (msg) => {
      if (msg.data.indexOf("Connected to") > -1) {
        return;
      }
      const data = JSON.parse(msg.data); // { from, to, message }
      data.message = JSON.parse(data.message);
      if (data.to === "get-extensions") {
        this.handleGetExtensions(data.message);
      }
    };

    this.client.send(JSON.stringify({
      send_packet: {
        to: "get-extensions",
        data: "",
      },
    }));
  }
})