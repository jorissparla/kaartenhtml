# Copilot Instructions for kaartenhtml

This guide enables AI coding agents to work productively in the kaartenhtml codebase. It summarizes architecture, workflows, and conventions specific to this project.

## Project Overview

- **Type**: React 18 + TypeScript app for generating padel matches
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, custom themes via CSS variables
- **Backend**: Firebase Firestore (player names, sample names)
- **Deployment**: Vercel

## Key Files & Structure

- `src/App.tsx`: Main logic (player management, match generation, settings, theme switching)
- `src/themes.ts`: Theme definitions
- `src/firebase.ts`: Firebase/Firestore config
- `src/index.css`: CSS variables and theme tokens
- `.env`: Required for Firebase config (see below)

## Data Flow

1. On app load, players and sample names are fetched from Firestore
2. Match generation randomizes teams for multiple rounds
3. Theme selection is stored in `localStorage` and applied via `data-theme` on root

## Theming

- Themes use CSS variables (see `src/index.css`)
- Theme switching updates `data-theme` on root
- Theme selection persists in `localStorage`
- Semantic Tailwind utilities reference CSS tokens (e.g., `bg-[var(--bg)]`, `text-[var(--fg)]`)

## Firebase Setup

- Create a Firebase project and enable Firestore
- Add a Web App and copy config
- Add these to `.env`:
  ```
  VITE_FIREBASE_API_KEY=your-api-key
  VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
  VITE_FIREBASE_PROJECT_ID=your-project-id
  VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
  VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
  VITE_FIREBASE_APP_ID=your-app-id
  ```

## Developer Workflows

- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview build**: `npm run preview`

## Conventions & Patterns

- State managed via React hooks (no Redux)
- All logic centralized in `App.tsx` (no complex component hierarchy)
- Themes and tokens are defined in code, not external files
- No custom test setup (no test scripts found)
- Deployment is Vercel-specific (see `vercel.json`)

## External Integrations

- Firebase Firestore: persistent storage
- Vercel: deployment

## Example: Theme Switching

```tsx
// src/App.tsx
const setTheme = (theme: string) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};
```

---

If any section is unclear or missing, please provide feedback so this guide can be improved for future AI agents.
