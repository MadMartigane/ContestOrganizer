import { BaseElement } from "@core/base-element";
import { createComponentSheet } from "@core/styles";
import { html, nothing } from "lit-html";

const inputSheet = createComponentSheet(`
  .mad-input-root {
    display: block;

    &[hidden] {
      display: none;
    }

    &[data-size="small"] input {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    &[data-size="large"] input {
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
    }

    &[data-theme="dark"] {
      --mad-input-label-color: #d6d3d1;
      --mad-input-border-color: #525252;
      --mad-input-bg-color: #262626;
      --mad-input-text-color: #fafafa;
      --mad-input-placeholder-color: #737373;
      --mad-input-focus-color: #fb923c;
      --mad-input-focus-ring-color: rgba(251, 146, 60, 0.2);
    }

    &[no-spin-buttons] input[type="number"]::-webkit-inner-spin-button,
    &[no-spin-buttons] input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[no-spin-buttons] input[type="number"] {
      -moz-appearance: textfield;
    }
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

    &::placeholder {
      color: var(--mad-input-placeholder-color, #a8a29e);
    }

    &:focus {
      outline: none;
      border-color: var(--mad-input-focus-color, #f97316);
      box-shadow: 0 0 0 3px var(--mad-input-focus-ring-color, rgba(249, 115, 22, 0.2));
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:read-only {
      cursor: default;
    }

    &:invalid {
      border-color: var(--mad-input-error-color, #ef4444);

      &:focus {
        box-shadow: 0 0 0 3px var(--mad-input-error-ring-color, rgba(239, 68, 68, 0.2));
      }
    }
  }
`);

/**
 * MadInput - Form-Associated Custom Element (FACE) text input
 *
 * Observed attributes:
 * - `type`: Input type (default: "text")
 * - `value`: Current input value
 * - `placeholder`: Placeholder text
 * - `label`: Label text displayed above the input
 * - `size`: Size — "small" | "medium" | "large" (default: "medium")
 * - `disabled`: Disables the input
 * - `readonly`: Makes the input read-only
 * - `autofocus`: Auto-focuses the input on connect
 * - `autocomplete`: Autocomplete hint (default: "off")
 * - `min` / `max` / `step`: Numeric constraints
 * - `minlength` / `maxlength`: Length constraints
 * - `name`: Form field name
 * - `required`: Marks as required for validation
 * - `pattern`: Regex pattern for validation
 * - `no-spin-buttons`: Hides number input spin buttons
 *
 * Custom events:
 * - `change`: Fired on input change, detail: { value: string }
 *
 * @element mad-input
 */
export class MadInput extends BaseElement {
  /** Enable form association */
  static formAssociated = true;

  /** Observed attributes for reactivity */
  static get observedAttributes() {
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
    ] as const;
  }

  /** ElementInternals for form integration */
  readonly #internals: ElementInternals;

  #pendingValue: string | null = null;

  #getInput(): HTMLInputElement | null {
    if (!this._initialized) {
      return null;
    }
    return this._renderRoot.querySelector("input");
  }

  constructor() {
    super();

    // Attach ElementInternals for form integration
    this.#internals = this.attachInternals();
  }

  /**
   * Handles input event - syncs value to internals
   */
  #handleInput(): void {
    const input = this._renderRoot.querySelector("input");
    this.#internals.setFormValue(input?.value ?? "");
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
    const input = this._renderRoot.querySelector("input");
    if (!input) {
      return;
    }

    const validity = input.validity;
    this.#internals.setValidity(validity, input.validationMessage);
  }

  /**
   * Gets the current input value
   */
  get value(): string {
    const input = this.#getInput();
    return input?.value ?? this.#pendingValue ?? "";
  }

  /**
   * Sets the input value
   */
  set value(v: string) {
    const input = this.#getInput();
    if (input) {
      input.value = v;
    } else {
      this.#pendingValue = v;
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
    const input = this._renderRoot.querySelector("input");
    input?.focus();
  }

  /**
   * Blur the input element
   */
  blur(): void {
    const input = this._renderRoot.querySelector("input");
    input?.blur();
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

  protected _injectStyles(): void {
    super._injectStyles(inputSheet);
  }

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
  }

  protected _render(): void {
    const type = this.type;
    const value = this.value;
    const disabled = this.disabled;
    const required = this.required;
    const placeholder = this.getAttribute("placeholder") ?? "";
    const label = this.getAttribute("label") ?? "";
    const min = this.getAttribute("min");
    const max = this.getAttribute("max");
    const step = this.getAttribute("step");
    const minlength = this.getAttribute("minlength");
    const maxlength = this.getAttribute("maxlength");
    const pattern = this.getAttribute("pattern");
    const name = this.getAttribute("name") ?? "";
    const autocomplete = this.getAttribute("autocomplete") ?? "off";
    const hasAutofocus = this.hasAttribute("autofocus");
    const hasReadonly = this.hasAttribute("readonly");
    const size = this.getAttribute("size") ?? "medium";
    const isDark =
      this.hasAttribute("data-theme") || this.classList.contains("dark");

    this._renderTemplate(html`
      <div class="mad-input-root">
        <div class="input-wrapper">
          <label class="label">${label}</label>
          <input
            type="${type}"
            .value=${value}
            placeholder="${placeholder}"
            ?disabled=${disabled}
            ?required=${required}
            ?readonly=${hasReadonly}
            ?autofocus=${hasAutofocus}
            min="${min ?? nothing}"
            max="${max ?? nothing}"
            step="${step ?? nothing}"
            minlength="${minlength ?? nothing}"
            maxlength="${maxlength ?? nothing}"
            pattern="${pattern ?? nothing}"
            name="${name}"
            autocomplete="${autocomplete}"
            @input="${this.#handleInput}"
            @change="${this.#handleChange}"
            @blur="${this.#handleBlur}"
            @focus="${this.#handleFocus}"
          />
        </div>
      </div>
    `);

    // Set data attributes for theming
    this.setAttribute("data-size", size);
    if (isDark) {
      this.setAttribute("data-theme", "dark");
    }

    // Sync form value after render
    const input = this._renderRoot.querySelector("input");
    if (input) {
      this.#internals.setFormValue(input.value);
    }

    if (this.#pendingValue !== null) {
      const input = this._renderRoot.querySelector("input");
      if (input) {
        input.value = this.#pendingValue;
      }
      this.#pendingValue = null;
    }
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "value") {
      const input = this.#getInput();
      if (input && value !== null && value !== input.value) {
        input.value = value;
        this.#internals.setFormValue(value);
      }
    }
  }
}

customElements.define("mad-input", MadInput);
