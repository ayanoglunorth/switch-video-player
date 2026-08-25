# Security Policy

## Supported versions

Security fixes are applied to the `main` branch.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Contact the repository owner privately through GitHub and include a concise description, reproduction steps, affected files or endpoints, and potential impact. Reports are acknowledged as soon as practical and handled confidentially until a fix is available.

## Deployment security checklist

Before deploying your own instance:

- Create a separate Firebase project and configure it through local environment variables; never commit `.env` or `.firebaserc`.
- Restrict the Firebase Web API key in Google Cloud to the required APIs and authorized origins.
- Enable Firebase App Check and use a production reCAPTCHA key where applicable.
- Deploy the included Firestore rules and review them whenever the data model changes.
- Configure Firebase Authentication's authorized domains and enabled providers deliberately.
