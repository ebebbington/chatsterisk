import { DestinyElement, html, reactive, register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";

register(class AnchorLink extends HTMLElement {
  connectedCallback() {
    const originalInnerText = this.innerText
    const anchorHref = this.getAttribute("href")
    this.innerHTML = `<a href="${anchorHref}">${originalInnerText}</a>
`;
  }
})