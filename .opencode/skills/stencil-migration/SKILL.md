---
name: stencil-migration
description: Migration patterns and common traps when converting Stencil components to Vanilla Web Components (BaseElement). Use when migrating components or debugging component-to-component communication issues.
compatibility: opencode
metadata:
  scope: migration
  frameworks: [stencil, vanilla-web-components]
  project: contestorganizer
---

# Skill: Stencil to Vanilla Web Components Migration

## Overview

ContestOrganizer is migrating from **Stencil** to **Vanilla Web Components** using `BaseElement`. This migration introduces subtle traps because Stencil's JSX-based property binding differs fundamentally from HTML's attribute-based model.

**Key Insight**: Stencil `@Prop()` expects JavaScript properties. HTML attributes are always strings. This mismatch causes silent failures.

## The Four Migration Traps

### Trap 1: Property vs Attribute (Object Props)

**The Problem:**

Stencil components use `@Prop()` decorator which expects JavaScript properties. When migrating parent components to vanilla, developers often pass complex objects as HTML attributes.

**Real Bug from Codebase:**

```typescript
// ❌ WRONG - Vanilla parent passing object as attribute
// src/components/match-tile/match-tile.ts:152
this.innerHTML = `
  <mad-team-tile 
    data-team='${JSON.stringify(host.team)}'  // String attribute!
    reverse="true"                              // String "true", not boolean!
  ></mad-team-tile>
`;

// Stencil child expects PROPERTY (object):
// src/components/team-tile/team-tile.tsx:18
@Prop() team: GenericTeam | null;  // Never receives the object!
```

**Why It Fails:**
1. `data-team` attribute contains a JSON string
2. Stencil's `@Prop() team` expects a JavaScript object
3. No automatic deserialization occurs
4. The component receives `undefined` or ignores the attribute entirely

**The Solution - Two-Pass Rendering:**

```typescript
// Step 1: Render HTML without complex data
this.innerHTML = `
  <div class="host-section">
    <mad-team-tile></mad-team-tile>
  </div>
`;

// Step 2: Query and set properties directly
const tile = this.querySelector("mad-team-tile");
if (tile && "team" in tile) {
  (tile as HTMLElement & { team: GenericTeam }).team = team;
}
```

**Real Implementation Example:**

```typescript
// src/components/select-team/select-team.ts:536-541
if (team?.id) {
  const tile = selectedTeamContainer.querySelector("mad-team-tile");
  if (tile && "team" in tile) {
    (tile as HTMLElement & { team: GenericTeam }).team = team;
  }
}
```

---

### Trap 2: Promise vs String (Async Props)

**The Problem:**

Stencil JSX allows passing Promises as props. Vanilla HTML template literals convert everything to strings, corrupting the Promise.

**Example of Bug:**

```typescript
// ❌ WRONG - Promise becomes "[object Promise]" string
`<mad-match-tile host-pending="${promise}"></mad-match-tile>`

// Stencil child expects:
@Prop() hostPending: Promise<TeamRow>;
```

**The Solution - ID-Based Data Fetching:**

Refactor child component to accept IDs and fetch its own data:

```typescript
// Vanilla parent - pass ID only
`<mad-match-tile host-id="${hostId}"></mad-match-tile>`

// Vanilla child - fetches data internally
// src/components/match-tile/match-tile.ts:43-84
static get observedAttributes(): string[] {
  return ["host-id", "visitor-id", "tournament-id", ...];
}

protected _onAttributeChange(name: string, value: string | null): void {
  if (name === "host-id" || name === "visitor-id") {
    this._fetchTeam(name.replace("-id", "") as "host" | "visitor", value);
  }
}

private async _fetchTeam(side: "host" | "visitor", value: string | null): Promise<void> {
  const teamId = value !== null ? Number.parseInt(value, 10) : null;
  // ... fetch team data internally
}
```

---

### Trap 3: Boolean Attribute Coercion

**The Problem:**

HTML attributes are always strings. `reverse="true"` is the string `"true"`, not boolean `true`.

**Example of Bug:**

```typescript
// ❌ WRONG - String "true" is truthy but not boolean true
`<mad-team-tile reverse="true"></mad-team-tile>`

// Stencil child:
@Prop() reverse: boolean | null;
// Receives string "true", coerced to truthy - may work but unreliable
```

**The Solution - Set as Property:**

```typescript
// Step 1: Render HTML
this.innerHTML = `<mad-team-tile></mad-team-tile>`;

// Step 2: Set boolean property directly
const tile = this.querySelector("mad-team-tile");
if (tile) {
  (tile as HTMLElement & { reverse: boolean }).reverse = true;
}
```

**Alternative - Use Presence-Based Boolean:**

