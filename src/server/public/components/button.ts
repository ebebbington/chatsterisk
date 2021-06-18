import { register } from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";

const styling = `
<style>
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
</style>
`;

register(
  // deno-lint-ignore no-undef
  class AButton extends HTMLElement {
    connectedCallback() {
      const originalInnerText = this.innerText;
      const idAttribute = this.getAttribute("id");
      this.removeAttribute("id")
      const classAttribute = this.getAttribute("class");
      this.innerHTML =
        `${styling}<button id="${idAttribute}" class="${classAttribute}">${originalInnerText}</button>
`;
    }
  },
);
