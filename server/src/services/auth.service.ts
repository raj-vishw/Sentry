import { User, type UserDoc } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { toSafeUser, type SafeUserDto } from './user.service.js';
import type { LoginInput, RegisterInput } from '../validators/auth.schema.js';

export interface AuthResult {
  user: SafeUserDto;
  accessToken: string;
  refreshToken: string;
}

function issueTokens(user: UserDoc): { accessToken: string; refreshToken: string } {
  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    refreshToken: signRefreshToken({ sub: user.id, version: user.tokenVersion }),
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
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
  });

  const tokens = issueTokens(user);
  return { user: await toSafeUser(user), ...tokens };
}

export async function login(input: LoginInput): Promise<AuthResult> {
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
