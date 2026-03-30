import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import router, { type Router } from "../../modules/router/router.js";

const REGEX_START_COLON = /^:/;
const REGEX_UPPERCASE = /[A-Z]+(?![a-z])|[A-Z]/g;

interface Fragment {
  idx: number;
  name: string;
  value?: string;
}

export class MadRoute extends BaseElement {
  private readonly router: Router = router;

  private readonly fragments: Fragment[] | null;
  private arguments = "";

  private readonly _matchSignal = new Signal<boolean>(false);

  static get observedAttributes(): string[] {
    return ["url", "component"];
  }

  constructor() {
    super();
    this.fragments = this.getFragments();
    this.router.registerUrl(this.url);
  }

  private get url(): string {
    return this.getAttribute("url") ?? "";
  }

  private get component(): string {
    return this.getAttribute("component") ?? "";
  }

  protected _setupProperties(): void {
    // Properties are handled via attributes
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "url") {
      this.router.registerUrl(value ?? "");
    }
    this._updateMatchAndArguments();
  }

  private getFragments(): Fragment[] | null {
    const url = this.url;
    if (!url) {
      return null;
    }

    const fragments: Fragment[] = [];
    const urlFragments = url.split("/");

    for (const [idx, fragment] of urlFragments.entries()) {
      if (fragment.startsWith(":")) {
        fragments.push({ name: fragment, idx });
      }
    }

    return fragments;
  }

  private fragmentNameToDomArgument(name: string): string {
    return name
      .replace(REGEX_START_COLON, "")
      .replace(REGEX_UPPERCASE, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
  }

  private _updateMatchAndArguments(): void {
    const match = this.router.match(this.url);
    this._matchSignal.value = match;
    this.arguments = "";

    if (!match) {
      return;
    }

    if (this.fragments) {
      for (const fragment of this.fragments) {
        const value = this.router.get(fragment.idx);
        this.arguments += `${this.fragmentNameToDomArgument(fragment.name)}="${value}" `;
      }
    }
  }

  private _installEventListener(): void {
    this.router.onUpdate(() => {
      this._updateMatchAndArguments();
    });
  }

  protected _render(): void {
    // Install router listener on first render
    this._installEventListener();
    this._updateMatchAndArguments();

    // Track the match signal for reactivity
    this._trackSignal(this._matchSignal);

    const html = `<${this.component} ${this.arguments}></${this.component}>`;
    this.innerHTML = this._matchSignal.value ? html : "";
  }
}

customElements.define("mad-route", MadRoute);
