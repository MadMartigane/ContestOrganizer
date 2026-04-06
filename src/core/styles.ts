/**
 * Shared Constructable Stylesheets for Web Components
 * Provides memory-efficient, shareable styles across component instances
 * @module core/styles
 */

/**
 * Base stylesheet with CSS reset, typography, and common :host rules.
 * Applied to all components via BaseElement
 */
export const baseSheet = new CSSStyleSheet();
baseSheet.replaceSync(`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :host {
    display: block;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    color: var(--text-color, inherit);
    background-color: var(--bg-color, transparent);
  }
  :host([hidden]) { display: none !important; }
  @media (prefers-color-scheme: dark) {
    :host {
      --text-color: var(--text-neutral-50, #fafafa);
      --bg-color: var(--bg-neutral-800, #262626);
    }
  }
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
 * Tailwind CSS utility classes stylesheet for Shadow DOM.
 * Provides common Tailwind utilities that global CSS doesn't reach inside shadow roots.
 *
 * WHY THIS IS NEEDED:
 * - Global Tailwind CSS (via @source directive) doesn't penetrate Shadow DOM boundaries
 * - The @source directive scans TS files but may miss classes inside template literals
 * - Some classes used in components exist ONLY here (not in global CSS safelist):
 *   - shrink-0 (mad-breadcrumb)
 *   - grid-cols-11 (page-match)
 *   - col-span-* (match-tile)
 * - This sheet ensures all components have access to essential Tailwind utilities
 * - Contains ~190 utility classes covering layout, spacing, typography, colors, effects
 *
 * @source is configured in src/global/tailwind.css to scan TS files and generate
 * utility classes in vanilla.css (light DOM only). This sheet is the shadow DOM
 * equivalent that serves as a safety net.
 */
export const tailwindSheet = new CSSStyleSheet();
tailwindSheet.replaceSync(`
  /* Layout & Display */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .grid { display: grid; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .block { display: block; }
  .inline-block { display: inline-block; }
  .hidden { display: none; }
  .container { width: 100%; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
  .max-w-\\[1280px\\] { max-width: 1280px; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .shrink-0 { flex-shrink: 0; }

  /* Spacing */
  .m-0 { margin: 0; }
  .m-6 { margin: 1.5rem; }
  .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
  .mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
  .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
  .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
  .my-12 { margin-top: 3rem; margin-bottom: 3rem; }
  .p-0 { padding: 0; }
  .p-3 { padding: 0.75rem; }
  .p-4 { padding: 1rem; }
  .p-8 { padding: 2rem; }
  .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
  .gap-1 { gap: 0.25rem; }
  .gap-2 { gap: 0.5rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .gap-8 { gap: 2rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-4 { margin-top: 1rem; }

  /* Typography */
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .whitespace-nowrap { white-space: nowrap; }
  .font-bold { font-weight: 700; }
  .font-mono { font-family: ui-monospace, SFMono-Regular, monospace; }
  .leading-relaxed { line-height: 1.625; }

  /* Colors (Text) */
  .text-neutral-50 { color: #fafafa; }
  .text-neutral-100 { color: #f5f5f5; }
  .text-neutral-200 { color: #e5e5e5; }
  .text-neutral-400 { color: #a3a3a3; }
  .text-neutral-500 { color: #737373; }
  .text-neutral-600 { color: #525252; }
  .text-neutral-800 { color: #262626; }
  .text-white { color: #ffffff; }
  .text-orange-600 { color: #ea580c; }
  .text-green-600 { color: #16a34a; }
  .text-yellow-600 { color: #ca8a04; }
  .text-red-600 { color: #dc2626; }

  /* Colors (Background) */
  .bg-neutral-50 { background-color: #fafafa; }
  .bg-neutral-100 { background-color: #f5f5f5; }
  .bg-neutral-700 { background-color: #404040; }
  .bg-white { background-color: #ffffff; }
  .bg-orange-600 { background-color: #ea580c; }
  .bg-red-50 { background-color: #fef2f2; }

  /* Colors (Border) */
  .border { border-width: 1px; }
  .border-solid { border-style: solid; }
  .border-neutral-200 { border-color: #e5e5e5; }
  .border-red-200 { border-color: #fecaca; }
  .border-sky-300 { border-color: #7dd3fc; }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .dark\\:bg-neutral-600 { background-color: #525252; }
    .dark\\:bg-neutral-700 { background-color: #404040; }
    .dark\\:bg-neutral-800 { background-color: #262626; }
    .dark\\:bg-orange-700 { background-color: #c2410c; }
    .dark\\:text-neutral-50 { color: #fafafa; }
    .dark\\:text-neutral-100 { color: #f5f5f5; }
    .dark\\:text-neutral-200 { color: #e5e5e5; }
    .dark\\:text-neutral-500 { color: #737373; }
    .dark\\:border-neutral-700 { border-color: #404040; }
  }

  /* Responsive */
  @media (min-width: 768px) {
    .md\\:hidden { display: none; }
    .md\\:block { display: block; }
    .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (min-width: 1024px) {
    .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  /* Interactivity */
  .cursor-pointer { cursor: pointer; }
  .hover\\:bg-neutral-50:hover { background-color: #fafafa; }
  .dark\\:hover\\:bg-neutral-800:hover { background-color: #262626; }
  .transition-colors { transition-property: color, background-color, border-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
  .opacity-0 { opacity: 0; }
  .opacity-25 { opacity: 0.25; }
  .opacity-75 { opacity: 0.75; }
  .pointer-events-none { pointer-events: none; }

  /* Effects */
  .rounded { border-radius: 0.25rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }

  /* Accessibility */
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }

  /* Dividers */
  .divide-y > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; }
  .divide-neutral-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e5e5; }
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
