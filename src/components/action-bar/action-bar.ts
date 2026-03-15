import "./action-bar.css";

export class ActionBarElement extends HTMLElement {
  static readonly tagName = "action-bar";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md, 1rem);
          padding: var(--spacing-md, 1rem);
          background: var(--action-bar-bg, transparent);
          border-top: 1px solid var(--border-color, #e0e0e0);
          margin-top: var(--spacing-lg, 1.5rem);
        }
        ::slotted(*) {
          margin: 0;
        }
      </style>
      <slot></slot>
    `;
  }
}

// Register custom element
customElements.define(ActionBarElement.tagName, ActionBarElement);
