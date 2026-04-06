import { BaseElement } from "@core/base-element.js";
import { html, nothing } from "lit-html";
/**
 * MadInput - Form-Associated Custom Element (FACE) input component
 * @element mad-input
 * @extends BaseElement
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
    ];
  }
  /** ElementInternals for form integration */
  #internals;
  constructor() {
    super();
    // Attach ElementInternals for form integration
    this.#internals = this.attachInternals();
  }
  /**
   * Handles input event - syncs value to internals
   */
  #handleInput() {
    const input = this._renderRoot.querySelector("input");
    this.#internals.setFormValue(input?.value ?? "");
  }
  /**
   * Handles change event - dispatch custom event
   */
  #handleChange() {
    this._emit("change", { value: this.value });
  }
  /**
   * Handles blur event - run validation
   */
  #handleBlur() {
    this.#runValidation();
  }
  /**
   * Handles focus event
   */
  #handleFocus() {
    // Focus management
  }
  /**
   * Runs validation and updates internals
   */
  #runValidation() {
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
  get value() {
    const input = this._renderRoot.querySelector("input");
    return input?.value ?? "";
  }
  /**
   * Sets the input value
   */
  set value(v) {
    const input = this._renderRoot.querySelector("input");
    if (input) {
      input.value = v;
    }
    this.#internals.setFormValue(v);
    this._requestRender();
  }
  /**
   * Gets the associated form element
   */
  get form() {
    return this.#internals.form;
  }
  /**
   * Gets the input name
   */
  get name() {
    return this.getAttribute("name") ?? "";
  }
  /**
   * Sets the input name
   */
  set name(v) {
    this.setAttribute("name", v);
  }
  /**
   * Gets the input type
   */
  get type() {
    return this.getAttribute("type") ?? "text";
  }
  /**
   * Gets the input validity state
   */
  get validity() {
    return this.#internals.validity;
  }
  /**
   * Gets the validation message
   */
  get validationMessage() {
    return this.#internals.validationMessage;
  }
  /**
   * Checks if the input is valid
   */
  get willValidate() {
    return this.#internals.willValidate;
  }
  /**
   * Checks if the input is disabled
   */
  get disabled() {
    return this.hasAttribute("disabled");
  }
  /**
   * Sets the input disabled state
   */
  set disabled(v) {
    if (v) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  /**
   * Checks if the input is required
   */
  get required() {
    return this.hasAttribute("required");
  }
  /**
   * Sets the input required state
   */
  set required(v) {
    if (v) {
      this.setAttribute("required", "");
    } else {
      this.removeAttribute("required");
    }
  }
  /**
   * Gets the placeholder text
   */
  get placeholder() {
    return this.getAttribute("placeholder") ?? "";
  }
  /**
   * Focus the input element
   */
  focus() {
    const input = this._renderRoot.querySelector("input");
    input?.focus();
  }
  /**
   * Blur the input element
   */
  blur() {
    const input = this._renderRoot.querySelector("input");
    input?.blur();
  }
  /**
   * Check validity and return result
   */
  checkValidity() {
    return this.#internals.checkValidity();
  }
  /**
   * Report validity
   */
  reportValidity() {
    return this.#internals.reportValidity();
  }
  /**
   * Reset the input to default value
   */
  reset() {
    const defaultValue = this.getAttribute("value") ?? "";
    this.value = defaultValue;
    this.#internals.setValidity({ valueMissing: false }, "");
  }
  _setupProperties() {
    this._initialized = true;
  }
  _render() {
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
      this.hasAttribute("data-theme") ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    this._renderTemplate(html`
      <style>
        .mad-input-root {
          display: block;
        }
        .mad-input-root[hidden] {
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
        .mad-input-root[data-size="small"] input {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }
        .mad-input-root[data-size="large"] input {
          padding: 0.75rem 1rem;
          font-size: 1.125rem;
        }
        /* Dark theme via attribute */
        .mad-input-root[data-theme="dark"] {
          --mad-input-label-color: #d6d3d1;
          --mad-input-border-color: #525252;
          --mad-input-bg-color: #262626;
          --mad-input-text-color: #fafafa;
          --mad-input-placeholder-color: #737373;
          --mad-input-focus-color: #fb923c;
          --mad-input-focus-ring-color: rgba(251, 146, 60, 0.2);
        }
        /* No spin buttons for number input */
        .mad-input-root[no-spin-buttons] input[type="number"]::-webkit-inner-spin-button,
        .mad-input-root[no-spin-buttons] input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .mad-input-root[no-spin-buttons] input[type="number"] {
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
  }
  _onAttributeChange(name, value) {
    if (name === "value") {
      const input = this._renderRoot.querySelector("input");
      if (input && value !== null && value !== input.value) {
        input.value = value;
        this.#internals.setFormValue(value);
      }
    }
  }
}
customElements.define("mad-input", MadInput);
