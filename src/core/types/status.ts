/**
 * Status data type definitions
 * @module core/types/status
 */

/**
 * Available status types for sections
 */
export type StatusType = "info" | "bug" | "task" | "note" | "warning";

/**
 * Badge variant types for visual styling
 */
export type BadgeVariant =
  | "primary"
  | "success"
  | "neutral"
  | "warning"
  | "danger";

/**
 * Structure for parsed markdown tables in status sections
 */
export interface StatusTable {
  /** Column headers for the table */
  headers: string[];
  /** Table row data as string arrays */
  rows: string[][];
}

/**
 * A single section within a status report
 */
export interface StatusSection {
  /** Badge variant for visual styling */
  badgeVariant: BadgeVariant;
  /** Markdown content of the section */
  content: string;
  /** Unique identifier for the section (e.g., "section-1") */
  id: string;
  /** Optional parsed tables extracted from markdown */
  tables?: StatusTable[];
  /** Display title for the section */
  title: string;
  /** Type classification of the section */
  type: StatusType;
}

/**
 * Root structure for status data
 */
export interface StatusData {
  /** ISO timestamp of last update */
  lastUpdated: string;
  /** Name of the project */
  projectName: string;
  /** Collection of status sections */
  sections: StatusSection[];
  /** Technology stack identifier */
  technology: string;
}

/**
 * Mapping from StatusType to corresponding BadgeVariant
 */
export const STATUS_TYPE_TO_VARIANT: Record<StatusType, BadgeVariant> = {
  info: "neutral",
  bug: "danger",
  task: "primary",
  note: "success",
  warning: "warning",
} as const;
