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
  _cancel = "Non",
  _confirm = "Oui"
): Promise<boolean> {
  return new Promise((resolve) => {
    // biome-ignore lint/suspicious/noAlert: using native confirm for UX simplification
    const result = window.confirm(message);
    resolve(result);
  });
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

function alertChoice(message = "Attention", _close = "Fermer"): Promise<void> {
  return new Promise((resolve) => {
    // biome-ignore lint/suspicious/noAlert: using native alert for UX simplification
    window.alert(message);
    resolve();
  });
}

function installEventHandler(
  domElement: HTMLElement | null | undefined,
  eventName: string,
  callback: (ev?: CustomEvent) => void
) {
  if (!domElement || domElement.dataset.madHook === "true") {
    return;
  }

  domElement.addEventListener(eventName, ((event: CustomEvent) => {
    callback(event);
  }) as EventListener);
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
