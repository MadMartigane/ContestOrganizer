import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {
  render() {
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
          <ion-route url="/team-select/:teamId" component="page-team-select"></ion-route>
          <ion-route url="/tournament/:tournamentId" component="page-tournament"></ion-route>
        </ion-router>
        <ion-nav></ion-nav>
      </ion-app>
    )
  }
}
