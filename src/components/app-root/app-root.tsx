import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {
  constructor() {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', mediaQuery => this.toggleDarkTheme(mediaQuery.matches));
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

  render() {
    return <Host>{this.renderIonicApp()}</Host>;
  }
}
