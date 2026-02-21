export interface RedirectionOptions {
  from: string;
  to: string;
}

export class Router {
  private readonly callbacks: Array<() => void> = [];
  private readonly redirectionOptions: RedirectionOptions[] = [];
  private readonly registeredUrl: string[] = [];

  private checkingUrlTimeoutId: number | null = null;
  private defaultUrl: string | null;
  private notFoundUrl: string | null;

  constructor() {
    this.attachEventListners();

    this.scheduleCheckOfRegisteredAndRedirectionUrl();
  }

  get path() {
    return window.location.hash;
  }

  get route() {
    return window.location.hash.replace(/^#/, "");
  }

  private attachEventListners() {
    window.addEventListener("hashchange", () => {
      this.update();
    });
  }

  private checkDeadRoute(): void {
    if (["", "/"].includes(this.route)) {
      if (this.defaultUrl) {
        this.goTo(this.defaultUrl);
        return;
      }

      if (this.registeredUrl.length > 0) {
        this.goTo(this.registeredUrl.at(0) || "");
        return;
      }
    }

    if (this.notFoundUrl) {
      this.goTo(this.notFoundUrl);
      return;
    }

    // TODO: WARNING
  }

  private update(): void {
    if (this.callbacks.length === 0) {
      return;
    }

    this.callbacks.forEach((callback) => {
      setTimeout(() => {
        callback();
      });
    });

    this.scheduleCheckOfRegisteredAndRedirectionUrl();
  }

  private checkRegisteredAndRedirectionUrl(): void {
    const foundRegistered = this.registeredUrl.find((candidate) =>
      this.match(candidate)
    );
    if (foundRegistered) {
      return;
    }

    const foundRedirection = this.redirectionOptions.find((candidate) =>
      this.match(candidate.from)
    );
    if (foundRedirection) {
      this.goTo(foundRedirection.to);
      return;
    }

    this.checkDeadRoute();
  }

  private scheduleCheckOfRegisteredAndRedirectionUrl(): void {
    if (this.checkingUrlTimeoutId) {
      window.clearTimeout(this.checkingUrlTimeoutId);
    }

    this.checkingUrlTimeoutId = window.setTimeout((): void => {
      this.checkRegisteredAndRedirectionUrl();
      this.checkingUrlTimeoutId = null;
    }, 100);
  }

  public onUpdate(callbak: () => void) {
    this.callbacks.push(callbak);
  }

  public match(path: string): boolean {
    const route = this.route;
    const paths = path.split("/");
    const routes = route.split("/");

    const result = paths.every((value, i) => {
      return (value.startsWith(":") && routes[i]) || value === routes[i];
    });

    return result;
  }

  public get(idx: number): string | null {
    return this.route.split("/").at(idx) || null;
  }

  public goTo(hash: string): void {
    window.location.hash = hash.replace(/^#/, "");
  }

  public goBack(): void {
    window.history.back();
  }

  public setRedirection(option: RedirectionOptions): void {
    const alreadySet = this.redirectionOptions.find((candidate) => {
      return candidate.from === option.from;
    });

    if (alreadySet) {
      console.group("OVERWRITE REDIRECTION");
      console.warn('[Router] Only one redirection allowed by "from" url.');
      console.warn(
        '"%s" will be redirected to "%s" instead of "%s"',
        option.from,
        option.to,
        alreadySet.to
      );
      console.groupEnd();

      alreadySet.to = option.to;
      return;
    }

    this.redirectionOptions.push(option);
    this.scheduleCheckOfRegisteredAndRedirectionUrl();
  }

  public registerUrl(url: string): void {
    if (this.registeredUrl.includes(url)) {
      return;
    }

    this.registeredUrl.push(url);
    this.scheduleCheckOfRegisteredAndRedirectionUrl();
  }

  public setDefaultUrl(url: string): void {
    this.defaultUrl = url;
  }

  public setNotFoundUrl(url: string): void {
    this.notFoundUrl = url;
  }
}

const router = new Router();
export default router;