```typescript
// For boolean props that default to false
// Presence of attribute = true, absence = false
`<mad-team-tile reverse></mad-team-tile>`  // Works if child checks hasAttribute()

// But Stencil @Prop() with type boolean still needs property assignment
// for reliable behavior
```

---

### Trap 4: Number Attribute Parsing

**The Problem:**

Numbers passed as attributes become strings and must be parsed.

**Example:**

```typescript
// ❌ WRONG - String "42" not number 42
`<mad-team-tile rank="42"></mad-team-tile>`

// Stencil child:
@Prop() rank?: number;
// May work due to Stencil's coercion, but unreliable
```

**The Solution:**

```typescript
// Option A: Parse in child component
private _getRank(attr: string): number | undefined {
  const value = this.getAttribute(attr);
  return value !== null ? Number.parseInt(value, 10) : undefined;
}

// Option B: Set as property (preferred for precision)
(tile as HTMLElement & { rank: number }).rank = 42;
```

---

## Type-Safe Best Practices

### Define Component Property Interfaces

**Never use `any`!** Always define proper TypeScript interfaces:

```typescript
/**
 * Type-safe interface for mad-team-tile element properties.
 * Use this when setting properties from vanilla parent components.
 */
interface MadTeamTileElement extends HTMLElement {
  /** Team data object - must be set as property, not attribute */
  team: GenericTeam | null;
  /** Reverse layout direction - set as boolean property */
  reverse: boolean | null;
  /** Rank number for badge display */
  rank?: number;
}

// Usage in parent component
const tile = this.querySelector("mad-team-tile") as MadTeamTileElement | null;
if (tile) {
  tile.team = team;      // Type-safe assignment
  tile.reverse = true;   // Type-safe boolean
  tile.rank = 1;         // Type-safe number
}
```

### Type Guard for Property Existence

```typescript
/**
 * Type guard to check if an element has a specific property.
 * Use before property assignment to avoid runtime errors.
 */
function hasTeamProperty(element: unknown): element is HTMLElement & { team: GenericTeam } {
  return element instanceof HTMLElement && "team" in element;
}

// Usage
const tile = this.querySelector("mad-team-tile");
if (tile && hasTeamProperty(tile)) {
  tile.team = team;  // TypeScript knows tile has .team
}
```

### Complete Interface Example

```typescript
/**
 * Complete type definitions for Stencil component interop.
 * Place in src/types/component-props.ts
 */

import type { GenericTeam } from "../modules/team-row/team-row.d";

/** mad-team-tile Stencil component properties */
export interface MadTeamTileProps {
  team: GenericTeam | null;
  reverse: boolean | null;
  rank?: number;
}

/** mad-match-tile Vanilla component properties */
export interface MadMatchTileProps {
  "host-id": string | null;
  "visitor-id": string | null;
  "tournament-id": string;
  "host-score"?: number;
  "visitor-score"?: number;
  "host-rank"?: number;
  "visitor-rank"?: number;
}

/** Element type combining HTMLElement with props */
export type MadTeamTileElement = HTMLElement & MadTeamTileProps;
export type MadMatchTileElement = HTMLElement & MadMatchTileProps;
```

---

## Two-Pass Rendering Pattern

### Complete Implementation

```typescript
/**
 * Two-Pass Rendering Pattern for Vanilla → Stencil communication.
 * 
 * Pass 1: Render HTML structure with empty elements
 * Pass 2: Query elements and set JavaScript properties
 */
protected _render(): void {
  // === PASS 1: Render HTML structure ===
  this.innerHTML = `
    <div class="match-grid">
      <div class="host-section">
        <mad-team-tile></mad-team-tile>
      </div>
      <div class="visitor-section">
        <mad-team-tile></mad-team-tile>
      </div>
    </div>
  `;

  // === PASS 2: Set JavaScript properties ===
  this._setTeamProperties();
}

private _setTeamProperties(): void {
  const hostTile = this.querySelector(".host-section mad-team-tile");
  const visitorTile = this.querySelector(".visitor-section mad-team-tile");

  // Set host team
  if (hostTile && this._hostSignal.value) {
    const tile = hostTile as MadTeamTileElement;
    tile.team = this._hostSignal.value.team ?? null;
    tile.reverse = true;
    tile.rank = this._getRank("host-rank");
  }

  // Set visitor team
  if (visitorTile && this._visitorSignal.value) {
    const tile = visitorTile as MadTeamTileElement;
    tile.team = this._visitorSignal.value.team ?? null;
    tile.reverse = false;
    tile.rank = this._getRank("visitor-rank");
  }
}
```

---

## Migration Checklist

Before marking a component migration as complete, verify:

### Pre-Migration Analysis

- [ ] Identify all `@Prop()` decorators in child Stencil components
- [ ] Document each prop's type: object, Promise, boolean, number, string
- [ ] Identify which props are set by parent components
- [ ] Check for `@Watch()` decorators that react to prop changes

### During Migration

