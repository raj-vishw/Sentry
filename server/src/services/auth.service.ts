import { User, type UserDoc } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { toSafeUser, type SafeUserDto } from './user.service.js';
import { getConfig } from './systemConfig.service.js';
import { env } from '../config/env.js';
import { DEMO_ADMIN_CREDENTIALS, DEMO_USER_CREDENTIALS } from '../scripts/seedDemo.js';
import type { LoginInput, RegisterInput } from '../validators/auth.schema.js';

export interface AuthResult {
  user: SafeUserDto;
  accessToken: string;
  refreshToken: string;
}

/**
 * register()'s result when `registrationRequiresApproval` is on: no
 * tokens are issued (a PENDING account can't authenticate yet), so the
 * caller must branch on `pending` rather than assuming `AuthResult`.
 */
export interface RegisterResult {
  user: SafeUserDto;
  pending: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export function issueTokens(user: UserDoc): { accessToken: string; refreshToken: string } {
  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    refreshToken: signRefreshToken({ sub: user.id, version: user.tokenVersion }),
  };
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const config = await getConfig();
  if (!config.registrationEnabled) {
    throw AppError.forbidden('Registration is currently disabled.');
  }

  const existing = await User.findOne({
    $or: [{ email: input.email.toLowerCase() }, { usernameLower: input.username.toLowerCase() }],
  });
  if (existing) {
    // Generic enough not to confirm which field collided beyond what the
    // user themselves just submitted.
    throw AppError.conflict('An account with that username or email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  // role is intentionally never read from `input` — every new account is a
  // USER; ADMIN accounts are provisioned only via the seed script.
  const user = await User.create({
    username: input.username,
    email: input.email,
    passwordHash,
    role: 'USER',
    status: config.registrationRequiresApproval ? 'PENDING' : 'ACTIVE',
  });

  if (user.status === 'PENDING') {
    // No tokens — a pending account can't authenticate until an admin
    // approves it (see adminUser.service.ts#approveUser).
    return { user: await toSafeUser(user), pending: true };
  }

  const tokens = issueTokens(user);
  return { user: await toSafeUser(user), pending: false, ...tokens };
}

export async function login(
  input: LoginInput,
  opts: { requiredRole?: 'USER' | 'ADMIN' } = {},
): Promise<AuthResult> {
  const identifier = input.identifier.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: identifier }, { usernameLower: identifier }],
  }).select('+passwordHash');

  // Same generic message whether the account doesn't exist or the password
  // is wrong — this endpoint never confirms whether an email is registered.
  const invalidCredentials = () => AppError.unauthorized('Invalid credentials.');

  if (!user) throw invalidCredentials();

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw invalidCredentials();

  // Public /auth/login only ever authenticates USER accounts; ADMIN
  // accounts only authenticate through the hidden admin login route (see
  // routes/adminAuth.routes.ts), and vice versa. Same generic error as a
  // wrong password — an attacker probing either surface can't tell "wrong
  // password" apart from "right password, wrong surface," which would
  // otherwise leak which accounts are admins.
  if (opts.requiredRole && user.role !== opts.requiredRole) {
    throw invalidCredentials();
  }

  if (user.status === 'DISABLED') {
    throw AppError.forbidden('This account has been disabled.');
  }
  if (user.status === 'PENDING') {
    throw AppError.forbidden('Your account is awaiting admin approval.');
  }
  // BANNED is deliberately NOT checked here — a banned account must still
  // be able to log in and browse read-only; see userStatus.service.ts.

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = issueTokens(user);
  return { user: await toSafeUser(user), ...tokens };
}

/**
 * Authenticates ONLY the two fixed, published demo accounts (see
 * scripts/seedDemo.ts) — never a real registered account, even one that
 * happens to share a password with one of these. The submitted
 * credentials are checked directly against the known constants rather
 * than via a DB lookup + bcrypt compare, so the accepted set is provably
 * exactly these two pairs. 404s (not 403) when this deployment isn't
 * running in demo mode, same as the demo reset endpoint — a no-op on
 * every real production deployment.
 */
export async function demoLogin(input: LoginInput): Promise<AuthResult> {
  if (!env.DEMO_MODE) {
    throw AppError.notFound('Not found.');
  }

  const identifier = input.identifier.trim().toLowerCase();
  const invalidCredentials = () => AppError.unauthorized('Invalid credentials.');

  const matchesAdmin =
    (identifier === DEMO_ADMIN_CREDENTIALS.username.toLowerCase() ||
      identifier === DEMO_ADMIN_CREDENTIALS.email.toLowerCase()) &&
    input.password === DEMO_ADMIN_CREDENTIALS.password;
  const matchesUser =
    (identifier === DEMO_USER_CREDENTIALS.username.toLowerCase() ||
      identifier === DEMO_USER_CREDENTIALS.email.toLowerCase()) &&
    input.password === DEMO_USER_CREDENTIALS.password;

  if (!matchesAdmin && !matchesUser) throw invalidCredentials();

  const matched = matchesAdmin ? DEMO_ADMIN_CREDENTIALS : DEMO_USER_CREDENTIALS;
  const user = await User.findOne({ usernameLower: matched.username.toLowerCase() });
  // The deployment is in demo mode but hasn't been seeded yet.
  if (!user) throw invalidCredentials();

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = issueTokens(user);
  return { user: await toSafeUser(user), ...tokens };
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Session expired. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.version) {
    // Either the account is gone, or this refresh token was already
    // rotated away (reused/stolen token) — reject either way.
    throw AppError.unauthorized('Session expired. Please log in again.');
  }
  if (user.status === 'DISABLED') {
    // Disabling a user bumps tokenVersion (see admin user service), which
    // alone would already invalidate this; checked explicitly too so the
    // reason is unambiguous if that ever changes.
    throw AppError.unauthorized('This account has been disabled.');
  }
  // BANNED is deliberately NOT checked here either — see login() above.

  // Rotation: bump the version so the token just used can never be
  // replayed again, then issue a fresh pair.
  user.tokenVersion += 1;
  await user.save();

  const tokens = issueTokens(user);
  return { user: await toSafeUser(user), ...tokens };
}

export async function logout(userId: string): Promise<void> {
  // Invalidates every outstanding refresh token for this user immediately.
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}

export async function getCurrentUser(userId: string): Promise<SafeUserDto> {
  const user = await User.findById(userId);
  if (!user) throw AppError.unauthorized();
  return toSafeUser(user);
}
