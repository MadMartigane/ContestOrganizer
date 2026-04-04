/**
 * Shared Constructable Stylesheets for Web Components
 * Provides memory-efficient, shareable styles across component instances
 * @module core/styles
 */

/**
 * Base stylesheet with common :host rules.
 * Applied to all components via BaseElement
 */
export const baseSheet = new CSSStyleSheet();
baseSheet.replaceSync(`
  :host { display: block; }
  :host([hidden]) { display: none !important; }
`);

/**
 * Shared stylesheet for inline-block components.
 * Used by: mad-icon, mad-badge, mad-spinner, mad-tooltip
 */
export const inlineBlockSheet = new CSSStyleSheet();
inlineBlockSheet.replaceSync(`
  :host { display: inline-block; }
  :host([hidden]) { display: none !important; }
`);

/**
 * Shared stylesheet for spinner-specific animations.
 */
export const spinnerSheet = new CSSStyleSheet();
spinnerSheet.replaceSync(`
  :host { display: inline-block; vertical-align: middle; }
  svg { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`);

/**
 * Creates a component-specific stylesheet.
 * @param css - The CSS rules for the component
 * @returns A new CSSStyleSheet instance
 */
export function createComponentSheet(css: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  return sheet;
}
