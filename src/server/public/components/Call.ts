import { openClient } from "../js/socket-client.ts";
import { Component, computed, css, html, reactive } from "./deps.ts";
import { AButton } from "./button.ts";
import { globalStyles } from "./global_styles.ts";

// deno-lint-ignore no-undef
class CCall extends Component {
  private client = new WebSocket("ws://127.0.0.1:1668");

  #extensions = reactive([]);
  #selectedFromExtension = reactive("");
  #selectedToExtension = reactive("");

  // TODO :: Once we can import destiny ts files and get type hints, remove this `as`
  static styles = css`${globalStyles}` as unknown as never[];

  template = html`
    <p>Remember to refresh the extensions to make a call!</p>
      <div class="row flex">
        <div class="col-6 text-align-c">
            <p>Select an extension to call from</p>
            <select id="extension-to-call-from" prop:value=${this.#selectedFromExtension}>
              <option value="" selected=${this.#selectedFromExtension.value ===
    ""}>Select...</option> 
      ${
    computed(() => {
      return html`
        ${
        this.#extensions.value.map((extension: number) => {
          if (extension === Number(this.#selectedFromExtension.value)) {
            return html`
              <option value=${extension} style="display: none;" selected="true">${extension}</option>
            `;
          }
          if (extension === Number(this.#selectedToExtension)) {
            return "";
          }
          return html`<option value=${extension}>${extension}</option>`;
        })
      }
      `;
    })
  }
            </select>
          </div>
          <div class="col-6 text-align-c">
            <p>Select an extension to call to</p>
            <select id="extension-to-call-to" prop:value=${this.#selectedToExtension}>
              <option value="" selected=${this.#selectedToExtension
    .value === ""}>Select...</option>
                    ${
    computed(() => {
      return html`
                        ${
        this.#extensions.value.map((extension: number) => {
          // If we selected it, hide it
          if (extension === Number(this.#selectedToExtension.value)) {
            return html
              `<option value=${extension} style="display: none;" selected="true">${extension}</option>`;
          }
          // If other field selected it, hide it
          if (extension === Number(this.#selectedFromExtension)) {
            return "";
          }
          return html`<option value=${extension}>${extension}</option>`;
        })
      }
                      `;
    })
  }
      </select>
    </div>
  </div>

  <div class="row">
    <${AButton} prop:id=${"initiate-call"} prop:text=${"Initiate Call"} on:click=${() =>
    this.handleInitiateCallClick()}></${AButton}>
  </div>

  <div class="row">
    <audio id="audio-remote" controls="true">
      <p>Your browser doesn't support HTML5 audio.</p>
    </audio>
  </div>
`;
  connectedCallback() {
    this.initialiseSocketClient();
  }

  private handleInitiateCallClick() {
    this.client!.send(JSON.stringify({
      send_packet: {
        to: "make-call",
        message: {
          to_extension: Number(this.#selectedToExtension.value),
          from_extension: Number(this.#selectedFromExtension.value),
        },
      },
    }));
  }

  private async initialiseSocketClient() {
    await openClient(this.client);
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
        this.#extensions.value = data.message;
      }
    };

    this.client.send(JSON.stringify({
      send_packet: {
        to: "get-extensions",
        data: "",
      },
    }));
  }
}
export { CCall };
