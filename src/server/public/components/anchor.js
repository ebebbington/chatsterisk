import { DestinyElement, html, reactive, register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";

register(class AnchorLink extends HTMLElement {
  connectedCallback() {
    this.originalInnerText = this.innerText
    this.anchorHref = this.getAttribute("href")
    this.innerHTML = `<a href="${this.anchorHref}">${this.originalInnerText}</a>
`;
  }
})