
export default class Utils {

  public static setFocus (selector: string): void {
    setTimeout(() => {
      // @ts-ignore
      document.querySelector(selector)?.setFocus();
    }, 400);
  }

  public static async confirmChoice(message = "Es-tu sûre ?", cancel = "Non", confirm = "Oui"): Promise<boolean> {
    const alert = document.createElement("ion-alert");
    alert.header = "🚨";
    alert.message = [
      "<h3 class='confirm-alert-message'>",
      message,
      "</h3>"
    ].join("");
    alert.keyboardClose = true;
    alert.cssClass = "confirm-alert";
    alert.buttons = [
      {
        text: cancel,
        role: "cancel"
      },
      {
        text: confirm,
        role: "confirm"
      }
    ];

    // No need to remove the child, <ion-alert> already do it.
    document.body.appendChild(alert);
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === "confirm") {
      return true;
    }

    return false;
  }

}


