import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/utils';

/**
 * No typography plugin is installed, so markdown elements are styled
 * directly here via `components` overrides — the design-token classes match
 * the rest of the app rather than a generic prose stylesheet.
 *
 * Security note: this intentionally never enables a raw-HTML plugin (e.g.
 * `rehype-raw`). react-markdown without one never interprets embedded
 * `<script>`/`<iframe>`/event-handler HTML as markup — it's rendered as
 * inert text — which is the actual XSS defense for user-submitted content
 * (writeups, challenge descriptions), not a sanitizer bolted on afterward.
 */
const MARKDOWN_COMPONENTS: Components = {
  h1: (props) => <h2 className="mt-6 font-display text-xl font-bold text-[var(--color-text-primary)] first:mt-0" {...props} />,
  h2: (props) => <h3 className="mt-6 font-display text-lg font-bold text-[var(--color-text-primary)] first:mt-0" {...props} />,
  h3: (props) => <h4 className="mt-5 font-display text-base font-semibold text-[var(--color-text-primary)] first:mt-0" {...props} />,
  p: (props) => <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] first:mt-0" {...props} />,
  ul: (props) => <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]" {...props} />,
  ol: (props) => <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]" {...props} />,
  a: (props) => <a className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]" target="_blank" rel="noreferrer noopener" {...props} />,
  blockquote: (props) => (
    <blockquote className="mt-3 border-l-2 border-[var(--color-accent)]/40 pl-4 text-sm italic text-[var(--color-text-muted)]" {...props} />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className={cn('block overflow-x-auto font-mono text-xs text-[var(--color-text-primary)]', className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-[var(--color-surface-elevated)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--color-accent)]" {...props}>
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre className="mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4" {...props} />
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return <ReactMarkdown components={MARKDOWN_COMPONENTS}>{content}</ReactMarkdown>;
}
