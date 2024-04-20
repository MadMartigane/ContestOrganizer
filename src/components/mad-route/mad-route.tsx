import { Component, h, Prop, State } from '@stencil/core';
import { Router } from '../../modules/router/';
import router from '../../modules/router/';

type Fragment = { name: string; idx: number; value?: string };

@Component({
  tag: 'mad-route',
  styleUrl: 'mad-route.css',
  shadow: false,
})
export class MadRoute {
  private readonly router: Router = router;

  private fragments: Array<Fragment> | null;
  private arguments: string = '';

  @Prop() url: string;
  @Prop() component: string;

  @State() private match: boolean;

  constructor() {
    console.log('mad-router constructor.');
    this.fragments = this.getFragments();
    console.log('mad-router this.fragments: ', this.fragments);

    this.installEventLister();
    this.getMatchAndArguments();
  }

  private getFragments(): Array<Fragment> | null {
    if (!this.url) {
      return null;
    }

    const fragments: Array<Fragment> = [];
    const urlFragments = this.url.split('/');

    urlFragments.forEach((fragment: string, idx: number) => {
      if (fragment.startsWith(':')) {
        fragments.push({ name: fragment, idx });
      }
    });

    return fragments;
  }

  private fragmentNameToDomArgument(name: string): string {
    return name.replace(/^:/, '').replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());
  }

  private getMatchAndArguments() {
    this.match = this.router.match(this.url);
    this.arguments = '';

    console.log('URL %s match %s: ', this.url, this.router.route, this.match);
    if (!this.match) {
      return;
    }

    this.fragments?.forEach(fragment => {
      const value = this.router.get(fragment.idx);
      this.arguments += `${this.fragmentNameToDomArgument(fragment.name)}="${value}" `;
    });

    console.log('this.arguments: ', this.arguments);
  }

  private installEventLister() {
    this.router.onUpdate(() => {
      this.getMatchAndArguments();
    });
  }

  render() {
    const html = `<${this.component} ${this.arguments}></${this.component}>`;
    return <div innerHTML={this.match ? html : ''}></div>;
  }
}
