import type WaButton from "@awesome.me/webawesome/dist/components/button/button.js";
import type WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

const debounceCollector: { [index: string]: number } = {};

function unmount(child: HTMLElement, parent?: HTMLElement) {
  const targetParent = parent ?? document.body;

  return setTimeout(() => {
    targetParent?.removeChild(child);
  });
}

function setFocus(selector: string | HTMLElement): void {
  if (typeof selector === "string") {
    setTimeout(() => {
      const element: HTMLElement | null = document.querySelector(selector);
      if (element?.focus) {
        element.focus();
      }
    }, 300);
    return;
  }

  if (typeof selector === "object" && selector.focus) {
    setTimeout(() => {
      selector.focus();
    }, 200);
    return;
  }

  console.warn("[Utils.setFocus()] Unable to set the focus on: ", selector);
}

function confirmChoice(
  message = "Es-tu sûre ?",
  cancel = "Non",
  confirm = "Oui"
): Promise<boolean> {
  let resolve: (value: boolean | PromiseLike<boolean>) => void;
  const promise: Promise<boolean> = new Promise((res) => {
    resolve = res;
  });

  const dialog = document.createElement("wa-dialog") as unknown as WaDialog;
  const paramElement: HTMLParagraphElement = document.createElement("p");
  paramElement.innerText = message;
  dialog.append(paramElement);

  const titleElement: HTMLSpanElement = document.createElement("span");
  titleElement.innerText = "🚨";
  titleElement.classList.add("3xl");
  titleElement.slot = "label";
  dialog.append(titleElement);

  const cancelButton = document.createElement(
    "wa-button"
  ) as unknown as WaButton;
  const confirmButton = document.createElement(
    "wa-button"
  ) as unknown as WaButton;

  cancelButton.innerText = cancel;
  cancelButton.variant = "warning";
  cancelButton.slot = "footer";
  cancelButton.size = "large";

  confirmButton.innerText = confirm;
  confirmButton.variant = "brand";
  confirmButton.slot = "footer";
  confirmButton.size = "large";

  dialog.append(cancelButton);
  dialog.append(confirmButton);

  document.body.appendChild(dialog as unknown as HTMLElement);
  dialog.setAttribute("open", "");

  cancelButton.addEventListener("click", () => {
    dialog.removeAttribute("open");
    unmount(dialog as unknown as HTMLElement);
    resolve(false);
  });

  confirmButton.addEventListener("click", () => {
    dialog.removeAttribute("open");
    unmount(dialog as unknown as HTMLElement);
    resolve(true);
  });

  // Prevent the dialog from closing when the user clicks on the overlay
  dialog.addEventListener("wa-request-close", (event: CustomEvent) => {
    if (event.detail.source === "overlay") {
      event.preventDefault();
    }
  });

  return promise;
}

function scrollIntoView(selector: string | HTMLElement): void {
  if (!selector) {
    console.warn("[Utils.scrollIntoView()] selector is empty, aborting.");
    return;
  }

  if (typeof selector === "string") {
    setTimeout(() => {
      const element: Element | null = window.document.querySelector(selector);
      if (!element) {
        console.warn(
          '[Utils.scrollIntoView()] dom element "%s" not found, aborting.',
          selector
        );
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return;
  }

  setTimeout(() => {
    selector.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
  return;
}

function debounce(name: string, callback: () => void): void {
  if (debounceCollector[name]) {
    window.clearTimeout(debounceCollector[name]);
  }

  debounceCollector[name] = window.setTimeout(() => {
    callback();
    delete debounceCollector[name];
  }, 300);
}

function alertChoice(message = "Attention", close = "Fermer"): Promise<void> {
  let resolve: (value: void | PromiseLike<void>) => void;
  const promise: Promise<void> = new Promise((res) => {
    resolve = res;
  });

  const dialog = document.createElement("wa-dialog") as unknown as WaDialog;
  const paramElement: HTMLParagraphElement = document.createElement("p");
  paramElement.innerText = message;
  dialog.append(paramElement);

  const titleElement: HTMLSpanElement = document.createElement("span");
  titleElement.innerText = "⚠️";
  titleElement.classList.add("3xl");
  titleElement.slot = "label";
  dialog.append(titleElement);

  const closeButton = document.createElement(
    "wa-button"
  ) as unknown as WaButton;
  closeButton.innerText = close;
  closeButton.variant = "brand";
  closeButton.slot = "footer";
  closeButton.size = "large";

  dialog.append(closeButton);

  document.body.appendChild(dialog as unknown as HTMLElement);
  dialog.setAttribute("open", "");

  closeButton.addEventListener("click", () => {
    dialog.removeAttribute("open");
    unmount(dialog as unknown as HTMLElement);
    resolve();
  });

  // Prevent the dialog from closing when the user clicks on the overlay
  dialog.addEventListener("wa-request-close", (event: CustomEvent) => {
    if (event.detail.source === "overlay") {
      event.preventDefault();
    }
  });

  return promise;
}

function installEventHandler(
  domElement: HTMLElement | null | undefined,
  eventName: string,
  callback: (ev?: CustomEvent) => void
) {
  if (!domElement || domElement.dataset.madHook === "true") {
    return;
  }

  domElement.addEventListener(eventName, (event: CustomEvent) => {
    callback(event);
  });
  domElement.dataset.madHook = "true";
}

const Utils = {
  unmount,
  setFocus,
  confirmChoice,
  scrollIntoView,
  debounce,
  installEventHandler,
  alertChoice,
};

export default Utils;
