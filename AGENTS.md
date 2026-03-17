# Agent Rules

This document consolidates rules and constraints for AI agents working on the Credit Card Rewards PWA.

## Browser Testing (Playwright)

When testing or interacting with the browser for this project, always apply the application's base path.

### Context
The application uses a `base` path for deployment (e.g., GitHub Pages).
Current base path: `/credit-card-rewards-pwa/` (Refer to `vite.config.ts`)

### Instructions
- All browser-based navigation (e.g., `browser_navigate`, `page.goto`) should use the base path.
- Example: Instead of `http://localhost:5173/`, use `http://localhost:5173/credit-card-rewards-pwa/`.
- For specific pages, append the route to the base path: `http://localhost:5173/credit-card-rewards-pwa/best-card`.
- Always check `vite.config.ts` if you're unsure of the current base path.

---

## Component Architecture

To maintain a maintainable and scalable codebase, follow these architectural guidelines:

### Component Isolation
- **Do not implement complex feature logic directly within page components** (e.g., `src/pages/Dashboard.tsx`).
- If a feature can be isolated (e.g., a modal, a complex form, a specific section), **create a separate component** in `src/components/`.
- Page components should primarily handle data fetching (e.g., `useLiveQuery`), routing, and layout orchestration, delegating specific functionality to modular sub-components.
- This promotes reusability, easier testing (BDD), and cleaner code.

---

## UI Constraints

To maintain a clean and usable interface, especially on mobile devices, the following constraints must be followed:

### Bottom Navigation
- The bottom navigation bar (**BottomNav**) must have a **maximum of 5 buttons**.
- Excessive items in the bottom nav lead to a cramped UI and poor touch targets on small screens.
- Guidelines for handling >5 items:
  - Move secondary actions to the Dashboard as "Quick Links" or "Stats".
  - Group related features under a single navigation item.
  - Move "Add" or "Search" actions (like the Catalog) inside their respective functional pages (e.g., the Cards page).

---

## Testing (BDD)

To ensure the application remains stable and meets requirements, Behavior-Driven Development (BDD) must be followed. **A task is not considered complete until its corresponding tests are verified.**

### Mandatory Test Coverage
- **New Features:** Whenever a new feature is implemented, corresponding BDD feature files (`tests/features/`) and step definitions (`tests/steps/`) **MUST** be created before submitting the PR.
- **Bug Fixes:** Every bug fix **MUST** be accompanied by a BDD test case that reproduces the issue and verifies the fix.
- **Feature Updates:** Whenever an existing feature is updated, the relevant BDD test cases **MUST** be updated to reflect the new behavior.

### Verification Requirement
- Agents **MUST** run the relevant BDD tests locally using `npm run test:bdd:run` (or specific feature path) and ensure they pass before concluding the task.
- If a test fails or is ambiguous, the agent **MUST** resolve the conflict or fix the regression immediately.
