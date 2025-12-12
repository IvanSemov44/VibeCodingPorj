# CSS Modules Migration Plan (Day‑4 onward)

Goal: Migrate all 36 frontend components from inline styles to CSS Modules while preserving the existing theme system (light/dark) and TypeScript type safety.

Overview
- Components: 36 in `frontend/components/` (207 inline style usages)
- Theme system: CSS variables in `frontend/styles/globals.css` and `ThemeContext` (data-theme attribute)
- Constraint: CSS Modules only (no Tailwind)
- Deliverables: co‑located `.module.css` files, `cx` util, TypeScript typings for `.module.css`, no inline style objects

Phase 1 — Setup & Foundation Components (Days 1–5)

Day 1: TypeScript & Infrastructure Setup

1. TypeScript Configuration
- Create `frontend/types/css-modules.d.ts` with:
  ```ts
  declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
  }
  ```
- Update `tsconfig.json` include to contain `types/**/*` and ensure the plugin is picked up.
- Install dev tooling:
  ```bash
  npm install --save-dev typescript-plugin-css-modules
  ```
- Add to `compilerOptions.plugins`:
  ```json
  "plugins": [
    { "name": "next" },
    { "name": "typescript-plugin-css-modules" }
  ]
  ```

2. Utility Function
- Create `frontend/lib/classNames.ts`:
  ```ts
  export function cx(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
  }
  ```

3. Naming convention
- Use camelCase keys with underscore modifiers in CSS Modules:
  - Base: `.button`
  - Variant: `.button_primary`
  - Size: `.button_md`
  - State: `.button_disabled`

Day 2–3: Button (pattern setter)
- Create `frontend/components/Button.module.css` implementing variables, variants, sizes, states, spinner and animations.
- Update `frontend/components/Button.tsx` to import CSS Module and use `cx()`.
- Extensive visual/TS tests.

Day 4: Loading & Badge
- Migrate `Loading` and `Badge` components to `.module.css` files.

Day 5: Alert
- Migrate `Alert` component with variants and accessible markup.

Phase 2 — Core UI Components (Days 6–10)
- Day 6: `Card` (header/footer patterns)
- Day 7: `Input` (focus/error/prefix/suffix)
- Day 8: `Toast` (animations, positioning)
- Day 9: `Modal` / `Dialog` (overlay, transitions)
- Day 10: Testing & bugfixes

Phase 3 — Layout (Days 11–15)
- Day 11–12: `Layout` with responsive header/nav/main/footer
- Day 13: `AuthLayout`
- Day 14: `ErrorBoundary` UI
- Day 15: Responsive verification across breakpoints

Phase 4 — Feature Components (Days 16–20)
- Day 16: `ToolForm` (complex forms)
- Day 17: `JournalSection` & `JournalEntry`
- Day 18: `ToolEntry` & related components
- Days 19–20: Subcomponents (dashboard, journal, tools) — 28 CSS module files total

Phase 5 — Final Testing & Cleanup (Days 21–22)
- Day 21: Full visual regression (light/dark), cross-browser, accessibility
- Day 22: Documentation, remove inline-style helpers, remove Tailwind if present, finalize

Patterns & Guidelines

1. Variant pattern (JS):
```ts
const className = cx(
  styles.component,
  styles[`component_${variant}`],
  disabled && styles.component_disabled
);
```

2. CSS variables
- CSS Modules inherit `:root` and `data-theme` variables — use `var(--xxx)` in modules.

3. Animations & hover states
- Prefer `:hover`, `:focus`, and `@keyframes` in modules instead of JS event handlers.

Migration checklist (per component)
- Read the current file; note inline style props/props-derived values
- Create `Component.module.css` (base, variants, sizes, states)
- Replace inline style objects with classes from module
- Use `cx()` to assemble className
- Preserve accessibility attributes (aria-*)
- Run TypeScript build and visual check in both themes

Testing matrix
- Light / Dark theme
- Variants & sizes
- Disabled / loading / error states
- Hover / focus interactions
- Mobile / tablet / desktop breakpoints

Deliverables
- `frontend/plan_day_4.md` (this file)
- `frontend/types/css-modules.d.ts`
- `frontend/lib/classNames.ts`
- 36 co-located `.module.css` files alongside `.tsx` components
- Automated visual checks (manual or via snapshot tooling)

Next actions (I can start now):
1. Create `frontend/types/css-modules.d.ts` and update `tsconfig.json`.
2. Add `frontend/lib/classNames.ts`.
3. Implement `Button.module.css` and migrate `Button.tsx`.

Reply with which item to start first (I recommend starting with the TypeScript typings + `cx()` utility and the Button migration).
