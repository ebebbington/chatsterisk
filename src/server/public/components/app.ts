import { Component, html, register } from "./deps.ts";
import { CHome } from "./Home.ts";
import { CChat } from "./Chat.ts";
import { CVideo } from "./Video.ts";
import { CCall } from "./Call.ts";

// TODO :: Apply global styles and bootstrap stuff to comps

const pathname = document.location.pathname;
const pages: Map<string, string> = new Map()
pages.set("/", `${CHome}`)
pages.set("/chat", `${CChat}`)
pages.set("/video", `${CVideo}`)
pages.set("/call", `${CCall}`)
const component = pages.get(pathname) ?? "404" // todo use 404 component

class AppRoot extends Component {
  template = html`
    <${component}></${component}>
  `;
}

register(AppRoot);
