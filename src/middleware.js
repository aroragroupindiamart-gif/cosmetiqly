import { getCurrentDripDay, isUrlDripped } from './lib/drip.js';

export { getCurrentDripDay };

export async function onRequest(context, next) {
  const url = new URL(context.request.url);
  const hostname = url.hostname;
  const pathname = url.pathname;

  // 1. Redirect www to apex domain
  if (hostname.startsWith('www.')) {
    const apexHost = hostname.replace('www.', '');
    url.hostname = apexHost;
    return Response.redirect(url.toString(), 301);
  }

  // 2. Normalize trailing slash (e.g. /terms/ -> /terms) except for root /
  if (pathname.length > 1 && pathname.endsWith('/')) {
    url.pathname = pathname.slice(0, -1);
    return Response.redirect(url.toString(), 301);
  }

  // 3. Dynamic Drip Enforcement (§6 + §6.2 prune):
  const isSystemPath = pathname === '/' ||
    pathname.startsWith('/_') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/api/');

  let isDripped = isSystemPath;
  if (!isDripped) {
    const currentDay = getCurrentDripDay(context.locals?.runtime?.env);
    isDripped = isUrlDripped(pathname, currentDay);
  }

  context.locals.isDripped = isDripped;

  const response = await next();

  if (!isDripped) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  // 4. Edge Caching for HTML Responses
  if (context.request.method === 'GET' && response.status === 200) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      if (isDripped) {
        response.headers.set(
          'Cache-Control',
          'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
        );
      } else {
        response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=300');
      }
    }
  }

  return response;
}
