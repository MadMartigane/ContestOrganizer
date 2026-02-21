import type SlButton from "@shoelace-style/shoelace/dist/components/button/button.component";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component";

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

  const dialog: SlDialog = document.createElement("sl-dialog");
  const paramElement: HTMLParagraphElement = document.createElement("p");
  paramElement.innerText = message;
  dialog.append(paramElement);

  const titleElement: HTMLSpanElement = document.createElement("span");
  titleElement.innerText = "🚨";
  titleElement.classList.add("3xl");
  titleElement.slot = "label";
  dialog.append(titleElement);

  const cancelButton: SlButton = document.createElement("sl-button");
  const confirmButton: SlButton = document.createElement("sl-button");

  cancelButton.innerText = cancel;
  cancelButton.variant = "warning";
  cancelButton.slot = "footer";
  cancelButton.size = "large";

  confirmButton.innerText = confirm;
  confirmButton.variant = "primary";
  confirmButton.slot = "footer";
  confirmButton.size = "large";

  dialog.append(cancelButton);
  dialog.append(confirmButton);

  document.body.appendChild(dialog);
  dialog.show();

  cancelButton.addEventListener("click", () => {
    dialog.hide();
    unmount(dialog);
    resolve(false);
  });

  confirmButton.addEventListener("click", () => {
    dialog.hide();
    unmount(dialog);
    resolve(true);
  });

  // Prevent the dialog from closing when the user clicks on the overlay
  dialog.addEventListener("sl-request-close", (event: CustomEvent) => {
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
};

export default Utils;
