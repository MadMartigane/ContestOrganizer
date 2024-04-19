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
    console.log('typeof selector: ', typeof selector);
    if (typeof selector === 'string') {
      setTimeout(() => {
        // @ts-ignore
        document.querySelector(selector)?.setFocus();
      }, 400);
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
}
