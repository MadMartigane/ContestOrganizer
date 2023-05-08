
class Utils {

  setFocus (selector: string): void {
    setTimeout(() => {
      // @ts-ignore
      document.querySelector(selector)?.setFocus();
    }, 500);
  }
}

const utils = new Utils();
export default utils;

