const debounceCollector: { [index: string]: number } = {};

export default class Utils {
  public static unmount(child: HTMLElement, parent?: HTMLElement) {
    if (!parent) {
      parent = document.body;
    }

    return setTimeout(() => {
      parent?.removeChild(child);
    });
  }

  public static setFocus(selector: string | HTMLElement): void {
    if (typeof selector === 'string') {
      setTimeout(() => {
        const element: HTMLElement | null = document.querySelector(selector);
        if (element && element.focus) {
          element.focus();
        }
      }, 300);
      return;
    }

    if (typeof selector === 'object' && selector.focus) {
      setTimeout(() => {
        selector.focus();
      }, 200);
      return;
    }

    console.warn('[Utils.setFocus()] Unable to set the focus on: ', selector);
  }

  public static async confirmChoice(message = 'Es-tu sûre ?', cancel = 'Non', confirm = 'Oui'): Promise<boolean> {
    const alert = document.createElement('ion-alert');
    alert.header = '🚨';
    alert.message = message;
    alert.keyboardClose = true;
    alert.cssClass = 'confirm-alert';
    alert.buttons = [
      {
        text: cancel,
        role: 'cancel',
      },
      {
        text: confirm,
        role: 'confirm',
      },
    ];

    // No need to remove the child, <ion-alert> already do it.
    document.body.appendChild(alert);
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      Utils.unmount(alert);
      return true;
    }

    Utils.unmount(alert);
    return false;
  }

  public static scrollIntoView(selector: string) {
    setTimeout(() => {
      const list: Element | null = window.document.querySelector(selector);
      if (list) {
        list.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  }

  public static debounce(name: string, callback: Function): void {
    if (debounceCollector[name]) {
      window.clearTimeout(debounceCollector[name]);
    }

    debounceCollector[name] = window.setTimeout(() => {
      callback();
      delete debounceCollector[name];
    }, 300);
  }
}
