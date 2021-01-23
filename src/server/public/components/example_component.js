
// This will be a single component.
// Because it extends HTMLElement, `this` refers to the element,
// eg `this.innerHtml = ...`. It also provides extra methods like `this.getAttribute(...)`
// To use this class, just link the js file inside a html file, and you can now do:
// `<example-component></example-component>`.
// It seems like the text added inside (`<wc-component>my button</...>`) displays before the lifecycle methods, eg before the component has loaded and rendered, then when it has, if the component sets the inner html it will be overriden
class ExampleComponent extends HTMLElement {

  /**
   * This is a lifecycle method. It is used (best practice) to actually say what this component will render,
   * ie its responsible for setting the html content.
   * When a component is ready to render, this will be called, this is the render method.
   */
  connectedCallback() {
    /**
     * We can use attributes to pass extra information into the component, so say we
     * wanted to render this component, passing in extra info, such as telling the component to disable
     * it, or use a certain class, we can do `<example-component disable="true">` or `<wc-component i-like-cheese="yes i do">`,
     * and we'd grab it by `this.getAttribute(<name>)`
     */
    this.textAttribute = this.getAttribute("text")
    /**
     * We can also use a component to display custom text, so say we use this
     * on the login page, we might want the button to say "Login". So we can
     * do that by doing: `<wc-component>Login</...>`, and retrieve it by doing
     * `this.innerText`
     */
    this.originalInnerText = this.innerText
    /**
     * Here is where we finally decide the content of this component.
     * In this example, we are getting extra text from an attribute, and displaying it
     * alongside the original text content. So if we used `<example-component text="Hello">Click me</...>`, the below
     * would render `<wc-component><button>Hello Click me</button></wc-component>`
     * NOTE: that the original inner text seems to display whilst this js file is loading
     * and before the component has time to render, so it could be used as a placeholder, so
     * if instead, below, we just displayed the text attribute inside the button (`<button>${this.textAttribute}</button>`),
     * we can do the following:
     * `<example-component>Loading...</example-component>` which will display Loading... whilst the `connectedCallback`
     * method is still processing, then it would get overriden with `Hello` once it has loaded
     */
    this.innerHTML = `<button>${this.textAttribute} ${this.originalInnerText}</button>`;
  }
}

/**
 * This registers the component, so we can use it in the html file.
 * Note that the name, is the tag we use, eg we'd use it like `<wc-component>...`.
 * NAMES MUST BE KEBAB CASE.
 *
 * Examples:
 * <wc-component text="Hello"></...> --> <button>Hello</button</...>
 * <wc-component text="Hello">Bye</...> --> <button>Hello Bye</...>
 */
customElements.define('example-component', ExampleComponent);