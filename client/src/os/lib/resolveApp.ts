import { matchPath } from 'react-router-dom';
import { APP_REGISTRY } from '../apps/registry';

export interface ResolvedApp {
  appId: string;
  params: Record<string, string>;
}

/** Maps the current URL to the app + params it represents, if any. */
export function resolveAppFromPath(pathname: string): ResolvedApp | null {
  for (const app of Object.values(APP_REGISTRY)) {
    if (!app.routePattern) continue;
    const match = matchPath(app.routePattern, pathname);
    if (!match) continue;

    const params: Record<string, string> = {};
    if (app.id === 'laboratory' && match.params.slug) params.slug = match.params.slug;
    if (app.id === 'admin') params.section = pathname;
    return { appId: app.id, params };
  }
  return null;
}
