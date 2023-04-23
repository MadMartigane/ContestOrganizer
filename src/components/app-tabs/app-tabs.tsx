import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-tabs',
  styleUrl: 'app-tabs.css',
  // shadow: true,
})
export class AppTabs {

  render() {
    return (
      <ion-tabs>
        <ion-tab tab="tab-conf">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab tab="tab-notice">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab-conf">
            <ion-icon name="trophy-outline"></ion-icon>
            <ion-label>Tournois</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-notice">
            <ion-icon name="notifications"></ion-icon>
            <ion-badge color="danger">12</ion-badge>
            <ion-label>Notices</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    );
  }

}
