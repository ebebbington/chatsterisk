import { register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";

register(
  // deno-lint-ignore no-undef
  class CHome extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div style="display: flex">
    <anchor-link href="/call">Call</anchor-link>
    <anchor-link href="/chat">Chat</anchor-link>
    <anchor-link href="/video">Video</anchor-link>
</div>
`;
    }
  },
);
