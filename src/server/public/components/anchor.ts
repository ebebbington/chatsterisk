import { Component, css, html } from "./deps.ts";
import { globalStyles } from "./global_styles.ts";

export interface AnchorLink {
  href: string
  text: string
}

export class AnchorLink extends Component {
  // TODO :: Once we can import destiny ts files and get type hints, remove this `as`
  static styles = [css`${globalStyles}`] as never[];

  template = html`<a href=${this.href}>${this.text}</a>`;
}
