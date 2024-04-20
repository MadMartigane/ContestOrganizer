export class Router {
  private readonly callbacks: Array<() => void> = [];

  constructor() {
    this.attachEventListners();
  }

  get path() {
    return window.location.hash;
  }

  get route() {
    return window.location.hash.replace(/^#/, '');
  }

  private attachEventListners() {
    window.addEventListener('hashchange', (event: HashChangeEvent) => {
      console.log('HashChangeEvent', event);
      this.update();
    });
  }

  private update(): void {
    if (this.callbacks.length === 0) {
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
    console.log('route: ', this.route);
    const paths = path.split('/');
    console.log('paths: ', paths);
    const routes = route.split('/');
    console.log('routes: ', routes);

    const result = paths.every((value, i) => {
      console.log('value [%s] %s === %s: ', i, value, routes[i], (value.startsWith(':') && routes[i]) || value === routes[i]);
      return (value.startsWith(':') && routes[i]) || value === routes[i];
    });

    console.log('result: ', result);
    return result;
  }

  public get(idx: number): string | null {
    return this.route.split('/').at(idx) || null;
  }

  public goTo(hash: string): void {
    window.location.hash = hash.replace(/^#/, '');
  }

  public goBack(): void {
    window.history.back();
  }
}

const router = new Router();
export default router;
