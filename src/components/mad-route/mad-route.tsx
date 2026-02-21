import { Component, h, Prop, State } from "@stencil/core";
import router, { type Router } from "../../modules/router/router";

const REGEX_START_COLON = /^:/;
const REGEX_UPPERCASE = /[A-Z]+(?![a-z])|[A-Z]/g;

interface Fragment {
  idx: number;
  name: string;
  value?: string;
}

@Component({
  tag: "mad-route",
  styleUrl: "mad-route.css",
  shadow: false,
})
export class MadRoute {
  private readonly router: Router = router;

  private readonly fragments: Fragment[] | null;
  private arguments = "";

  @Prop() url: string;
  @Prop() component: string;

  @State() private match: boolean;

  constructor() {
    this.fragments = this.getFragments();

    this.installEventLister();
    this.getMatchAndArguments();
    this.router.registerUrl(this.url);
  }

  private getFragments(): Fragment[] | null {
    if (!this.url) {
      return null;
    }

    const fragments: Fragment[] = [];
    const urlFragments = this.url.split("/");

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

  private getMatchAndArguments() {
    this.match = this.router.match(this.url);
    this.arguments = "";

    if (!this.match) {
      return;
    }

    if (this.fragments) {
      for (const fragment of this.fragments) {
        const value = this.router.get(fragment.idx);
        this.arguments += `${this.fragmentNameToDomArgument(fragment.name)}="${value}" `;
      }
    }
  }

  private installEventLister() {
    this.router.onUpdate(() => {
      this.getMatchAndArguments();
    });
  }

  render() {
    const html = `<${this.component} ${this.arguments}></${this.component}>`;
    return <div innerHTML={this.match ? html : ""} />;
  }
}
