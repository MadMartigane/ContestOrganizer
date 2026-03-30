import { BaseElement } from "@core/base-element.js";
import router, { type Router } from "../../modules/router/router.js";

export class AppRoot extends BaseElement {
  private readonly router: Router = router;

  constructor() {
    super();
    this.router.setRedirection({
      from: "/app/:anything",
      to: "/home",
    });

    this.router.setDefaultUrl("/home");
    this.router.setNotFoundUrl("/404");
  }

  protected _setupProperties(): void {
    // No reactive properties needed
  }

  protected _render(): void {
    this.innerHTML = `
			<mad-route component="page-home" url="/home"></mad-route>
			<mad-route component="page-tournament-select" url="/tournaments"></mad-route>
			<mad-route component="mad-select-team" url="/team-select/:teamId/:teamType"></mad-route>
			<mad-route component="page-tournament" url="/tournament/:tournamentId"></mad-route>
			<mad-route component="page-match" url="/match/:tournamentId"></mad-route>
			<mad-route component="page-404" url="/404"></mad-route>
			<mad-route component="page-config" url="/config"></mad-route>
		`;
  }
}

customElements.define("app-root", AppRoot);
