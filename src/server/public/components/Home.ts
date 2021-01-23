import { DestinyElement, html, reactive, register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";

register(class CHome extends HTMLElement {
  connectedCallback() {
    const script = document.createElement("script")
    script.type = "module"
    script.src = '/public/components/anchor.js'
    document.body.appendChild(script)
    this.innerHTML =
      `
      <div style="display: flex">
    <anchor-link href="/call">Call</anchor-link>
    <anchor-link href="/chat">Chat</anchor-link>
    <anchor-link href="/video">Video</anchor-link>
</div>
`;
  }
})