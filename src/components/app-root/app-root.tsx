import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  // shadow: true,
})
export class AppRoot {
  render() {
    return (
      <ion-app>
        <ion-router useHash={true}>
          <ion-route-redirect from="/" to="/app/conf"></ion-route-redirect>
          <ion-route url="/app" component="app-tabs">
            <ion-route url="/conf" component="tab-conf">
              <ion-route component="page-conf"></ion-route>
            </ion-route>
            <ion-route url="/notice" component="tab-notice">
              <ion-route component="page-notice"></ion-route>
            </ion-route>
          </ion-route>
          <ion-route url="/profile/:name" component="page-profile"></ion-route>
        </ion-router>
        <ion-nav></ion-nav>
      </ion-app>
    )
  }
}
