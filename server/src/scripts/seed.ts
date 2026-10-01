/**
 * Development seed script. Populates categories, a dev-only admin account,
 * a handful of sample users, and sample challenges with hints.
 *
 * Every identity for these accounts — username, email, and password — comes
 * from `.env` (see `.env.example`), never hardcoded here, same as every
 * other piece of configuration in this codebase (JWT_SECRET, MONGODB_URI,
 * ...). The resulting accounts are printed to the console on every run and
 * are only ever useful against whatever throwaway database this script was
 * pointed at — never use them, or this script, against a production
 * database. Production admin accounts must be provisioned through a
 * separate, deliberate process (see server/README.md "Provisioning an
 * admin account").
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Category, CATEGORY_SLUGS } from '../models/Category.js';
import { Challenge } from '../models/Challenge.js';
import { Hint } from '../models/Hint.js';
import { Submission } from '../models/Submission.js';
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
    logger.error(
      `${envVar} is not set. Add it to server/.env (see .env.example) before running the seed script.`,
    );
    process.exit(1);
  }
  return value;
}

const DEV_ADMIN = {
  username: requireSeedEnv('SEED_ADMIN_USERNAME'),
  email: requireSeedEnv('SEED_ADMIN_EMAIL'),
  password: requireSeedEnv('SEED_ADMIN_PASSWORD'),
};
const DEV_USERS = [
  {
    username: requireSeedEnv('SEED_USER1_USERNAME'),
    email: requireSeedEnv('SEED_USER1_EMAIL'),
    password: requireSeedEnv('SEED_USER_PASSWORD'),
  },
  {
    username: requireSeedEnv('SEED_USER2_USERNAME'),
    email: requireSeedEnv('SEED_USER2_EMAIL'),
    password: requireSeedEnv('SEED_USER_PASSWORD'),
  },
];

const SAMPLE_CHALLENGES = [
  {
    title: 'Shadow Login',
    category: 'web' as const,
    difficulty: 'MEDIUM' as const,
    points: 300,
    description:
      'The staging login endpoint trusts a client-signed session cookie a little too much. Recover access without valid credentials.',
    flag: 'CTF{jwt_alg_none_was_a_mistake}',
    hints: [{ title: 'Where to look', content: 'Inspect how the JWT header algorithm is validated server-side.', cost: 25, order: 0 }],
  },
  {
    title: 'Broken Cipher',
    category: 'crypto' as const,
    difficulty: 'HARD' as const,
    points: 450,
    description: 'A custom stream cipher reuses its keystream. Recover the plaintext from two intercepted ciphertexts.',
    flag: 'CTF{keystream_reuse_breaks_everything}',
    hints: [{ title: 'Classic weakness', content: 'XOR the two ciphertexts together — what cancels out?', cost: 40, order: 0 }],
  },
  {
    title: 'Memory Trace',
    category: 'forensics' as const,
    difficulty: 'EASY' as const,
    points: 150,
    description: 'A process was killed before it could clean up after itself. Recover the deleted artifact from the provided memory dump.',
    flag: 'CTF{volatility_finds_everything}',
    hints: [],
  },
  {
    title: 'Digital Footprint',
    category: 'osint' as const,
    difficulty: 'EASY' as const,
    points: 100,
    description: 'Trace an online persona across public platforms to recover the flag hidden in an old post.',
    flag: 'CTF{the_internet_never_forgets}',
    hints: [{ title: 'Start here', content: 'Check archived snapshots of the profile, not just the live page.', cost: 10, order: 0 }],
  },
];

async function seed() {
  await connectDatabase();

  logger.info('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Challenge.deleteMany({}),
    Hint.deleteMany({}),
    Submission.deleteMany({}),
  ]);

  logger.info('Seeding categories...');
  await Category.insertMany(
    CATEGORY_SLUGS.map((slug) => ({ slug, ...CATEGORY_SEED[slug], active: true })),
  );

  logger.info('Seeding admin account...');
  const admin = await User.create({
    username: DEV_ADMIN.username,
    email: DEV_ADMIN.email,
    passwordHash: await hashPassword(DEV_ADMIN.password),
    role: 'ADMIN',
  });

  logger.info('Seeding sample users...');
  for (const u of DEV_USERS) {
    await User.create({
      username: u.username,
      email: u.email,
      passwordHash: await hashPassword(u.password),
      role: 'USER',
    });
  }

  logger.info('Seeding sample challenges...');
  for (const c of SAMPLE_CHALLENGES) {
    const slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const challenge = await Challenge.create({
      title: c.title,
      slug,
      description: c.description,
      category: c.category,
      difficulty: c.difficulty,
      points: c.points,
      flagHash: await hashFlag(c.flag),
      flagFormat: 'CTF{...}',
      author: admin._id,
      published: true,
    });
    if (c.hints.length > 0) {
      await Hint.insertMany(c.hints.map((h) => ({ ...h, challenge: challenge._id })));
    }
  }

  logger.info('Seed complete.');
  logger.info('--- Dev credentials (development only — never use in production) ---');
  logger.info(`Admin:  ${DEV_ADMIN.email} / ${DEV_ADMIN.password}`);
  for (const u of DEV_USERS) logger.info(`User:   ${u.email} / ${u.password}`);
  logger.info('----------------------------------------------------------------------');

  await disconnectDatabase();
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
