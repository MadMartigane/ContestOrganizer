const debounceCollector = {};
function unmount(child, parent) {
  const targetParent = parent ?? document.body;
  return setTimeout(() => {
    targetParent?.removeChild(child);
  });
}
function setFocus(selector) {
  if (typeof selector === "string") {
    setTimeout(() => {
      const element = document.querySelector(selector);
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
) {
  return new Promise((resolve) => {
    // biome-ignore lint/suspicious/noAlert: using native confirm for UX simplification
    const result = window.confirm(message);
    resolve(result);
  });
}
function scrollIntoView(selector) {
  if (!selector) {
    console.warn("[Utils.scrollIntoView()] selector is empty, aborting.");
    return;
  }
  if (typeof selector === "string") {
    setTimeout(() => {
      const element = window.document.querySelector(selector);
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
function debounce(name, callback) {
  if (debounceCollector[name]) {
    window.clearTimeout(debounceCollector[name]);
  }
  debounceCollector[name] = window.setTimeout(() => {
    callback();
    delete debounceCollector[name];
  }, 300);
}
function alertChoice(message = "Attention", _close = "Fermer") {
  return new Promise((resolve) => {
    // biome-ignore lint/suspicious/noAlert: using native alert for UX simplification
    window.alert(message);
    resolve();
  });
}
function installEventHandler(domElement, eventName, callback) {
  if (!domElement || domElement.dataset.madHook === "true") {
    return;
  }
  domElement.addEventListener(eventName, (event) => {
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
