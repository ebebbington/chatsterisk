import { Component, css, html } from "./deps.ts";
import { globalStyles } from "./global_styles.ts";

const styling = `
button {
    color: var(--main-colour);
    background-color: var(--sub-colour);
    padding: .5em;
    outline: 0;
    border: 0;
    border-radius: 5px;
    font-size: 1em;
    transition-duration: .3s;
}
button.success {
    background: green;
}
button.error {
    background: red;
}
button:hover {
    cursor: pointer;
    box-shadow: 0px 0px 2px 2px var(--ter-colour);
}
`;

export interface AButton {
  id: string;
  class: string;
  text: string;
  value: string;
}

export class AButton extends Component {

    // TODO :: Once we can import destiny ts files and get type hints, remove this `as`
  static styles = [css`${styling}`, css`${globalStyles}`] as never[];
  template = html
    `<button id=${this.id} class=${this.class} value=${this.value}>${this.text}</button>
    `;
}
