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

To ensure the application remains stable and meets requirements, Behavior-Driven Development (BDD) must be followed:

### Feature Updates and New Features
- Whenever a **new feature** is implemented, corresponding BDD feature files and step definitions **must be created**.
- Whenever an **existing feature is updated**, the relevant BDD test cases **must be updated** to reflect the changes.
- All BDD tests are located in the `tests/` directory and use Cucumber.js and Playwright.
