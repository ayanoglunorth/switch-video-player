# Switch Video Player

Switch Video Player is a browser tool for reviewing two video sources in sync and switching between them during playback. It fits angle comparison, coaching review, visual analysis, and other workflows where timing needs to stay aligned.

## Features

- Synchronized dual-source playback with a configurable offset
- Fast source switching, playback-rate controls, fullscreen mode, and keyboard shortcuts
- Video pairs, folders, favourites, likes, and timestamped notes
- Optional Google Drive and Yandex Disk source handling
- Firebase Authentication and Firestore-backed shared content

## Tech stack

- Vanilla JavaScript and CSS
- [Vite](https://vite.dev/)
- [Firebase](https://firebase.google.com/) Authentication, Firestore, and App Check

## Getting started

### Prerequisites

- Node.js 20 or later
- npm
- A Firebase project for authentication and Firestore features

### Installation

```bash
git clone https://github.com/<your-account>/switch-video-player.git
cd switch-video-player
npm ci
Copy-Item .env.example .env
```

Configure `.env` with the values from your Firebase web application. The file is intentionally ignored by Git.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
# Optional: enables Firebase App Check with reCAPTCHA v3
VITE_RECAPTCHA_SITE_KEY=
```

Start the development server with `npm run dev`. Create a production build with `npm run build` and preview it locally with `npm run preview`.

## Firebase setup

Enable the sign-in providers you intend to support in Firebase Authentication, create a Firestore database, and deploy the repository's rules and indexes after selecting your Firebase project:

```bash
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

The repository contains no Firebase project binding or deployment credential. Configure hosting and CI secrets in your own environment before deploying.

## Project structure

```text
js/                 Firebase integration, persistence, validation, and player state
css/                Application styles
public/             Static browser assets
firestore.rules     Firestore authorization rules
firestore.indexes.json
.github/workflows/  Continuous-integration build
```

## Security

See [SECURITY.md](SECURITY.md) for responsible disclosure guidance and the deployment checklist. The Firestore rules are part of the security boundary; review and redeploy them alongside any data-model change.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), keep changes focused, and make sure `npm run build` succeeds before opening a pull request.

## License

Distributed under the [MIT License](LICENSE).
