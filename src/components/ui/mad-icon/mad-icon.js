import { BaseElement } from "@core/base-element.js";
import { createComponentSheet } from "@core/styles.js";
import { html, nothing } from "lit-html";

const iconSheet = createComponentSheet(":host { display: inline-block; }");
const ICON_MAP = {
  house: "house",
  gear: "gear",
  trophy: "trophy",
  controller: "game-controller",
  "magnifying-glass": "magnifying-glass",
  plus: "plus",
  minus: "minus",
  trash: "trash",
  "arrow-right": "arrow-right",
  "arrow-left": "arrow-left",
  "arrow-up": "arrow-up",
  "arrow-down": "arrow-down",
  "chevron-up": "caret-up",
  "chevron-down": "caret-down",
  "chevron-left": "caret-left",
  "chevron-right": "caret-right",
  crosshair: "crosshair",
  ban: "prohibit",
  robot: "robot",
  "calendar-check": "calendar-check",
  "calendar-plus": "calendar-plus",
  "calendar-event": "calendar",
  "play-circle": "play-circle",
  "stop-circle": "stop-circle",
  "check-circle": "check-circle",
  "check2-circle": "check-circle",
  "check2-square": "check-square",
  "check-square": "check-square",
  square: "square",
  "list-check": "list-checks",
  "sort-numeric-down": "sort-ascending",
  percent: "percent",
  sparkle: "sparkle",
  hand: "hand",
  keyboard: "keyboard",
  "hand-pointer": "hand-pointing",
  "computer-mouse": "mouse",
  command: "command",
  "arrows-left-right": "arrows-left-right",
  "rotate-left": "arrow-counter-clockwise",
  "plus-slash-minus": "plus-minus",
  "triangle-exclamation": "warning",
  "exclamation-triangle": "warning",
  "emoji-frown": "frown",
  "shield-x": "shield-warning",
  highlights: "sun-dim",
  magic: "sparkle",
  forward: "arrow-right",
  "dash-lg": "minus",
  "plus-lg": "plus",
  "arrow-counterclockwise": "arrow-counter-clockwise",
  "arrow-right-circle": "arrow-circle-right",
  dribbble: "basketball",
  trash3: "trash",
  eye: "eye",
  "eye-slash": "eye-slash",
  "dots-three": "dots-three",
  "caret-down": "caret-down",
  "caret-up": "caret-up",
  "caret-left": "caret-left",
  "caret-right": "caret-right",
  star: "star",
  users: "users",
  "chart-bar": "chart-bar",
  clock: "clock",
  "map-pin": "map-pin",
  basketball: "basketball",
  "soccer-ball": "soccer-ball",
  football: "football",
  "football-helmet": "football",
  whistle: "whistle",
  timer: "timer",
  medal: "medal",
  sneaker: "sneaker",
  "number-circle-eight": "number-circle-eight",
  heart: "heart",
  share: "share",
  "bookmark-simple": "bookmark-simple",
  hamburger: "hamburger",
  "caret-double-down": "caret-double-down",
  "caret-double-up": "caret-double-up",
  "arrow-fat-line-right": "arrow-fat-line-right",
  "arrow-fat-line-left": "arrow-fat-line-left",
  "arrow-fat-lines-right": "arrow-fat-lines-right",
  "arrow-fat-lines-left": "arrow-fat-lines-left",
  "arrow-fat-line-up": "arrow-fat-line-up",
  "arrow-fat-line-down": "arrow-fat-line-down",
  "arrow-fat-lines-up": "arrow-fat-lines-up",
  "arrow-fat-lines-down": "arrow-fat-lines-down",
  "arrow-bend-right-up": "arrow-bend-right-up",
  "arrow-bend-left-up": "arrow-bend-left-up",
  "arrow-bend-up-right": "arrow-bend-up-right",
  "arrow-bend-up-left": "arrow-bend-up-left",
  "arrow-bend-right-down": "arrow-bend-right-down",
  "arrow-bend-left-down": "arrow-bend-left-down",
  "arrow-bend-down-right": "arrow-bend-down-right",
  "arrow-bend-down-left": "arrow-bend-down-left",
  "arrow-bend-double-up-right": "arrow-bend-double-up-right",
  "arrow-bend-double-up-left": "arrow-bend-double-up-left",
  "arrow-bend-double-down-right": "arrow-bend-double-down-right",
  "arrow-bend-double-down-left": "arrow-bend-double-down-left",
  "arrow-elbow-up-right": "arrow-elbow-up-right",
  "arrow-elbow-up-left": "arrow-elbow-up-left",
  "arrow-elbow-down-right": "arrow-elbow-down-right",
  "arrow-elbow-down-left": "arrow-elbow-down-left",
  "arrow-elbow-right-up": "arrow-elbow-right-up",
  "arrow-elbow-right-down": "arrow-elbow-right-down",
  "arrow-elbow-left-up": "arrow-elbow-left-up",
  "arrow-elbow-left-down": "arrow-elbow-left-down",
  "arrow-square-out": "arrow-square-out",
  "arrow-square-in": "arrow-square-in",
  "arrow-square-up-right": "arrow-square-up-right",
  "arrow-square-down-left": "arrow-square-down-left",
  "arrow-square-up-left": "arrow-square-up-left",
  "arrow-square-down-right": "arrow-square-down-right",
  "arrow-circle-up": "arrow-circle-up",
  "arrow-circle-down": "arrow-circle-down",
  "arrow-circle-left": "arrow-circle-left",
  "arrow-circle-right": "arrow-circle-right",
  "arrow-u-up-left": "arrow-u-up-left",
  "arrow-u-right-up": "arrow-u-right-up",
  "arrow-u-left-up": "arrow-u-left-up",
  "arrow-u-right-down": "arrow-u-right-down",
  "arrow-u-left-down": "arrow-u-left-down",
  "arrow-u-up-right": "arrow-u-up-right",
  "arrow-u-down-left": "arrow-u-down-left",
  "arrow-u-down-right": "arrow-u-down-right",
  "arrows-out": "arrows-out",
  "arrows-in": "arrows-in",
  "arrows-horizontal": "arrows-horizontal",
  "arrows-vertical": "arrows-vertical",
  "arrows-merge": "arrows-merge",
  "arrows-split": "arrows-split",
  "arrows-clockwise": "arrows-clockwise",
  "arrows-counter-clockwise": "arrows-counter-clockwise",
  "arrow-line-right": "arrow-line-right",
  "arrow-line-left": "arrow-line-left",
  "arrow-line-up": "arrow-line-up",
  "arrow-line-down": "arrow-line-down",
  info: "info",
  check: "check",
  x: "x",
  warning: "warning",
  "warning-circle": "warning-circle",
  list: "list",
  "list-plus": "list-plus",
  "floppy-disk": "floppy-disk",
};
export class MadIcon extends BaseElement {
  static get observedAttributes() {
    return ["name", "label"];
  }
  _setupProperties() {
    this._initialized = true;
  }
  _createRenderRoot() {
    const root = super._createRenderRoot();
    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, iconSheet];
    }
    return root;
  }
  _render() {
    const name = this.getAttribute("name") ?? "";
    const label = this.getAttribute("label");
    const phName = ICON_MAP[name] ?? name;
    this._renderTemplate(html`
      <ph-icon
        part="base"
        name="${phName}"
        aria-label="${label ?? nothing}"
        aria-hidden="${label ? nothing : "true"}"
      ></ph-icon>
    `);
  }
}
customElements.define("mad-icon", MadIcon);
