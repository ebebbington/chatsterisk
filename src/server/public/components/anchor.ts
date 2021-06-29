import { Component, html, css } from "./deps.ts";
import { globalStyles } from "./global_styles.ts";

// deno-lint-ignore ban-ts-comment
// @ts-ignore
export class AnchorLink extends Component<{
  href: string;
  text: string;
}> {
  static styles = css`${globalStyles}`;
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  template = html`<a href=${this.href}>${this.text}</a>`;
}
