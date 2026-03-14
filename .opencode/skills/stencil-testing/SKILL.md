---
name: stencil-testing
description: Stencil/Vanilla testing duality patterns for ContestOrganizer. Use when writing or modifying tests to choose the correct testing approach and avoid conflicts between Jest (Stencil) and Vitest (Vanilla).
compatibility: opencode
metadata:
  scope: testing
  frameworks: [stencil, vitest, jest]
  project: contestorganizer
---

# Skill: Stencil/Vanilla Testing Duality

## Overview

ContestOrganizer uses a **dual testing architecture** during migration from Stencil to Vanilla Web Components:

- **Stencil tests**: Jest via Stencil CLI for `.tsx` components
- **Vanilla tests**: Vitest for `.ts` vanilla components and utilities
- **Configuration**: `testPathIgnorePatterns` prevents conflicts

## Quick Decision Table

| Scenario | Use | Location | Runner |
|----------|-----|----------|--------|
| Stencil component (`.tsx`) | Stencil/Jest | `src/components/<name>/` | `pnpm test:stencil` |
| Vanilla component (`.ts`) | Vitest | `src/components/<name>/` | `pnpm test:vitest` |
| Core framework | Vitest | `src/core/` | `pnpm test:vitest` |
| Module utilities | Vitest | `src/modules/<name>/` | `pnpm test:vitest` |

## File Location Rules

### Stencil Components (Legacy `.tsx`)
- **Source**: `src/components/<name>/<name>.tsx`
- **Test**: `src/components/<name>/<name>.spec.ts`
- **Command**: `pnpm test:stencil`

### Vanilla Components (New `.ts`)
- **Source**: `src/components/<name>/<name>.ts`
- **Test**: `src/components/<name>/<name>.spec.ts`
- **Command**: `pnpm test:vitest`

### Core & Modules
- **Core**: `src/core/*.spec.ts` → Vitest
- **NBA Module**: `src/modules/nba/*.spec.ts` → Vitest

## Configuration Reference

### stencil.config.ts
```typescript
export const config: Config = {
  // ... other config
  testing: {
    testPathIgnorePatterns: [
      "<rootDir>/src/core/",
      "<rootDir>/src/modules/nba/",
      "<rootDir>/src/components/error-message/error-message.spec.ts",
      "<rootDir>/src/components/page-404/page-404.spec.ts",
    ],
  },
};
```

### package.json Scripts
```json
{
  "test": "pnpm test:stencil && pnpm test:vitest",
  "test:stencil": "stencil test --spec",
  "test:vitest": "vitest run",
  "test:watch": "vitest watch"
}
```

## Code Examples

### Stencil Component Test
```typescript
import { newSpecPage } from '@stencil/core/testing';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>',
    });
    expect(page.root).toBeTruthy();
  });
});
```

### Vanilla Component Test
```typescript
import { describe, it, expect } from 'vitest';
import { Signal } from './signal.js';

describe('Signal', () => {
  it('should hold a value', () => {
    const signal = new Signal(42);
    expect(signal.value).toBe(42);
  });
});
```

## Common Pitfalls

### ❌ "Vitest cannot be imported in CommonJS"
**Cause**: Importing `vitest` in a Stencil test file.
**Solution**: Use `@stencil/core/testing` imports only.

### ❌ Jest trying to run Vitest tests
**Cause**: New Vanilla test directory not in `testPathIgnorePatterns`.
**Solution**: Add pattern to `stencil.config.ts` testing config.

### ❌ Wrong mock function
**Cause**: Using `jest.fn()` in Vitest or `vi.fn()` in Stencil.
**Solution**: Use appropriate mock for each runner.

## Testing Workflow

1. **Create test**: Determine component type (Stencil `.tsx` vs Vanilla `.ts`)
2. **Place correctly**: Same directory as component
3. **Use right imports**: Stencil testing vs Vitest
4. **Verify**: Run appropriate test command
5. **Update config**: Add to `testPathIgnorePatterns` if new Vanilla directory

## Pre-commit Hook

Runs both suites:
```bash
pnpm test:stencil  # Jest tests
pnpm test:vitest   # Vitest tests
```

Both must pass before commit is allowed.
