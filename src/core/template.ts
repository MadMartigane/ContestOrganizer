/**
 * Creates a shared template element with the given HTML content.
 * Templates are parsed once and cloned for each instance.
 * @param id - Unique identifier for template caching
 * @param html - HTML string for the template
 * @returns HTMLTemplateElement
 */
export function createTemplate(id: string, html: string): HTMLTemplateElement {
  const existing = document.getElementById(id) as HTMLTemplateElement | null;
  if (existing) {
    return existing;
  }

  const template = document.createElement("template");
  template.id = id;
  template.innerHTML = html;
  return template;
}

/**
 * Clones a template into a shadow root or element.
 * @param template - The template to clone
 * @param root - The target shadow root or element
 * @returns DocumentFragment
 */
export function cloneInto(
  root: ShadowRoot | Element,
  template: HTMLTemplateElement
): DocumentFragment {
  const content = template.content.cloneNode(true) as DocumentFragment;
  root.appendChild(content);
  return content;
}
