import { BaseElement } from "@core/base-element.js";

/**
 * Template for MadSelect - contains the native select element with slot for options
 */
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #404040;
      margin-bottom: 0.25rem;
    }
    @media (prefers-color-scheme: dark) {
      label {
        color: #d4d4d4;
      }
    }
    select {
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid #d4d4d4;
      background-color: #ffffff;
      color: #171717;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      line-height: 1.5;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    select:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
    }
    select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @media (prefers-color-scheme: dark) {
      select {
        border-color: #525252;
        background-color: #262626;
        color: #fafafa;
      }
    }
    .size-small {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
    .size-medium {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
    .size-large {
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
    }
    .help-text {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #737373;
    }
    @media (prefers-color-scheme: dark) {
      .help-text {
        color: #a3a3a3;
      }
    }
  </style>
  <label part="label"></label>
  <select part="select">
    <slot></slot>
  </select>
  <p part="help-text" class="help-text"></p>
`;

/**
 * MadSelect - Custom select component with Shadow DOM and Form-Associated Custom Element (FACE) support
 * Projects options from light DOM <mad-option> children into shadow <select>
 * @element mad-select
 */
export class MadSelect extends BaseElement {
  /**
   * Enable Form-Associated Custom Element support
   */
  static formAssociated = true;

  /**
   * Attributes to observe for changes
   */
  static get observedAttributes(): string[] {
    return [
      "label",
      "placeholder",
      "size",
      "help-text",
      "value",
      "disabled",
      "name",
    ];
  }

  /**
   * ElementInternals for form integration
   */
  readonly #internals: ElementInternals;

  /**
   * Reference to shadow root
   */
  readonly #shadow: ShadowRoot;

  /**
   * Reference to the native select element in shadow DOM
   */
  readonly #select: HTMLSelectElement | null;

  /**
   * Reference to the label element in shadow DOM
   */
  readonly #label: HTMLLabelElement | null;

  /**
   * Reference to help text element in shadow DOM
   */
  readonly #helpText: HTMLParagraphElement | null;

  /**
   * Placeholder option value
   */
  #placeholder = "";

  constructor() {
    super();

    // Attach ElementInternals for form integration
    this.#internals = this.attachInternals();

    // Create shadow root and append template
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.appendChild(template.content.cloneNode(true));

    // Get references to shadow DOM elements
    this.#select = this.#shadow.querySelector("select");
    this.#label = this.#shadow.querySelector("label");
    this.#helpText = this.#shadow.querySelector(".help-text");

    // Set up native select event listener
    this.#setupSelectListener();
  }

  /**
   * Get the current value of the select
   */
  get value(): string {
    return this.#select?.value ?? "";
  }

  /**
   * Set the value of the select
   */
  set value(v: string) {
    if (this.#select) {
      this.#select.value = v;
    }
    this.#internals.setFormValue(v);
    this.setAttribute("value", v);
  }

  /**
   * Get the associated form element
   */
  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  /**
   * Get the name attribute
   */
  get name(): string {
    return this.getAttribute("name") ?? "";
  }

  /**
   * Get the disabled state
   */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  /**
   * Set the disabled state
   */
  set disabled(v: boolean) {
    if (v) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  /**
   * Get validity state
   */
  get validity(): ValidityState {
    return this.#internals.validity;
  }

  /**
   * Get validation message
   */
  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  /**
   * Check if the element is a candidate for form validation
   */
  get willValidate(): boolean {
    return this.#internals.willValidate;
  }

  /**
   * Check validity and report it to the form
   */
  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }

  /**
   * Report validity
   */
  reportValidity(): boolean {
    return this.#internals.reportValidity();
  }

  /**
   * Set custom validity message
   */
  setCustomValidity(message: string): void {
    this.#internals.setValidity({ customError: !!message }, message);
  }

  protected _setupProperties(): void {
    // Properties are handled via attributes
  }

  /**
   * Set up event listener on the native select
   */
  #setupSelectListener(): void {
    if (!this.#select) {
      return;
    }

    this.#select.addEventListener("change", () => {
      const selectedValue = this.#select?.value ?? "";

      // Update form value
      this.#internals.setFormValue(selectedValue);

      // Emit custom change event
      this._emit("mad-change", { value: selectedValue });
    });
  }

  /**
   * Build options from light DOM <mad-option> children
   */
  #buildOptions(): string {
    const options = Array.from(this.querySelectorAll("mad-option"));

    let optionsHtml = "";

    // Add placeholder option if defined and no value is set
    const currentValue = this.getAttribute("value") ?? "";
    if (!currentValue && this.#placeholder) {
      optionsHtml += `<option value="" disabled selected>${this.#placeholder}</option>`;
    }

    // Add options from mad-option elements
    for (const opt of options) {
      const val = opt.getAttribute("value") ?? "";
      const text = opt.textContent?.trim() ?? "";
      const selected = val === currentValue ? " selected" : "";
      optionsHtml += `<option value="${val}"${selected}>${text}</option>`;
    }

    return optionsHtml;
  }

  protected _render(): void {
    const label = this.getAttribute("label") ?? "";
    const placeholder = this.getAttribute("placeholder") ?? "";
    const size = this.getAttribute("size") ?? "medium";
    const helpText = this.getAttribute("help-text") ?? "";
    const disabled = this.hasAttribute("disabled");
    const currentValue = this.getAttribute("value") ?? "";

    // Store placeholder for use in options
    this.#placeholder = placeholder;

    // Build options HTML
    const optionsHtml = this.#buildOptions();

    // Update label
    if (this.#label) {
      this.#label.textContent = label;
      this.#label.style.display = label ? "block" : "none";
    }

    // Update select with options
    if (this.#select) {
      this.#select.innerHTML = optionsHtml;
      this.#select.className = `size-${size}`;
      this.#select.disabled = disabled;

      // Restore selected value if present
      if (currentValue && optionsHtml) {
        this.#select.value = currentValue;
      }
    }

    // Update help text
    if (this.#helpText) {
      this.#helpText.textContent = helpText;
      this.#helpText.style.display = helpText ? "block" : "none";
    }
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "value" && value !== null) {
      // Update form value when value attribute changes externally
      this.#internals.setFormValue(value);
      if (this.#select) {
        this.#select.value = value;
      }
    } else if (name === "disabled" && this.#select) {
      this.#select.disabled = value !== null;
    }
  }
}

customElements.define("mad-select", MadSelect);

/**
 * MadOption - Option element for use within MadSelect
 * Light DOM element that gets projected into the select
 * @element mad-option
 */
export class MadOption extends BaseElement {
  static get observedAttributes(): string[] {
    return ["value"];
  }

  protected _setupProperties(): void {
    // No special properties needed
  }

  protected _render(): void {
    // Content is rendered by parent MadSelect
    // This element serves as a data holder for the select
  }
}

customElements.define("mad-option", MadOption);
