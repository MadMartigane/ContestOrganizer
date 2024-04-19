export class Router {
  private callbacks: Array<() => void>;

  constructor() {
    this.attachEventListners();
  }

  get path() {
    return window.location.hash;
  }

  get route() {
    return window.location.hash;
  }

  private attachEventListners() {
    window.addEventListener('hashchange', (event: HashChangeEvent) => {
      console.log('HashChangeEvent', event);
      this.update();
    });
  }

  private update(): void {
    if (this.callbacks.length !== 0) {
      return;
    }

    this.callbacks.forEach(callback => {
      setTimeout(() => {
        callback();
      });
    });
  }

  public onUpdate(callbak: () => void) {
    this.callbacks.push(callbak);
  }

  public match(path: string): boolean {
    const route = this.route;
    const paths = path.split('/');
    const routes = route.split('/');

    return paths.every((value, i) => {
      return value.startsWith(':') || value === routes[i];
    });
  }

  public get(param: string): string | null {
    const fragments = this.route.split('/');
    const index = fragments.findIndex(fragment => fragment.startsWith(':') && fragment.replace(':', '') === param);
    if (index === -1) {
      return null;
    }

    return this.route.split('/').at(index) || null;
  }
}

const router = new Router();
export default router;
