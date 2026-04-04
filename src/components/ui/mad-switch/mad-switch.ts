import { BaseElement } from "@core/base-element.js";

export class MadSwitch extends BaseElement {
  static get observedAttributes(): string[] {
    return ["checked", "disabled", "size"];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }
  set checked(v: boolean) {
    v ? this.setAttribute("checked", "") : this.removeAttribute("checked");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    v ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }

  protected _render(): void {
    const checked = this.checked;
    const disabled = this.disabled;

    this.innerHTML = `
      <label class="inline-flex items-center gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}">
        <input type="checkbox" class="sr-only peer" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
        <div class="relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-orange-600"></div>
        <slot></slot>
      </label>
    `;

    const input = this.querySelector("input") as HTMLInputElement | null;
    input?.removeAttribute("data-mad-hook");
    input?.addEventListener("change", () => {
      this.checked = input.checked;
      this._emit("mad-change", { checked: this.checked });
    });
    if (input) {
      input.dataset.madHook = "true";
    }
  }
}

customElements.define("mad-switch", MadSwitch);
