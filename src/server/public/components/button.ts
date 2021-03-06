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

// deno-lint-ignore ban-ts-comment
// @ts-ignore
export class AButton extends Component<{
  id: string;
  class: string;
  text: string;
  value: string;
}> {
  static styles = css`
      ${styling + globalStyles}
    `;
  template = html
    // @ts-ignore BECAUSE WITHOUT TYPINGS YET, it doesnt know
    `<button id=${this.id} class=${this.class} value=${this.value}>${this.text}</button>
    `;
}
