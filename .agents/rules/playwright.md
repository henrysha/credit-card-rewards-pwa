# Playwright Base Path Rule

When testing or interacting with the browser for this project, always apply the application's base path.

## Context
The application uses a `base` path for deployment (e.g., GitHub Pages).
Current base path: `/credit-card-rewards-pwa/` (Refer to `vite.config.ts`)

## Instructions
- All browser-based navigation (e.g., `browser_navigate`, `page.goto`) should use the base path.
- Example: Instead of `http://localhost:5173/`, use `http://localhost:5173/credit-card-rewards-pwa/`.
- For specific pages, append the route to the base path: `http://localhost:5173/credit-card-rewards-pwa/best-card`.
- Always check `vite.config.ts` if you're unsure of the current base path.
