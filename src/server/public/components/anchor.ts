import { Component, css, html } from "./deps.ts";
import { globalStyles } from "./global_styles.ts";

export interface AnchorLink {
  href: string
  text: string
}

export class AnchorLink extends Component {
  static styles = css`${globalStyles}`;

  template = html`<a href=${this.href}>${this.text}</a>`;
}
