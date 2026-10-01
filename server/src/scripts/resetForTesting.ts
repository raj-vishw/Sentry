/**
 * One-off reset for manual testing: wipes every collection (users, teams,
 * challenges, hints, submissions, writeups, reports, audit logs) and
 * reseeds the minimum needed to test with — one admin, one normal user,
 * the 8 category metadata docs (needed for the public category-counts
 * endpoint and the admin categories page), and exactly one real,
 * hand-solvable crypto challenge.
 *
 * Credentials come from `.env` (the SEED_ADMIN_ and SEED_USER1_ variables),
 * same convention as `npm run seed` — never hardcoded here. Only ever point
 * this at a throwaway dev/test database.
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Category, CATEGORY_SLUGS } from '../models/Category.js';
import { Challenge } from '../models/Challenge.js';
import { Hint } from '../models/Hint.js';
import { Submission } from '../models/Submission.js';
import { Writeup } from '../models/Writeup.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { hashPassword } from '../utils/password.js';
import { hashFlag } from '../utils/flag.js';
import { logger } from '../utils/logger.js';

const CATEGORY_SEED: Record<(typeof CATEGORY_SLUGS)[number], { name: string; description: string; icon: string }> = {
  web: { name: 'Web', description: 'Exploit vulnerabilities in web applications and APIs.', icon: 'globe' },
  crypto: { name: 'Crypto', description: 'Break ciphers and attack weak implementations.', icon: 'key' },
  forensics: { name: 'Forensics', description: 'Recover evidence from disks, memory, and traffic.', icon: 'fingerprint' },
  reverse: { name: 'Reverse Engineering', description: 'Disassemble binaries and reconstruct hidden logic.', icon: 'cpu' },
  pwn: { name: 'Pwn', description: 'Exploit memory corruption to gain control of a process.', icon: 'terminal' },
  osint: { name: 'OSINT', description: 'Trace targets using publicly available information.', icon: 'satellite' },
  cloud: { name: 'Cloud', description: 'Attack misconfigured cloud infrastructure and IAM.', icon: 'cloud' },
  mobile: { name: 'Mobile', description: 'Reverse and exploit Android and iOS applications.', icon: 'smartphone' },
};

function requireSeedEnv(envVar: string): string {
  const value = process.env[envVar];
  if (!value) {
    logger.error(`${envVar} is not set. Add it to server/.env before running this script.`);
    process.exit(1);
  }
  return value;
}

const DEV_ADMIN = {
  username: requireSeedEnv('SEED_ADMIN_USERNAME'),
  email: requireSeedEnv('SEED_ADMIN_EMAIL'),
  password: requireSeedEnv('SEED_ADMIN_PASSWORD'),
};
const DEV_USER = {
  username: requireSeedEnv('SEED_USER1_USERNAME'),
  email: requireSeedEnv('SEED_USER1_EMAIL'),
  password: requireSeedEnv('SEED_USER_PASSWORD'),
};

// Real, hand-solvable repeating-key XOR challenge — not a placeholder.
// Ciphertext is generated from the actual flag below, so it's guaranteed
// correct (no risk of a hand-typed hex string drifting from the real flag).
const XOR_FLAG = 'CTF{xor_keys_leak_through_repetition}';
const XOR_KEY = 'k3y';

function xorHex(plaintext: string, key: string): string {
  const bytes = Buffer.from(plaintext, 'utf8');
  const keyBytes = Buffer.from(key, 'utf8');
  const out = Buffer.alloc(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
  return out.toString('hex');
}

async function reset() {
  await connectDatabase();

  logger.info('Wiping all collections...');
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Category.deleteMany({}),
    Challenge.deleteMany({}),
    Hint.deleteMany({}),
    Submission.deleteMany({}),
    Writeup.deleteMany({}),
    Report.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  logger.info('Seeding category metadata...');
  await Category.insertMany(CATEGORY_SLUGS.map((slug) => ({ slug, ...CATEGORY_SEED[slug], active: true })));

  logger.info('Creating admin account...');
  const admin = await User.create({
    username: DEV_ADMIN.username,
    email: DEV_ADMIN.email,
    passwordHash: await hashPassword(DEV_ADMIN.password),
    role: 'ADMIN',
  });

  logger.info('Creating normal user account...');
  await User.create({
    username: DEV_USER.username,
    email: DEV_USER.email,
    passwordHash: await hashPassword(DEV_USER.password),
    role: 'USER',
  });

  logger.info('Creating one crypto challenge...');
  const ciphertext = xorHex(XOR_FLAG, XOR_KEY);
  const challenge = await Challenge.create({
    title: 'Repetition Leaks',
    slug: 'repetition-leaks',
    description:
      `An operator encrypted a message with a repeating-key XOR cipher and left it on a staging server.\n\n` +
      `Ciphertext (hex):\n\`${ciphertext}\`\n\n` +
      `You know the plaintext starts with \`CTF{\` and that the key is exactly 3 bytes long. ` +
      `Recover the key, then the flag.`,
    category: 'crypto',
    difficulty: 'EASY',
    points: 150,
    flagHash: await hashFlag(XOR_FLAG),
    flagFormat: 'CTF{...}',
    author: admin._id,
    published: true,
  });
  await Hint.create({
    challenge: challenge._id,
    title: 'Known-plaintext attack',
    content:
      'XOR the first 4 bytes of the ciphertext against the known plaintext "CTF{" — that recovers the first 4 bytes of the repeating key, which is enough to see the full 3-byte key and decrypt everything.',
    cost: 20,
    order: 0,
    active: true,
  });

  logger.info('Reset complete.');
  logger.info('--- Test credentials ---');
  logger.info(`Admin: ${DEV_ADMIN.email} / ${DEV_ADMIN.password}`);
  logger.info(`User:  ${DEV_USER.email} / ${DEV_USER.password}`);
  logger.info(`Challenge: "${challenge.title}" (crypto, published) — flag: ${XOR_FLAG}`);
  logger.info('------------------------');

  await disconnectDatabase();
}

reset().catch((err) => {
  logger.error({ err }, 'Reset failed');
  process.exit(1);
});
