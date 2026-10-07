import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

// Where the repo's docs/ folder lives — see env.ts's DOCS_DIR comment for
// why bare-metal dev and Docker need different defaults.
const DOCS_DIR = env.DOCS_DIR || path.resolve(process.cwd(), '../docs');

export interface DocNavItem {
  slug: string;
  title: string;
}

export interface DocNavGroup {
  label: string;
  items: DocNavItem[];
}

interface DocEntry {
  title: string;
  file: string;
}

// The one and only mapping from a public slug to a real file — a client
// never supplies a file path, only a slug looked up here, so there is no
// path-traversal surface at all, by construction (not by sanitization).
const DOC_GROUPS: { label: string; entries: Record<string, DocEntry> }[] = [
  {
    label: 'Getting Started',
    entries: {
      'getting-started': { title: 'Getting Started', file: 'getting-started.md' },
      'creating-a-ctf': { title: 'Creating a CTF', file: 'creating-a-ctf.md' },
      walkthrough: { title: 'Walkthrough', file: 'walkthrough.md' },
    },
  },
  {
    label: 'Deployment',
    entries: {
      'self-hosting': { title: 'Self-Hosting', file: 'deployment/self-hosting.md' },
      configuration: { title: 'Configuration', file: 'configuration.md' },
      backups: { title: 'Backups', file: 'backups.md' },
    },
  },
  {
    label: 'Customization',
    entries: {
      customization: { title: 'Customization', file: 'customization.md' },
    },
  },
  {
    label: 'Challenges',
    entries: {
      'creating-a-challenge': { title: 'Creating a Challenge', file: 'challenges/creating-a-challenge.md' },
      'challenge-types': { title: 'Challenge Types', file: 'challenges/challenge-types.md' },
      'challenge-packages': { title: 'Challenge Package Format', file: 'challenges/challenge-packages.md' },
      importing: { title: 'Importing', file: 'challenges/importing.md' },
      exporting: { title: 'Exporting', file: 'challenges/exporting.md' },
      'interactive-challenges': { title: 'Interactive Challenges', file: 'challenges/interactive-challenges.md' },
    },
  },
  {
    label: 'Administration',
    entries: {
      'administration-overview': { title: 'Administration Overview', file: 'administration/overview.md' },
    },
  },
  {
    label: 'Architecture',
    entries: {
      'architecture-overview': { title: 'Architecture Overview', file: 'architecture/overview.md' },
      'architecture-storage': { title: 'Storage', file: 'architecture/storage.md' },
      'architecture-challenge-runtime': { title: 'Challenge Runtime', file: 'architecture/challenge-runtime.md' },
    },
  },
  {
    label: 'Security',
    entries: {
      security: { title: 'Security', file: 'security.md' },
    },
  },
  {
    label: 'Contributing',
    entries: {
      contributing: { title: 'Contributing', file: 'contributing.md' },
    },
  },
];

const SLUG_INDEX = new Map<string, DocEntry>();
for (const group of DOC_GROUPS) {
  for (const [slug, entry] of Object.entries(group.entries)) {
    SLUG_INDEX.set(slug, entry);
  }
}

export function listDocs(): DocNavGroup[] {
  return DOC_GROUPS.map((group) => ({
    label: group.label,
    items: Object.entries(group.entries).map(([slug, entry]) => ({ slug, title: entry.title })),
  }));
}

export interface DocContent {
  slug: string;
  title: string;
  content: string;
}

export async function getDoc(slug: string): Promise<DocContent> {
  const entry = SLUG_INDEX.get(slug);
  if (!entry) throw AppError.notFound('Documentation page not found.');

  let content: string;
  try {
    content = await readFile(path.join(DOCS_DIR, entry.file), 'utf8');
  } catch {
    // The markdown file is missing on disk even though it's a known slug —
    // a deployment/packaging problem (e.g. the Docker build-context fix
    // wasn't applied), not something to leak a raw ENOENT for.
    throw AppError.notFound('Documentation page not found.');
  }

  return { slug, title: entry.title, content };
}
