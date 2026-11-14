import activeUrls from '../data/drip_active_urls.json';

// In-memory Set of active dripped paths bundled at build time (Zero Node fs dependency)
const activePathsSet = new Set(activeUrls);

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

  // 3. Drip Enforcement (§6):
  // Check if requested path is in the active dripped batch.
  // Static assets, api routes, and root are always active.
  const isDripped = activePathsSet.has(pathname) || 
                    pathname === '/' || 
                    pathname.startsWith('/_') || 
                    pathname.startsWith('/favicon') ||
                    pathname.startsWith('/robots.txt') ||
                    pathname.startsWith('/sitemap');

  // Wire drip flag directly into Astro context locals for templates
  context.locals.isDripped = isDripped;

  // Execute request
  const response = await next();

  // If the path is NOT in the active drip manifest, enforce X-Robots-Tag header
  if (!isDripped) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}
