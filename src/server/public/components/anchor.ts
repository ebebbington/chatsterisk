import { Component, css, html } from "./deps.ts";
import { globalStyles } from "./global_styles.ts";

export class AnchorLink extends Component<{
  href: string;
  text: string;
}> {
  static styles = css`${globalStyles}`;

  template = html`<a href=${this.href}>${this.text}</a>`;
}
