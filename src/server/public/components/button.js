class Button extends HTMLElement {
  connectedCallback() {
    this.text = this.getAttribute("text")
    this.innerHTML = `<button>${this.text}</button>`;
  }
}

customElements.define('wc-button', Button);