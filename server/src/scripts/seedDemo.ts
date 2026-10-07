/**
 * Demo seed data — ~15 original, fictional challenges across five
 * categories. The actual seeding logic (`seedDemoData`) is shared between
 * this CLI script (`npm run seed:demo`) and the admin-only, DEMO_MODE-only
 * reset endpoint (`services/demo.service.ts`), so both ever only differ in
 * how they find an admin to author the challenges with — never in what
 * gets seeded.
 *
 * Deliberately does NOT touch ADMIN accounts — only game-state
 * (challenges/hints/submissions/teams/writeups/reports) and USER accounts
 * get wiped/reseeded, so resetting demo data can never lock out whichever
 * admin is running the reset. No demo credentials are hardcoded — demo
 * player accounts, if any are created, come from the same `.env`-driven
 * convention as `seed.ts`.
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
import { hashFlag } from '../utils/flag.js';
import { logger } from '../utils/logger.js';

const DEMO_CATEGORY_SEED: Record<(typeof CATEGORY_SLUGS)[number], { name: string; description: string; icon: string }> = {
  web: { name: 'Web', description: 'Exploit vulnerabilities in web applications and APIs.', icon: 'globe' },
  crypto: { name: 'Crypto', description: 'Break ciphers and attack weak implementations.', icon: 'key' },
  forensics: { name: 'Forensics', description: 'Recover evidence from disks, memory, and traffic.', icon: 'fingerprint' },
  reverse: { name: 'Reverse Engineering', description: 'Disassemble binaries and reconstruct hidden logic.', icon: 'cpu' },
  pwn: { name: 'Pwn', description: 'Exploit memory corruption to gain control of a process.', icon: 'terminal' },
  osint: { name: 'OSINT', description: 'Trace targets using publicly available information.', icon: 'satellite' },
  cloud: { name: 'Cloud', description: 'Attack misconfigured cloud infrastructure and IAM.', icon: 'cloud' },
  mobile: { name: 'Mobile', description: 'Reverse and exploit Android and iOS applications.', icon: 'smartphone' },
};

interface DemoChallengeSeed {
  title: string;
  category: 'web' | 'crypto' | 'forensics' | 'reverse' | 'osint';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
  points: number;
  description: string;
  flag: string;
  hints: { title: string; content: string; cost: number; order: number }[];
}

export const DEMO_CHALLENGES: DemoChallengeSeed[] = [
  // Web
  {
    title: 'Shadow Login',
    category: 'web',
    difficulty: 'MEDIUM',
    points: 300,
    description: 'The staging login endpoint trusts a client-signed session cookie a little too much. Recover access without valid credentials.',
    flag: 'CTF{jwt_alg_none_was_a_mistake}',
    hints: [{ title: 'Where to look', content: 'Inspect how the JWT header algorithm is validated server-side.', cost: 25, order: 0 }],
  },
  {
    title: 'Open Door Policy',
    category: 'web',
    difficulty: 'EASY',
    points: 150,
    description: 'An internal admin panel was deployed without checking who is actually an admin. Find your way in.',
    flag: 'CTF{security_through_obscurity_isnt}',
    hints: [{ title: 'First step', content: 'The link to the panel is never shown in the UI — that does not mean it does not exist.', cost: 15, order: 0 }],
  },
  {
    title: 'Query of Shadows',
    category: 'web',
    difficulty: 'HARD',
    points: 450,
    description: 'A search feature builds its database query from unescaped user input. Extract the flag hidden in another table.',
    flag: 'CTF{union_select_wins_again}',
    hints: [{ title: 'Classic technique', content: 'Count the columns before you try to union anything in.', cost: 40, order: 0 }],
  },
  // Crypto
  {
    title: 'Broken Cipher',
    category: 'crypto',
    difficulty: 'HARD',
    points: 450,
    description: 'A custom stream cipher reuses its keystream. Recover the plaintext from two intercepted ciphertexts.',
    flag: 'CTF{keystream_reuse_breaks_everything}',
    hints: [{ title: 'Classic weakness', content: 'XOR the two ciphertexts together — what cancels out?', cost: 40, order: 0 }],
  },
  {
    title: 'Repeating Signal',
    category: 'crypto',
    difficulty: 'EASY',
    points: 150,
    description: 'A message was encrypted with a short repeating-key XOR. The key is only three characters long.',
    flag: 'CTF{xor_keys_should_be_longer}',
    hints: [{ title: 'Known plaintext', content: 'You know the flag starts with "CTF{" — use that to recover part of the key.', cost: 20, order: 0 }],
  },
  {
    title: 'Small Exponent',
    category: 'crypto',
    difficulty: 'MEDIUM',
    points: 300,
    description: 'An RSA implementation uses a dangerously small public exponent with no padding. Recover the plaintext.',
    flag: 'CTF{cube_roots_are_not_safe}',
    hints: [{ title: 'Think small', content: 'If the message is small enough relative to the modulus, a direct root works.', cost: 30, order: 0 }],
  },
  // Forensics
  {
    title: 'Memory Trace',
    category: 'forensics',
    difficulty: 'EASY',
    points: 150,
    description: 'A process was killed before it could clean up after itself. Recover the deleted artifact from the provided memory dump.',
    flag: 'CTF{volatility_finds_everything}',
    hints: [],
  },
  {
    title: 'Hidden in Plain Sight',
    category: 'forensics',
    difficulty: 'MEDIUM',
    points: 300,
    description: 'An image file is larger than it should be for its visible content. Something else is appended to it.',
    flag: 'CTF{file_signatures_dont_lie}',
    hints: [{ title: 'Start here', content: 'Check what comes after the image format\'s own end-of-file marker.', cost: 25, order: 0 }],
  },
  {
    title: 'Deleted but Not Gone',
    category: 'forensics',
    difficulty: 'MEDIUM',
    points: 300,
    description: 'A suspect claims they deleted the evidence. The filesystem disagrees. Recover it from the provided disk image.',
    flag: 'CTF{deletion_is_not_destruction}',
    hints: [{ title: 'Think structurally', content: 'Deleting a file usually just removes its directory entry, not its data.', cost: 30, order: 0 }],
  },
  // Reverse Engineering
  {
    title: 'Password Check',
    category: 'reverse',
    difficulty: 'EASY',
    points: 200,
    description: 'A small binary asks for a password before printing the flag. Find out what it wants.',
    flag: 'CTF{static_analysis_works_fine}',
    hints: [{ title: 'Approach', content: 'You do not need to run it under a debugger — reading the comparison logic is enough.', cost: 20, order: 0 }],
  },
  {
    title: 'Obfuscated Logic',
    category: 'reverse',
    difficulty: 'HARD',
    points: 500,
    description: 'The real validation logic is buried under several layers of control-flow obfuscation. Untangle it.',
    flag: 'CTF{control_flow_is_not_security}',
    hints: [{ title: 'Simplify first', content: 'Identify the loop that actually mutates the input before worrying about the rest.', cost: 50, order: 0 }],
  },
  {
    title: 'Packed Away',
    category: 'reverse',
    difficulty: 'MEDIUM',
    points: 350,
    description: 'The binary unpacks itself at runtime before doing anything interesting. Get past the packer.',
    flag: 'CTF{unpacking_is_half_the_battle}',
    hints: [{ title: 'Where to breakpoint', content: 'Look for the jump to the newly-written memory region after unpacking finishes.', cost: 35, order: 0 }],
  },
  // OSINT
  {
    title: 'Digital Footprint',
    category: 'osint',
    difficulty: 'EASY',
    points: 100,
    description: 'Trace an online persona across public platforms to recover the flag hidden in an old post.',
    flag: 'CTF{the_internet_never_forgets}',
    hints: [{ title: 'Start here', content: 'Check archived snapshots of the profile, not just the live page.', cost: 10, order: 0 }],
  },
  {
    title: 'Metadata Trail',
    category: 'osint',
    difficulty: 'MEDIUM',
    points: 250,
    description: 'A photo posted publicly still carries its original metadata. Use it to locate the flag.',
    flag: 'CTF{exif_data_says_a_lot}',
    hints: [{ title: 'Where to look', content: 'Check the embedded metadata, not just what\'s visible in the image itself.', cost: 25, order: 0 }],
  },
  {
    title: 'Conference Badge',
    category: 'osint',
    difficulty: 'EASY',
    points: 150,
    description: 'A conference speaker list and a few public social profiles are all you need to find the flag.',
    flag: 'CTF{public_profiles_add_up}',
    hints: [],
  },
];

/**
 * Wipes and reseeds everything a demo instance's game state covers —
 * categories, challenges, hints, submissions, teams, writeups, reports,
 * and non-admin user accounts. Never touches ADMIN accounts (so the
 * caller's own session, and any other admin, always survives a reset).
 */
