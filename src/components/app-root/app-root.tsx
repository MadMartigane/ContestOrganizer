import { Component, h, Host } from '@stencil/core';
// import '@spectrum-web-components/top-nav/sp-top-nav.js';
// import '@spectrum-web-components/top-nav/sp-top-nav-item.js';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {
  private spectrum: boolean;

  constructor() {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', mediaQuery => this.toggleDarkTheme(mediaQuery.matches));

    this.spectrum = false;
  }

  // Add or remove the "dark" class on the document body
  private toggleDarkTheme(shouldBeDark: boolean) {
    document.body.classList.toggle('dark', shouldBeDark);
    document.body.classList.toggle('light', !shouldBeDark);
  }

  private renderIonicApp() {
    return (
      <ion-app>
        <ion-router useHash={true}>
          <ion-route-redirect from="/" to="/app/home"></ion-route-redirect>
          <ion-route url="/app" component="app-tabs">
            <ion-route url="/home" component="tab-home">
              <ion-route component="page-home"></ion-route>
            </ion-route>
            <ion-route url="/tournaments" component="tab-tournament-select">
              <ion-route component="page-tournament-select"></ion-route>
            </ion-route>
          </ion-route>
          <ion-route url="/team-select/:teamId/:teamType" component="page-team-select"></ion-route>
          <ion-route url="/tournament/:tournamentId" component="page-tournament"></ion-route>
          <ion-route url="/match/:tournamentId" component="page-match"></ion-route>
        </ion-router>
        <ion-nav></ion-nav>
      </ion-app>
    );
  }

  private renderSpectrumApp() {
    return (
      <sp-top-nav>
        <sp-top-nav-item href="#">Site Name</sp-top-nav-item>
        <sp-top-nav-item href="#page-1" style="margin-inline-start: auto;">
          Page 1
        </sp-top-nav-item>
        <sp-top-nav-item href="#page-2">Page 2</sp-top-nav-item>
        <sp-top-nav-item href="#page-3">Page 3</sp-top-nav-item>
        <sp-top-nav-item href="#page-4">Page with Really Long Name</sp-top-nav-item>
      </sp-top-nav>
    );
  }

  render() {
    return <Host>{this.spectrum ? this.renderSpectrumApp() : this.renderIonicApp()}</Host>;
  }
}
