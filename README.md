# Credit Card Rewards PWA

A modern, offline-first Progressive Web App (PWA) designed to help you maximize your credit card rewards and track your churning progress.

## Features

- **Rewards Dashboard**: Quickly see which card to use for any spending category to get the most rewards.
- **Perks Management**: Track and manage your card benefits, from dining credits to travel insurance.
- **Card Catalog**: A comprehensive database of credit cards to explore and compare.
- **My Cards**: Manage your personal card portfolio securely.
- **Churning Tools**: Keep track of your application history and 5/24 status.
- **Offline First**: All data is stored locally using Dexie.js (IndexedDB), ensuring the app works even without an internet connection.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Database**: Dexie.js (IndexedDB wrapper)
- **Styles**: Vanilla CSS
- **Testing**: Playwright + Cucumber.js for Behavior-Driven Development (BDD)
- **Deployment**: GitHub Pages (via GitHub Actions)
- **PWA**: `vite-plugin-pwa` for offline support and installability

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Production Build

Build the production application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Testing

The project implements BDD testing using Cucumber and Playwright. Features and step definitions are located in the `tests/` directory.

Run all tests:
```bash
npm run test:bdd
```

## Deployment

The project is configured for automated deployment to GitHub Pages via GitHub Actions. Any push to the `main` branch will trigger a build and deploy.

---

Built with ❤️ for credit card enthusiasts.
