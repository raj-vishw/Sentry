import { useEffect } from 'react';

const SUFFIX = ' — Sentry';

/** Sets `document.title` for the life of the calling page, restoring the
 * previous title on unmount — no new dependency (see useFocusTrap for the
 * same hand-roll-over-dependency convention). */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title}${SUFFIX}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
