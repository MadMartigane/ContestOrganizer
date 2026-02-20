import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "page-home",
  styleUrl: "page-home.css",
  shadow: false,
})
export class PageHome {
  private readonly imgList: Array<{ src: string; width: number }> = [
    { width: 300, src: "assets/img/undraw_greek_freak.svg" },
    { width: 300, src: "assets/img/undraw_goal.svg" },
    { width: 100, src: "assets/img/undraw_basketball.svg" },
    { width: 300, src: "assets/img/undraw_home_run.svg" },
    { width: 200, src: "assets/img/undraw_junior_soccer.svg" },
  ];

  private domImg: HTMLImageElement | null;

  constructor() {
    window.setInterval(() => {
      this.displayNextImg();
    }, 5000);
  }

  private displayNextImg() {
    const idx = Math.floor(Math.random() * this.imgList.length);

    if (this.domImg) {
      this.domImg.src = this.imgList[idx].src;
      this.domImg.width = this.imgList[idx].width;
    }
  }

  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item>
            <sl-icon class="text-2xl" name="house" />
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          <h1>Contest Tournament</h1>

          <div class="flex-center">
            <img
              alt="Greek freak basketball"
              class="h-64"
              ref={(el) => {
                this.domImg = el || null;
              }}
              src="assets/img/undraw_greek_freak.svg"
              width="300"
            />
          </div>

          <div class="footer">
            <div class="grid-300">
              <sl-button href="#/config" size="large" variant="primary">
                <sl-icon name="gear" slot="prefix" />
                <span slot="suffix">Configuration</span>
              </sl-button>

              <sl-button href="#/tournaments" size="large" variant="primary">
                <sl-icon name="trophy" slot="prefix" />
                <span slot="suffix">Tournois</span>
              </sl-button>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
