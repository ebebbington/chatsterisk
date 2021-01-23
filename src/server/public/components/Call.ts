import { register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";
// TODO :: Make a dep file for destiny
import { createWebSocketClient } from "../js/socket-client.ts";

register(
  // deno-lint-ignore no-undef
  class CCall extends HTMLElement {
    private client: WebSocket | null = null;

    connectedCallback() {
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
      this.initialiseSocketClient();
      this.createEventListeners();
    }

    private createEventListeners() {
      this.querySelector("#extension-to-call-from")!.addEventListener(
        "change",
        () => {
          const chosenExtension =
            (this.querySelector("#extension-to-call-from") as HTMLOptionElement)
              .value;
          const $options = this.querySelectorAll(
            "select#extension-to-call-to option",
          ) as unknown as HTMLOptionElement[];
          $options.forEach(($option: HTMLOptionElement) => {
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
            (this.querySelector("#extension-to-call-to") as HTMLOptionElement)
              .value;
          // deno-lint-ignore no-explicit-any
          const $options: any = this.querySelectorAll(
            "select#extension-to-call-from option",
          );
          $options.forEach(($option: HTMLOptionElement) => {
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
          const from =
            (this.querySelector("#extension-to-call-from") as HTMLOptionElement)
              .value;
          const to =
            (this.querySelector("#extension-to-call-to") as HTMLOptionElement)
              .value;
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
      const $extensionToCallFrom = this.querySelector(
        "#extension-to-call-from",
      );
      const $extensionToCallTo = this.querySelector("#extension-to-call-to");
      message.forEach((extension) => {
        let $option;

        // deno-lint-ignore no-undef
        $option = document.createElement("option");
        $option.value = extension;
        $option.innerText = extension;
        $extensionToCallFrom!.appendChild($option);

        // deno-lint-ignore no-undef
        $option = document.createElement("option");
        $option.value = extension;
        $option.innerText = extension;
        $extensionToCallTo!.appendChild($option);
      });
    }

    private async initialiseSocketClient() {
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
  },
);
