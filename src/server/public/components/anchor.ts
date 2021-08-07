import { BaseComponent } from "./BaseComponent.ts";
import { xml } from "./deps.ts";

export interface AnchorLink {
  href: string;
  text: string;
}

export class AnchorLink extends BaseComponent {
  template = this.html(xml`<a href=${this.href}>${this.text}</a>`);
}
