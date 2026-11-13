import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory Set of dripped paths loaded at startup
let drippedPathsSet = null;

function getDrippedPaths() {
  if (!drippedPathsSet) {
    try {
      const manifestPath = path.join(__dirname, '../data/drip_manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        drippedPathsSet = new Set(manifest.map(m => m.url));
      } else {
        drippedPathsSet = new Set();
      }
    } catch (e) {
      drippedPathsSet = new Set();
    }
  }
  return drippedPathsSet;
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

  // 3. Drip Enforcement (§6):
  // Check if requested path is in the dripped manifest.
  // If not dripped, inject header to instruct Layout to serve `noindex, follow` (HTTP 200).
  const dripped = getDrippedPaths();
  const isDripped = dripped.has(pathname) || pathname === '/' || pathname.startsWith('/_') || pathname.startsWith('/api/');

  context.locals.isDripped = isDripped;

  const response = await next();

  if (!isDripped && response.status === 200) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}
