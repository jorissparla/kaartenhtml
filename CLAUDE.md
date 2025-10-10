# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server
- **Build**: `npm run build` - Creates production build in `dist/`
- **Preview**: `npm run preview` - Preview production build locally

## Project Architecture

This is a React + TypeScript padel match generator application using Vite as the build tool.

### Core Architecture
- **Frontend**: React 18 with TypeScript, styled with Tailwind CSS
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Backend**: Firebase Firestore for persistent storage of player names
- **Build Tool**: Vite with React plugin
- **Deployment**: Configured for Vercel

### Key Components
- **App.tsx**: Main component containing all application logic including:
  - Player management (add/remove players)
  - Match generation algorithm 
  - Settings management for sample names
  - Theme system
- **themes.ts**: Theme definitions and configuration
- **firebase.ts**: Firebase/Firestore configuration

### Data Flow
1. Players are loaded from Firebase on app initialization
2. Sample names are stored in Firestore `sample_names` collection
3. Match generation creates randomized teams across multiple rounds
4. Theme selection persists to localStorage

### Environment Variables
Required Firebase configuration in `.env`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Theming System
- CSS variables defined in `src/index.css` 
- Theme switching via `data-theme` attribute on root element
- 11 available themes including light/dark and pastel variants
- Semantic color tokens: `--bg`, `--fg`, `--surface`, `--border`, `--primary`, `--accent`

### Match Generation Logic
- Supports 4-16 players with automatic dummy player insertion for odd numbers
- Generates 3 rounds of matches
- Uses 2-3 courts depending on player count (≥12 players = 3 courts)
- Randomizes both player numbers and team assignments

### Notifications
- Uses `react-hot-toast` for user feedback
- Success/error messages for Firebase operations