export async function seedDemoData(authorId: string): Promise<void> {
  logger.info('Clearing existing demo game state...');
  await Promise.all([
    Category.deleteMany({}),
    Challenge.deleteMany({}),
    Hint.deleteMany({}),
    Submission.deleteMany({}),
    Team.deleteMany({}),
    Writeup.deleteMany({}),
    Report.deleteMany({}),
    User.deleteMany({ role: 'USER' }),
  ]);

  logger.info('Seeding demo categories...');
  await Category.insertMany(CATEGORY_SLUGS.map((slug) => ({ slug, ...DEMO_CATEGORY_SEED[slug], active: true })));

  logger.info('Seeding demo challenges...');
  for (const c of DEMO_CHALLENGES) {
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
      author: authorId,
      status: 'PUBLISHED',
    });
    if (c.hints.length > 0) {
      await Hint.insertMany(c.hints.map((h) => ({ ...h, challenge: challenge._id })));
    }
  }

  logger.info(`Demo seed complete — ${DEMO_CHALLENGES.length} challenges across 5 categories.`);
}

async function main() {
  await connectDatabase();

  const admin = await User.findOne({ role: 'ADMIN' });
  if (!admin) {
    logger.error(
      'No admin account exists yet. Run the first-run setup wizard (or `npm run seed`) to create one before seeding demo data.',
    );
    process.exit(1);
  }

  await seedDemoData(admin.id);
  await disconnectDatabase();
}

// Only run as a CLI entrypoint — `services/demo.service.ts` imports
// `seedDemoData` directly without triggering this.
if (process.argv[1]?.endsWith('seedDemo.ts') || process.argv[1]?.endsWith('seedDemo.js')) {
  main().catch((err) => {
    logger.error({ err }, 'Demo seed failed');
    process.exit(1);
  });
}
