//import {Router} from "./Router.ts"
import { Component, html, register, reactive, computed } from "./deps.ts";
import { CHome } from "./Home.ts"
import { CChat } from "./Chat.ts"
import { CVideo } from "./Video.ts"
import { CCall } from "./Call.ts"

// TODO :: Apply global styles and bootstrap stuff to comps
  
const pathname = document.location.pathname

class AppRoot extends Component {
    template = html`
    ${computed(() => {
        if (pathname === "/") {
            return html`<${CHome}></${CHome}>`
        }
        if (pathname === "/chat") {
            return html`<${CChat}></${CChat}>`
        }
        if (pathname === "/video") {
            return html`<${CVideo}></${CVideo}>`
        }
        if (pathname === "/call") {
            return html`<${CCall}></${CCall}>`
        }
    })}
    `;
}

register(AppRoot)
