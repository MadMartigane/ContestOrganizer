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

  private currentImgIdx: number = 0;
  private domImg: HTMLImageElement | null;

  constructor() {
    window.setInterval(() => {
      this.displayNextImg();
    }, 5000);
  }

  private displayNextImg() {
    if (this.currentImgIdx < this.imgList.length - 1) {
      this.currentImgIdx++;
    } else {
      this.currentImgIdx = 0;
    }

    if (this.domImg) {
      this.domImg.src = this.imgList[this.currentImgIdx].src;
      this.domImg.width = this.imgList[this.currentImgIdx].width;
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
          <h1 class="container-xxxxl">Contest Tournament</h1>

          <div>
            <img
              ref={el => {
                this.domImg = el || null;
              }}
              height="150"
              width="300"
              slot="image"
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
