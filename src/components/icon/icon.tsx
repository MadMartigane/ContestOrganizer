import { Component, Host, Prop, Watch, h } from '@stencil/core';
import setting, { GlobalSetting } from '../../modules/global-setting/global-setting';

@Component({
  tag: 'mad-icon',
  shadow: false,
})
export class MadIcon {
  private readonly globalSetting: GlobalSetting;
  private className: string;
  private classSize: string;
  private classColor: string;
  private classScale: string;
  private isDarkThemeActive: boolean;

  @Prop() name: string;
  @Prop() xxs?: boolean;
  @Prop() xs?: boolean;
  @Prop() s?: boolean;
  @Prop() m?: boolean;
  @Prop() l?: boolean;
  @Prop() xl?: boolean;
  @Prop() xxl?: boolean;
  @Prop() danger?: boolean;
  @Prop() dark?: boolean;
  @Prop() light?: boolean;
  @Prop() medium?: boolean;
  @Prop() primary?: boolean;
  @Prop() secondary?: boolean;
  @Prop() success?: boolean;
  @Prop() tertiary?: boolean;
  @Prop() warning?: boolean;

  constructor() {
    this.globalSetting = setting;

    this.setClassName();
    this.setClassSize();
    this.setClassColor();

    this.globalSetting.onDarkThemeChange(() => {
      this.isDarkThemeActive = this.globalSetting.isDarkThemeActive();
    });
  }

  @Watch('name')
  private setClassName() {
    this.className = `gg-${this.name || 'band-aid'}`;
  }

  private setClassSize() {
    if (this.xxs) {
      this.classSize = 'gg-xxs';
      this.classScale = 'small';
    } else if (this.xs) {
      this.classSize = 'gg-xs';
      this.classScale = 'small';
    } else if (this.s) {
      this.classSize = 'gg-s';
      this.classScale = 'medium';
    } else if (this.l) {
      this.classSize = 'gg-l';
      this.classScale = 'medium';
    } else if (this.xl) {
      this.classSize = 'gg-xl';
      this.classScale = 'large';
    } else if (this.xxl) {
      this.classSize = 'gg-xxl';
      this.classScale = 'large';
    } else {
      this.classSize = 'gg-m';
      this.classScale = 'medium';
    }
  }

  // TODO: transition ionic => spectrum
  private setClassColor() {
    if (this.danger) {
      this.classColor = 'danger';
    } else if (this.dark) {
      this.classColor = 'dark';
    } else if (this.light) {
      this.classColor = 'light';
    } else if (this.medium) {
      this.classColor = 'medium';
    } else if (this.secondary) {
      this.classColor = 'secondary';
    } else if (this.tertiary) {
      this.classColor = 'tertiary';
    } else if (this.success) {
      this.classColor = 'success';
    } else if (this.warning) {
      this.classColor = 'warning';
    } else {
      this.classColor = 'primary';
    }
  }

  render() {
    return (
      <Host>
        <sp-theme scale={this.classScale} color={this.isDarkThemeActive ? 'light' : 'dark'}>
          <i class={`mad-icon ${this.classSize} ${this.classColor} ${this.className}`}></i>
        </sp-theme>
      </Host>
    );
  }
}
