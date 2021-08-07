import { xml } from "./deps.ts";
import { AnchorLink } from "./anchor.ts";
import { BaseComponent } from "./BaseComponent.ts";

const callHref = "/call";
const chatHref = "/chat";
const videoHref = "/video";
const callText = "Call";
const videoText = "Video";
const chatText = "Chat";

// deno-lint-ignore no-undef
export class CHome extends BaseComponent {
  template = this.html(xml`
      <div style="display: flex">
    <${AnchorLink} prop:href=${callHref} prop:text=${callText}></${AnchorLink}>
    <${AnchorLink} prop:href=${chatHref} prop:text=${chatText}></${AnchorLink}>
    <${AnchorLink} prop:href=${videoHref} prop:text=${videoText}></${AnchorLink}>
</div>
`);
}
