import { Component, html } from "./deps.ts";
import { AnchorLink } from "./anchor.ts";
import { css } from "./deps.ts";
import { globalStyles } from "./global_styles.ts";

const callHref = "/call";
const chatHref = "/chat";
const videoHref = "/video";
const callText = "Call";
const videoText = "Video";
const chatText = "Chat";

// deno-lint-ignore no-undef
export class CHome extends Component {
  static styles = css`${globalStyles}` as never;
  template = html`
      <div style="display: flex">
    <${AnchorLink} prop:href=${callHref} prop:text=${callText}></${AnchorLink}>
    <${AnchorLink} prop:href=${chatHref} prop:text=${chatText}></${AnchorLink}>
    <${AnchorLink} prop:href=${videoHref} prop:text=${videoText}></${AnchorLink}>
</div>
`;
}
