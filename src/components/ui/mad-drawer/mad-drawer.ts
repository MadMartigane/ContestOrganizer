import { BaseElement } from "@core/base-element.js";

export class MadDrawer extends BaseElement {
  static get observedAttributes(): string[] {
    return ["open", "placement", "no-header"];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    v ? this.setAttribute("open", "") : this.removeAttribute("open");
  }

  get placement(): string {
    return this.getAttribute("placement") ?? "start";
  }
  set placement(v: string) {
    v ? this.setAttribute("placement", v) : this.removeAttribute("placement");
  }

  protected _render(): void {
    const isOpen = this.open;
    const placement = this.placement;

    const positionClasses: Record<string, string> = {
      start: "left-0 top-0 h-full border-r",
      end: "right-0 top-0 h-full border-l",
    };

    let translateClass = "translate-x-0";
    if (!isOpen) {
      translateClass =
        placement === "start" ? "-translate-x-full" : "translate-x-full";
    }

    const classes = `fixed z-50 w-80 max-w-[90vw] bg-white dark:bg-neutral-900 shadow-xl transition-transform duration-300 ease-out ${positionClasses[placement] ?? positionClasses.start} ${translateClass}`;

    this.innerHTML = `
      ${isOpen ? `<div class="fixed inset-0 bg-black/50 z-40" data-overlay></div>` : ""}
      <div class="${classes}" data-panel>
        <div class="flex flex-col h-full">
          <slot name="header"></slot>
          <div class="flex-1 overflow-y-auto p-4"><slot></slot></div>
          <slot name="footer"></slot>
        </div>
      </div>
    `;

    const overlay = this.querySelector<HTMLElement>("[data-overlay]");
    if (overlay && !overlay.dataset.madHook) {
      overlay.addEventListener("click", () => {
        this.open = false;
        this._emit("mad-close", {});
      });
      overlay.dataset.madHook = "true";
    }
  }
}

customElements.define("mad-drawer", MadDrawer);
