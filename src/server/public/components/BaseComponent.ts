import { Component, TemplateResult, xml } from "./deps.ts";

export abstract class BaseComponent extends Component {
  protected html(input: TemplateResult) {
    return xml`
          <link rel="stylesheet" href="/public/css/styles.css" />
          ${input}
        `;
  }
}
