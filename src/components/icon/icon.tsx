import { Component, Host, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'mad-icon',
  shadow: false,
})
export class MadIcon {
  private className: string;
  private classSize: string;
  private classColor: string;

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
    this.setClassName();

    if (this.xxs) {
      this.classSize = 'gg-xxs';
    } else if (this.xs) {
      this.classSize = 'gg-xs';
    } else if (this.s) {
      this.classSize = 'gg-s';
    } else if (this.l) {
      this.classSize = 'gg-l';
    } else if (this.xl) {
      this.classSize = 'gg-xl';
    } else if (this.xxl) {
      this.classSize = 'gg-xxl';
    } else {
      this.classSize = 'gg-m';
    }

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

  @Watch('name')
  setClassName() {
    this.className = `gg-${this.name || 'band-aid'}`;
  }

  render() {
    return (
      <Host>
        <ion-text class="ion-margin" color={this.classColor}>
          <i class={`mad-icon ${this.classSize} ${this.className}`}></i>
        </ion-text>
      </Host>
    );
  }
}
