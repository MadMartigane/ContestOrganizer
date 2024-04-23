import { Component, h, Host } from '@stencil/core';
import router, { Router } from '../../modules/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {
  private readonly router: Router = router;

  constructor() {
    this.router.setRedirection({
      from: '/app/:anything',
      to: '/home',
    });

    this.router.setDefaultUrl('/home');
    this.router.setNotFoundUrl('/404');
  }

  render() {
    return (
      <Host>
        <mad-route url="/home" component="page-home"></mad-route>
        <mad-route url="/tournaments" component="page-tournament-select"></mad-route>
        <mad-route url="/team-select/:teamId/:teamType" component="page-team-select"></mad-route>
        <mad-route url="/tournament/:tournamentId" component="page-tournament"></mad-route>
        <mad-route url="/match/:tournamentId" component="page-match"></mad-route>
        <mad-route url="/404" component="page-404"></mad-route>
      </Host>
    );
  }
}
