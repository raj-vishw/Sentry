// Fixed, published credentials for the two demo-mode-only accounts —
// mirrors server/src/scripts/seedDemo.ts's DEMO_USER_CREDENTIALS /
// DEMO_ADMIN_CREDENTIALS. Shared between DemoLandingPage (demo-only login
// form) and TopBar (the in-OS player/organizer switch) so there's one
// place to change if the published credentials ever do.
export const DEMO_USER_CREDENTIALS = { identifier: 'user', password: 'user' };
export const DEMO_ADMIN_CREDENTIALS = { identifier: 'admin', password: 'password' };

// The two accounts' emails, used to recognize an active session as a demo
// session (see client/src/lib/appPath.ts) purely from the already-fetched
// `user` object — no extra server round-trip or persisted flag needed.
export const DEMO_USER_EMAIL = 'user@demo.invalid';
export const DEMO_ADMIN_EMAIL = 'admin@demo.invalid';
