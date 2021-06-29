import { css } from "./deps.ts";
import { Component, html, computed } from "./deps.ts";
import { globalStyles } from "./global_styles.ts";

  // deno-lint-ignore no-undef
  // @ts-ignore
  export class AnchorLink extends Component<{
    href: string,
    text: string
  }> {
    static styles = css`${globalStyles}`
    // @ts-ignore
    template = html`<a href=${this.href}>${this.text}</a>`
  }
