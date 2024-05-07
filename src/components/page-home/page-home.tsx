import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'page-home',
  styleUrl: 'page-home.css',
  shadow: false,
})
export class PageHome {
  private readonly imgList: Array<{ src: string; width: number }> = [
    { width: 300, src: 'assets/img/undraw_greek_freak.svg' },
    { width: 300, src: 'assets/img/undraw_goal.svg' },
    { width: 100, src: 'assets/img/undraw_basketball.svg' },
    { width: 300, src: 'assets/img/undraw_home_run.svg' },
    { width: 200, src: 'assets/img/undraw_junior_soccer.svg' },
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
            <sl-icon name="house" class="xl"></sl-icon>
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          <h1>Contest Tournament</h1>

          <div class="flex-center">
            <img
              ref={el => {
                this.domImg = el || null;
              }}
              class="h-64"
              width="300"
              src="assets/img/undraw_greek_freak.svg"
              alt="Greek freak basketball"
            />
          </div>

          <div class="footer">
            <div class="grid-300">
              <sl-button variant="primary" href="#/config" size="large">
                <sl-icon name="gear" slot="prefix"></sl-icon>
                <span slot="suffix">Configuration</span>
              </sl-button>

              <sl-button variant="primary" href="#/tournaments" size="large">
                <sl-icon name="trophy" slot="prefix"></sl-icon>
                <span slot="suffix">Tournois</span>
              </sl-button>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
