import dripManifest from '../data/drip_manifest.json';

// In-memory Map of URL path -> drip_day bundled at build time (Zero Node fs dependency)
const urlDripDayMap = new Map();
for (const entry of dripManifest) {
  urlDripDayMap.set(entry.url, entry.drip_day);
}

/**
 * Calculates current drip day dynamically based on LAUNCH_DATE env var.
 * If LAUNCH_DATE is unset or in the future, defaults to Day 1 (100 URLs launch gate).
 * Format expected: YYYY-MM-DD or ISO 8601 string.
 */
export function getCurrentDripDay(runtimeEnv) {
  const launchDateStr = runtimeEnv?.LAUNCH_DATE || 
                        (typeof import.meta !== 'undefined' && import.meta.env?.LAUNCH_DATE) || 
                        (typeof process !== 'undefined' ? process.env?.LAUNCH_DATE : undefined);

  if (!launchDateStr) {
    return 1;
  }

  const launchTime = new Date(launchDateStr).getTime();
  if (isNaN(launchTime)) {
    return 1;
  }

  const now = Date.now();
  if (now < launchTime) {
    return 1;
  }

  // 1-based drip day: Day 1 on launch date, Day 2 at launch + 24h, etc.
  const daysElapsed = Math.floor((now - launchTime) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, daysElapsed);
}

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

  // 3. Dynamic Drip Enforcement (§6):
  // Check if requested path is in the active dripped batch based on LAUNCH_DATE.
  // Static assets, api routes, and root are always active.
  const isSystemPath = pathname === '/' || 
                       pathname.startsWith('/_') || 
                       pathname.startsWith('/favicon') ||
                       pathname.startsWith('/robots.txt') ||
                       pathname.startsWith('/sitemap') ||
                       pathname.startsWith('/api/');

  let isDripped = isSystemPath;

  if (!isDripped) {
    const dripDay = urlDripDayMap.get(pathname);
    if (dripDay !== undefined) {
      const currentDay = getCurrentDripDay(context.locals?.runtime?.env);
      isDripped = dripDay <= currentDay;
    } else {
      isDripped = false;
    }
  }

  // Wire drip flag directly into Astro context locals for templates
  context.locals.isDripped = isDripped;

  // Execute request
  const response = await next();

  // If the path is NOT in the active drip manifest, enforce X-Robots-Tag header
  if (!isDripped) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  // 4. Edge Caching for HTML Responses (Target TTFB <500ms):
  // Configure Cloudflare edge caching using s-maxage and stale-while-revalidate
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
