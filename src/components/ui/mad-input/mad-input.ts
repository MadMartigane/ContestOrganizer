import { BaseElement } from "@core/base-element.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    .input-wrapper {
      display: block;
    }
    .label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--mad-input-label-color, #44403c);
      margin-bottom: 0.25rem;
    }
    input {
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--mad-input-border-color, #d6d3d1);
      background-color: var(--mad-input-bg-color, #fff);
      color: var(--mad-input-text-color, #1c1917);
      padding: 0.5rem 1rem;
      font-size: 1rem;
      line-height: 1.5;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input::placeholder {
      color: var(--mad-input-placeholder-color, #a8a29e);
    }
    input:focus {
      outline: none;
      border-color: var(--mad-input-focus-color, #f97316);
      box-shadow: 0 0 0 3px var(--mad-input-focus-ring-color, rgba(249, 115, 22, 0.2));
    }
    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    input:read-only {
      cursor: default;
    }
    /* Size variants */
    :host([data-size="small"]) input {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
    :host([data-size="large"]) input {
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
    }
    /* Dark theme via attribute */
    :host([data-theme="dark"]) {
      --mad-input-label-color: #d6d3d1;
      --mad-input-border-color: #525252;
      --mad-input-bg-color: #262626;
      --mad-input-text-color: #fafafa;
      --mad-input-placeholder-color: #737373;
      --mad-input-focus-color: #fb923c;
      --mad-input-focus-ring-color: rgba(251, 146, 60, 0.2);
    }
    /* No spin buttons for number input */
    :host([no-spin-buttons]) input[type="number"]::-webkit-inner-spin-button,
    :host([no-spin-buttons]) input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    :host([no-spin-buttons]) input[type="number"] {
      -moz-appearance: textfield;
    }
    /* Validation styles */
    input:invalid {
      border-color: var(--mad-input-error-color, #ef4444);
    }
    input:invalid:focus {
      box-shadow: 0 0 0 3px var(--mad-input-error-ring-color, rgba(239, 68, 68, 0.2));
    }
  </style>
  <div class="input-wrapper">
    <label class="label"></label>
    <input type="text" />
  </div>
`;

/**
 * MadInput - Form-Associated Custom Element (FACE) input component
 * @element mad-input
 * @extends BaseElement
 */
export class MadInput extends BaseElement {
  /** Enable form association */
  static formAssociated = true;

  /** Observed attributes for reactivity */
  static get observedAttributes(): string[] {
    return [
      "type",
      "value",
      "placeholder",
      "label",
      "size",
      "disabled",
      "readonly",
      "autofocus",
      "autocomplete",
      "min",
      "max",
      "step",
      "minlength",
      "maxlength",
      "name",
      "required",
      "pattern",
      "no-spin-buttons",
    ];
  }

  /** ElementInternals for form integration */
  readonly #internals: ElementInternals;

  /** Shadow root reference */
  readonly #shadow: ShadowRoot;

  /** Native input element reference */
  readonly #input: HTMLInputElement | null;

  /** Label element reference */
  readonly #label: HTMLLabelElement | null;

  constructor() {
    super();

    // Attach ElementInternals for form integration
    this.#internals = this.attachInternals();

    // Create and populate shadow root with template
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.appendChild(template.content.cloneNode(true));

    // Get references to internal elements
    this.#input = this.#shadow.querySelector("input");
    this.#label = this.#shadow.querySelector("label");

    // Setup event listeners
    this.#setupEventListeners();
  }

  /**
   * Sets up event listeners for input synchronization
   */
  #setupEventListeners(): void {
    if (!this.#input) {
      return;
    }

    this.#input.addEventListener("input", this.#handleInput.bind(this));
    this.#input.addEventListener("change", this.#handleChange.bind(this));
    this.#input.addEventListener("blur", this.#handleBlur.bind(this));
    this.#input.addEventListener("focus", this.#handleFocus.bind(this));
  }

  /**
   * Handles input event - syncs value to internals
   */
  #handleInput(): void {
    this.#internals.setFormValue(this.#input?.value ?? "");
  }

  /**
   * Handles change event - dispatch custom event
   */
  #handleChange(): void {
    this._emit("change", { value: this.value });
  }

  /**
   * Handles blur event - run validation
   */
  #handleBlur(): void {
    this.#runValidation();
  }

  /**
   * Handles focus event
   */
  #handleFocus(): void {
    // Focus management
  }

  /**
   * Runs validation and updates internals
   */
  #runValidation(): void {
    if (!this.#input) {
      return;
    }

    const validity = this.#input.validity;
    this.#internals.setValidity(validity, this.#input.validationMessage);
  }

  /**
   * Gets the current input value
   */
  get value(): string {
    return this.#input?.value ?? "";
  }

  /**
   * Sets the input value
   */
  set value(v: string) {
    if (this.#input) {
      this.#input.value = v;
    }
    this.#internals.setFormValue(v);
    this._requestRender();
  }

  /**
   * Gets the associated form element
   */
  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  /**
   * Gets the input name
   */
  get name(): string {
    return this.getAttribute("name") ?? "";
  }

  /**
   * Sets the input name
   */
  set name(v: string) {
    this.setAttribute("name", v);
  }

  /**
   * Gets the input type
   */
  get type(): string {
    return this.getAttribute("type") ?? "text";
  }

  /**
   * Gets the input validity state
   */
  get validity(): ValidityState {
    return this.#internals.validity;
  }

  /**
   * Gets the validation message
   */
  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  /**
   * Checks if the input is valid
   */
  get willValidate(): boolean {
    return this.#internals.willValidate;
  }

  /**
   * Checks if the input is disabled
   */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  /**
   * Sets the input disabled state
   */
  set disabled(v: boolean) {
    if (v) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  /**
   * Checks if the input is required
   */
  get required(): boolean {
    return this.hasAttribute("required");
  }

  /**
   * Sets the input required state
   */
  set required(v: boolean) {
    if (v) {
      this.setAttribute("required", "");
    } else {
      this.removeAttribute("required");
    }
  }

  /**
   * Gets the placeholder text
   */
  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "";
  }

  /**
   * Focus the input element
   */
  focus(): void {
    this.#input?.focus();
  }

  /**
   * Blur the input element
   */
  blur(): void {
    this.#input?.blur();
  }

  /**
   * Check validity and return result
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
   * Reset the input to default value
   */
  reset(): void {
    const defaultValue = this.getAttribute("value") ?? "";
    this.value = defaultValue;
    this.#internals.setValidity({ valueMissing: false }, "");
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  /**
   * Update input type
   */
  #updateInputType(input: HTMLInputElement): void {
    const type = this.getAttribute("type") ?? "text";
    input.type = type;
  }

  /**
   * Update label element with accessibility
   */
  #updateLabel(label: HTMLLabelElement, input: HTMLInputElement): void {
    const labelText = this.getAttribute("label") ?? "";
    label.textContent = labelText;

    const inputId = input.id || "mad-input-field";
    label.setAttribute("for", inputId);
    input.id = input.id || inputId;

    if (labelText) {
      this.#internals.ariaLabel = labelText;
    }
  }

  /**
   * Update common input attributes
   */
  #updateCommonAttributes(input: HTMLInputElement): void {
    const placeholder = this.getAttribute("placeholder") ?? "";
    input.placeholder = placeholder;

    const autocomplete = this.getAttribute("autocomplete") ?? "off";
    input.setAttribute("autocomplete", autocomplete);

    input.disabled = this.hasAttribute("disabled");
    input.readOnly = this.hasAttribute("readonly");

    if (this.hasAttribute("autofocus")) {
      input.autofocus = true;
    }
  }

  /**
   * Update optional attributes
   */
  #updateOptionalAttributes(input: HTMLInputElement): void {
    const optionalAttrs = [
      "min",
      "max",
      "step",
      "minlength",
      "maxlength",
      "name",
      "required",
      "pattern",
    ] as const;

    for (const attr of optionalAttrs) {
      const value = this.getAttribute(attr);
      if (value === null) {
        input.removeAttribute(attr);
      } else {
        input.setAttribute(attr, value);
      }
    }
  }

  /**
   * Update theme and size data attributes
   */
  #updateDataAttributes(): void {
    const size = this.getAttribute("size") ?? "medium";
    this.setAttribute("data-size", size);

    const isDark =
      this.hasAttribute("data-theme") ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      this.setAttribute("data-theme", "dark");
    }
  }

  /**
   * Sync value from attribute
   */
  #syncValueFromAttribute(input: HTMLInputElement): void {
    if (input.value === "") {
      const attrValue = this.getAttribute("value");
      if (attrValue !== null) {
        input.value = attrValue;
        this.#internals.setFormValue(attrValue);
      }
    }
  }

  protected _render(): void {
    if (!(this.#input && this.#label)) {
      return;
    }

    this.#updateInputType(this.#input);
    this.#updateLabel(this.#label, this.#input);
    this.#updateCommonAttributes(this.#input);
    this.#updateOptionalAttributes(this.#input);
    this.#updateDataAttributes();
    this.#syncValueFromAttribute(this.#input);
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "value" && this.#input && value !== this.#input.value) {
      this.#input.value = value ?? "";
      this.#internals.setFormValue(value ?? "");
    }
  }
}

customElements.define("mad-input", MadInput);
