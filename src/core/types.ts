/**
 * Core type definitions for Vanilla Web Components
 * @module core/types
 */

/**
 * Represents the value of an HTML attribute on a web component.
 * Attributes can be either a string value or null (not present).
 */
export type AttributeValue = string | null;

/**
 * Type for event handlers in custom events.
 * @template T - The detail type carried by the event
 */
export type EventHandler<T = unknown> = (event: CustomEvent<T>) => void;

/**
 * Interface for resources that require explicit cleanup.
 * Implement this for components that hold listeners, timers, or other resources.
 */
export interface Disposable {
  /**
   * Releases all resources held by the implementer.
   * Called when the component is disconnected from the DOM.
   */
  dispose(): void;
}

/**
 * Helper type to get the constructor type for a given class.
 * Useful for creating generic factory functions or decorators.
 * @template T - The class type
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Component lifecycle phase types
 */
export type ComponentLifecyclePhase =
  | "connected"
  | "disconnected"
  | "adopted"
  | "attributed";

/**
 * Map of observed attributes to their property types
 */
export interface ObservedAttributesMap {
  [key: string]: unknown;
}