- [ ] **Object props**: Use two-pass rendering pattern (render HTML, then set properties)
- [ ] **Promise props**: Refactor to ID-based data fetching in child component
- [ ] **Boolean props**: Set as JavaScript properties, not HTML attributes
- [ ] **Number props**: Parse from string or set as property
- [ ] **String props**: Safe to use as HTML attributes

### Type Safety

- [ ] Define TypeScript interfaces for element properties
- [ ] Use type guards before property assignment
- [ ] Never use `any` - use `unknown` with type narrowing
- [ ] Import types from `.d.ts` files, not `.ts` files

### Post-Migration Testing

- [ ] Verify child component receives data correctly
- [ ] Test with null/undefined values
- [ ] Test reactive updates (signal changes trigger re-render)
- [ ] Verify cleanup in `disconnectedCallback()`
- [ ] Check console for Stencil property warnings

---

## Common Pitfalls Reference

| Pitfall | Symptom | Cause | Solution |
|---------|---------|-------|----------|
| Object not received | Child shows empty/default | Attribute string not deserialized | Two-pass rendering |
| Promise corrupted | "[object Promise]" displayed | Template literal stringification | ID-based fetching |
| Boolean always true | Logic inverted | String "false" is truthy | Set as property |
| Number as string | Comparison fails | `"42" !== 42` | Parse or set property |
| Stale data | Updates not reflected | Property not reactive | Use signals + re-render |

---

## Post-Migration Checklist - CRITICAL

After completing component migration, verify these often-overlooked issues:

### 1. Component Registration Verification

**The Problem:** Migrated components are never imported, so `customElements.define()` never executes. The browser creates `HTMLUnknownElement` instances that fail silently.

**Real Bug Example:**
- Migrated `match-tile.tsx` → `match-tile.ts`
- Forgot to add `import "./components/match-tile/match-tile"` to `vanilla-entry.ts`
- Component rendered as empty `<mad-match-tile>` with no functionality
- **No console errors, no build errors** - silent failure

**Checklist:**
- [ ] Add import to `src/vanilla-entry.ts`
- [ ] Verify in browser: `customElements.get('your-component')` returns constructor
- [ ] Check build output includes the component

### 2. Attribute Order Dependencies

**The Problem:** When a component has inter-dependent attributes (one needs another to fetch data), HTML attribute order matters. Browser processes attributes sequentially.

**Real Bug Example:**
```typescript
// Page parent sets attributes in this order:
<mad-match-tile
  host-id="123"           // ← Triggers _fetchTeam("host")
  visitor-id="456"        // ← Triggers _fetchTeam("visitor")
  tournament-id="789"     // ← Not yet set!
></mad-match-tile>

// In match-tile.ts:
_fetchTeam(side, value) {
  const tournamentId = this.getAttribute("tournament-id");
  if (!tournamentId) return;  // ← Silent failure!
  // ... fetch never happens
}
```

**Solution:** Always set dependency attributes FIRST:
```typescript
<mad-match-tile
  tournament-id="789"     // ← Set dependency first
  host-id="123"
  visitor-id="456"
></mad-match-tile>
```

**Checklist:**
- [ ] Identify attributes with dependencies
- [ ] Verify order: dependencies before dependents
- [ ] Test with console.log in _onAttributeChange

### 3. Silent Failure Detection Guide

**If component doesn't display with NO errors, check in order:**

| Step | Check | How |
|------|-------|-----|
| 1 | Is component registered? | `customElements.get('tag-name')` in console |
| 2 | Is data being fetched? | Add console.log in _fetch methods |
| 3 | Are attributes processed in order? | Log attribute name + dependency values |
| 4 | Is Two-Pass Rendering working? | Verify Pass 1 HTML and Pass 2 properties |

### 4. Real-World Migration Checklist

Before marking migration complete:

**Registration:**
- [ ] Import added to vanilla-entry.ts
- [ ] customElements.define() executes without errors
- [ ] Component appears in browser DevTools Elements tab

**Data Flow:**
- [ ] Parent passes data correctly (Two-Pass Rendering if Stencil child)
- [ ] Component fetches data at right time (check attribute order)
- [ ] Signals update and trigger re-renders
- [ ] Child components receive properties correctly

**Testing:**
- [ ] Component renders initial state
- [ ] Component handles data updates reactively
- [ ] No console warnings or errors
- [ ] Component cleans up on disconnect

---

## Related Skills

- **stencil-testing**: Testing patterns for Stencil/Vanilla duality
- **clean-code**: Type safety and code quality standards

## References

- `src/core/base-element.ts` - BaseElement implementation
- `src/components/select-team/select-team.ts` - Two-pass rendering example
- `src/components/match-tile/match-tile.ts` - ID-based fetching example
- `src/components/team-tile/team-tile.tsx` - Stencil component with @Prop()
