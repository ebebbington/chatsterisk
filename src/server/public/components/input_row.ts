import {
  DestinyElement,
  html,
  reactive,
  register,
} from "https://code.okku.dev/destiny-ui/0.4.1/dist/mod.js";

const styling = `
<style>
.input-row {
    display: flex;
    text-align: center;
    margin: .5em;
}
.input-row input {
    border: 1px solid var(--sub-colour);
    text-align: center;
    height: 28px;
    border-radius: 5px 0 0 5px;
    margin: 0 0 0 auto;
    width: 100%;
    padding: .5em;
    font-size: 1em;
}
.input-row > button {
    background-color: var(--main-colour);
    border: 1px solid var(--sub-colour);
    color: var(--sub-colour);
    border-radius: 0 5px 5px 0;
    padding: 0;
    font-size: 1.2em;
    width: 30px;
    border-left: 0;
    margin: 0 auto 0 0;
}
.input-row > button:hover {
    cursor: pointer;
    background-color: var(--sub-colour);
    color: var(--main-colour);
}
.input-row > button.delete {
    color: red;
}
.input-row > button.delete:hover {
    color: white;
}
</style>
`;

/**
 * EG
 *
 * <input-row container-id="new-todo-holder" input-id="new-todo-title" input-placeholder="Walk the dog" button-id="submit-new-todo"></input-row>
 * <script src="/public/components/input_row.js" type="module"></script>
 */
register(
  class InputRow extends HTMLElement {
    connectedCallback() {
      this.containerId = this.getAttribute("container-id");
      this.inputId = this.getAttribute("input-id");
      this.inputPlaceHolder = this.getAttribute("input-placeholder");
      this.buttonId = this.getAttribute("button-id");
      this.innerHTML = `
${styling}
<div class="input-row" id="${this.containerId}">
    <input id="${this.inputId}" type="text" placeholder="${this.inputPlaceHolder}">
    <button id="${this.buttonId}" type="button">&#10004</button>
</div>
`;
    }
  },
);
