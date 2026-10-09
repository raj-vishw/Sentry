// Fixed, published credentials for the two demo-mode-only accounts —
// mirrors server/src/scripts/seedDemo.ts's DEMO_USER_CREDENTIALS /
// DEMO_ADMIN_CREDENTIALS. Shared between DemoLandingPage (auto-login) and
// TopBar (the in-OS player/organizer switch) so there's one place to
// change if the published credentials ever do.
export const DEMO_USER_CREDENTIALS = { identifier: 'user', password: 'user' };
export const DEMO_ADMIN_CREDENTIALS = { identifier: 'admin', password: 'password' };
