import { Component, register, xml } from "./deps.ts";
import { CHome } from "./Home.ts";
import { CChat } from "./Chat.ts";
import { CVideo } from "./Video.ts";
import { CCall } from "./Call.ts";

const pathname = document.location.pathname;
const pages: Map<string, string> = new Map();
pages.set("/", `${CHome}`);
pages.set("/chat", `${CChat}`);
pages.set("/video", `${CVideo}`);
pages.set("/call", `${CCall}`);
const component = pages.get(pathname) ?? "404"; // todo use 404 component

class AppRoot extends Component {
  template = xml`
    <${component}></${component}>
  `;
}

register(AppRoot);
