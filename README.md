# Kaarten

This project is a simple padel matches application that allows you to generate matches between players.

## Firebase Setup

To use this application with Firebase, you need to create a Firebase project and enable Firestore.

### 1. Create a Firebase project

Go to the [Firebase console](https://console.firebase.google.com/) and create a new project.

### 2. Create a Web App

In your Firebase project, create a new Web App and copy the Firebase configuration object.

### 3. Set up Firestore

In the Firebase console, go to **Firestore Database** and create a new database. Start in **test mode** for now. This will allow all reads and writes to the database.

### 4. Set up Environment Variables

Create a `.env` file in the root of the project and add the following environment variables with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Run the application

Install the dependencies and run the application:

```
npm install
npm run dev
```

## Theming

- Uses CSS variables with a `data-theme` on the app root for consistent, GitHub‑like neutrals and subtle borders.
- Themes available: `Light`, `Dark`, `Ocean`, `Forest`, `High Contrast`, and pastel variants: `Pastel Blue`, `Pastel Pink`, `Pastel Purple`, `Pastel Orange`, `Pastel Mint`, `Pastel Yellow`. Ocean/Forest and pastels vary only the accent, keeping neutrals consistent.
- Tokens are defined in `src/index.css` (e.g., `--bg`, `--fg`, `--surface`, `--border`, `--primary`).
- Components use semantic utilities that read tokens: `bg-[var(--bg)]`, `text-[var(--fg)]`, `bg-surface`, `border-token`, `text-accent`.
- Theme selection persists in `localStorage` and is applied via `data-theme`.
- The Theme dialog shows a small color swatch for each theme.
